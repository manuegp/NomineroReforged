import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DayPilot,
  DayPilotCalendarComponent,
  DayPilotMonthComponent,
  DayPilotNavigatorComponent,
  DayPilotModule,
} from '@daypilot/daypilot-lite-angular';
import { RegistersService } from '../../services/registers.service';
import { ProjectService } from '../../services/projects.service';
import { Project } from '../../models/proyect.model';
import { AuthService } from '../../services/auth.service';
import { Phase } from '../../models/phase.model';
import { PhasesService } from '../../services/phase.service';
import { PhaseProject } from '../../models/phasesProject.model';
import { Register } from '../../models/register.model';
import { MatDialog } from '@angular/material/dialog';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { Action } from 'rxjs/internal/scheduler/Action';
import { SnackbarService } from '../../snackbar/snackbar';

@Component({
  selector: 'app-registers',
  standalone: true,
  imports: [CommonModule, DayPilotModule],
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.css'],
  providers: [RegistersService],
})
export class RegistersComponent implements AfterViewInit {
  @ViewChild('day') day!: DayPilotCalendarComponent;
  @ViewChild('week') week!: DayPilotCalendarComponent;
  @ViewChild('navigator') nav!: DayPilotNavigatorComponent;

  
  userId: number | null = null;
  projects: Project[] = [];
  phases: PhaseProject[] = [];
  events: DayPilot.EventData[] = [];
  date = DayPilot.Date.today();
  viewMode: 'Day' | 'Week' | 'Month' = 'Week';

  options = {
    okText: "Aceptar",
    cancelText: "Cancelar"
  };

  constructor(
    private registerService: RegistersService,
    private projectService: ProjectService,
    private phaseService: PhasesService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: SnackbarService
  ) {
    this.viewWeek();
  }
  ngAfterViewInit(): void {
    this.userId = this.authService.getUserId()!;
    this.loadProjectsAndPhases();
  }

  async loadProjectsAndPhases() {
    this.projectService
      .getProjectsFromEmployee(this.userId!)
      .subscribe((projects) => {
        this.projects = projects;
        this.loadPhases();
      });
  }

  openRegisterDialog(isNew: boolean, register?: any) {
    
    
    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      data: { projects: this.projects,phases: this.phases ,register },
      width: '70%',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.user = this.authService.getUserId();
          result.date = result.start;
        if (isNew) {
          
          this.registerService.addRegister(result).subscribe(()=>{
            this.snackbar.openSnackbar("Registro creado", "snackbar-success", 3000)
            this.loadEvents();
          });
        } else {
          this.registerService.updateRegister(result.id, result).subscribe(()=>{
            this.snackbar.openSnackbar("Registro actualizado", "snackbar-success", 3000)
            this.loadEvents();
        })
        }
      }
    });
  }

  async loadPhases() {
    const projectsId = this.projects.map((x) => x.id);
    this.phaseService.getPhasesByProjectsId(projectsId).subscribe({
      next: (phases) => {
        this.phases = phases;
        this.loadEvents();
        console.log('Phases loaded:', phases);
      },
      error: (err) => {
        console.error('Error loading phases:', err);
      },
    });
  }

  contextMenu = new DayPilot.Menu({
    items: [
      {
        text: 'Borrar',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          dp.events.remove(event);
        },
      },
      // {
      //   text: 'Editar...',
      //   onClick: async (args) => {
      //     const event = args.source;
      //     const dp = event.calendar;

      //     const modal = await DayPilot.Modal.prompt(
      //       'Edit event text:',
      //       event.data.text
      //     );
      //     dp.clearSelection();
      //     if (!modal.result) {
      //       return;
      //     }
      //     event.data.text = modal.result;
      //     dp.events.update(event);
      //   },
      // },
    ],
  });

  configNavigator: DayPilot.NavigatorConfig = {
    locale: "es-es",
    showMonths: 1,
    cellWidth: 45,
    cellHeight: 25,
    onVisibleRangeChanged: (args) => {
      this.loadEvents();
    },
  };

  resizeEvent(args:any){
    let data = args.e.data;
    data.time = this.calculateTimeDiff(args.newStart, args.newEnd)
    data.date = args.newStart;
     this.registerService.updateRegister(data.id, data).subscribe(()=>{
       this.snackbar.openSnackbar("Registro actualizado", "snackbar-success", 3000)
       this.loadEvents();
   })
  }

  selectTomorrow() {
    this.date = DayPilot.Date.today().addDays(1);
  }

  configDay: DayPilot.CalendarConfig = {
    timeFormat: 'Clock24Hours',
    durationBarVisible: false,
    contextMenu: this.contextMenu,
    locale: "es-es",
    onEventResize: this.resizeEvent.bind(this),
    onEventMoved: this.moveEvent.bind(this),
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this),
  };

  configWeek: DayPilot.CalendarConfig = {
    viewType: 'Week',
    timeFormat: 'Clock24Hours',
    durationBarVisible: false,
    contextMenu: this.contextMenu,
    locale: "es-es",
    onEventResize: this.resizeEvent.bind(this),
    onEventMoved: this.moveEvent.bind(this),
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this),
  };

  moveEvent(args:any){
    let register = args.e.data
    register.date = register.start;
     this.registerService.updateRegister(register.id, register).subscribe(()=>{
      this.snackbar.openSnackbar("Registro actualizado", "snackbar-success", 3000)
       this.loadEvents();
   })
  }

  loadEvents(): void {
    const from = this.nav.control.visibleStart();
    const to = this.nav.control.visibleEnd();
    this.registerService
      .getEvents(this.userId!, from, to)
      .subscribe(
        (result) =>
          (this.events = this.registerService.parseToEvents(
            result,
            this.phases,
            this.projects
          ))
      );
  }

  viewDay(): void {
    this.configNavigator.selectMode = 'Day';
    this.configDay.visible = true;
    this.configWeek.visible = false;
    // this.configMonth.visible = false;
  }

  viewWeek(): void {
    this.configNavigator.selectMode = 'Week';
    this.configDay.visible = false;
    this.configWeek.visible = true;
    // this.configMonth.visible = false;
  }

  viewMonth(): void {
    this.configNavigator.selectMode = 'Month';
    this.configDay.visible = false;
    this.configWeek.visible = false;
    // this.configMonth.visible = true;
  }

  changeDate(date: DayPilot.Date): void {
    this.configDay.startDate = date;
    this.configWeek.startDate = date;
    // this.configMonth.startDate = date;
  }

  validateDropdown(args: any) {
    if (!args.value) {
      args.valid = false;
      args.message = 'Valor requerido';
    }
  }

  validateDate(args: any) {
    const startDate = args.result.start;
    const endDate = args.result.end;
    if (!startDate || !endDate) {
      args.valid = false;
      args.message = 'Fecha requerido';
    } else if (startDate > endDate) {
      args.valid = false;
      args.message = 'La fecha de inicio no puede ser mayor a fin';
    }
  }

  async onTimeRangeSelected(args: any) {
   
    // const form = [
    //   {
    //     name: 'Proyecto',
    //     id: 'project',
    //     type: 'select',
    //     options: this.projects,
    //     onValidate: this.validateDropdown,
    //   },
    //   {
    //     name: 'Fase',
    //     id: 'phase',
    //     type: 'select',
    //     options: this.phases,
    //     onValidate: this.validateDropdown,
    //   },
    //   { name: 'Horas extras', id: 'is_extra', type: 'checkbox' },
    //   {
    //     name: 'Inicio',
    //     id: 'start',
    //     type: 'datetime',
    //     onValidate: this.validateDate,
    //     dateFormat: "yyyy-MM-dd", // Formato de la fecha
    //     timeFormat: "HH:mm", // Formato de la hora en 24 horas
    //   },
    //   { name: 'Fin', id: 'end', type: 'datetime', dateFormat: "yyyy-MM-dd", // Formato de la fecha
    //     timeFormat: "HH:mm", 
    //    },
    //   {
    //     name: 'Comentario',
    //     id: 'coment',
    //     type: 'textarea',
    //     onValidate: this.validateDropdown,
        
    //   }
    // ];

    // const modal = await DayPilot.Modal.form(form, {
    //   end: args.end,
    //   start: args.start,
      
    // }, this.options );
    // if (modal.canceled) {
    //   return;
    // }

    // // Mapea la información del modal al formato esperado por el backend
    // const parsedRegister: Omit<Register, 'id'> = {
    //   user: this.userId!, // ID del usuario actual
    //   project: modal.result.project, // ID del proyecto seleccionado
    //   phase: modal.result.phase, // ID de la fase seleccionada
    //   date: modal.result.start, // Fecha en formato 'YYYY-MM-DD'
    //   time: this.calculateTimeDiff(modal.result.start, modal.result.end), // Duración en horas
    //   is_extra: modal.result.is_extra, // Convertir a 0 o 1
    //   comment: modal.result.coment || '', // Comentario opcional
    //   created_by: this.userId!, // ID del usuario que crea el registro
    // };

    // // Enviar al backend
    // this.registerService.addRegister(parsedRegister).subscribe(() => {
    //   this.loadEvents(); // Recarga los eventos en el calendario
    //   args.control.clearSelection();
    // });
    let record: Register = {};
    record.start = args.start;
    record.end = args.end;
    record.time = new DayPilot.Duration(args.start, args.end).totalHours();
    this.openRegisterDialog(true, record);
  }


  async onEventClick(args: any) {
    // const form = [
    //   {
    //     name: 'Proyecto',
    //     id: 'project',
    //     type: 'select',
    //     options: this.projects,
    //     onValidate: this.validateDropdown,
    //   },
    //   {
    //     name: 'Fase',
    //     id: 'phase',
    //     type: 'select',
    //     options: this.phases,
    //     onValidate: this.validateDropdown,
    //   },
    //   { name: 'Horas extras', id: 'is_extra', type: 'checkbox' },
    //   {
    //     name: 'Inicio',
    //     id: 'start',
    //     type: 'datetime',
    //     onValidate: this.validateDate,
    //     dateFormat: "yyyy-MM-dd", // Formato de la fecha
    //     timeFormat: "HH:mm", // Formato de la hora en 24 horas
    //   },
    //   { name: 'Fin', id: 'end', type: 'datetime', dateFormat: "yyyy-MM-dd", // Formato de la fecha
    //     timeFormat: "HH:mm", 
    //    },
    //   {
    //     name: 'Comentario',
    //     id: 'coment',
    //     type: 'textarea',
    //     onValidate: this.validateDropdown,
        
    //   }, // Usa el campo "coment"
    // ];
    // const modal = await DayPilot.Modal.form(form, args.e.data, this.options);
    // if (modal.canceled) {
    //   return;
    // }
    // args.control.events.update(modal.result);
    this.openRegisterDialog(false, args.e.data);
  }

  onBeforeEventRender(args: any) {
    
    
    args.data.areas = [
      // Área de texto
      {
        left: 5, // Márgen izquierdo
        top: 20, // Márgen superior, desplazado para evitar solapamiento con los íconos
        width: 200, // Ancho del área de texto
        height: 20, // Altura del área de texto
        html: `<div style="color: white; font-size: 12px; overflow: hidden; text-align: left;">
                 Proyecto: ${this.registerService.getName(
                   this.projects,
                   args.data.project
                 )} <br> Fase: ${this.registerService.getName(
          this.phases,
          args.data.phase
        )}
               </div>`,
        action: 'None', // No se puede hacer clic
      },
      // Ícono de menú
      {
        top: 3,
        right: 3,
        width: 20,
        height: 20,
        html: '<i class="material-icons" style="color: white; font-size: 16px;">more_vert</i>',
        toolTip: 'Opciones',
        action: 'ContextMenu',
      },
      // Ícono de borrar
      {
        top: 3,
        right: 25,
        width: 20,
        height: 20,
        html: '<i class="material-icons" style="color: white; font-size: 16px;">delete_forever</i>',
        toolTip: 'Eliminar',
        action: 'None',
        onClick: async (args: any) => {
          
          this.registerService.deleteRegister(args.source.data.id).subscribe(()=>{
            this.snackbar.openSnackbar("Registro borrado", "snackbar-success", 3000)
            this.loadEvents();
          })
        },
      },
    ];
  }

  calculateTimeDiff(start: string | Date, end: string | Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffInMs = endDate.getTime() - startDate.getTime();
    return diffInMs / (1000 * 60 * 60); // Convertir de ms a horas
  }
}
