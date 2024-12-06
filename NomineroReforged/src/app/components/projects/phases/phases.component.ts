import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Phase } from '../../../models/phase.model'; // Modelo de fases
import { PhasesService } from '../../../services/phase.service'; // Servicio de fases
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { SnackbarService } from '../../../snackbar/snackbar';

@Component({
  selector: 'app-phases',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatIconModule,
  ],
  templateUrl: './phases.component.html',
  styleUrls: ['./phases.component.css']
})
export class PhasesComponent implements OnInit {
  phases: Phase[] = [];
  paginatedPhases: Phase[] = [];
  displayedColumns: string[] = ['id','id_phase', 'name', 'actions'];
  selectedPhase: Phase | null = null;
  phaseForm: FormGroup;

  // Paginación
  pageSize = 5;
  currentPage = 0;
  totalPhases = 0;

  constructor(
    private fb: FormBuilder,
    private phasesService: PhasesService,
    private snackbar: SnackbarService
  ) {
    this.phaseForm = this.fb.group({
      id_phase: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPhases();
  }

  loadPhases(): void {
    this.phasesService.getAllPhases().subscribe(
      (phases) => {
        this.phases = phases;
        this.totalPhases = phases.length;
        this.updatePaginatedPhases();
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        this.snackbar.openSnackbar(
          'Error al cargar usuario',
          'snackbar-danger',
          3000
        );
      }
    );
  }

  selectPhase(phase: Phase): void {
    this.selectedPhase = phase;
    this.phaseForm.setValue({
      id_phase: phase.id_phase,
      name: phase.name,
    });
  }

  savePhase(): void {
    if (this.phaseForm.valid) {
      if (this.selectedPhase) {
        // Actualizar cliente
        this.phasesService
          .updatePhase(this.selectedPhase?.id!, this.phaseForm.value)
          .subscribe(
            (response) => {
              console.log('Cliente actualizado:', response);
              this.snackbar.openSnackbar(
                'Cliente actualizado',
                'snackbar-success',
                3000
              );
            },
            (error) => {
              console.error('Error al actualizar usuario:', error);
              this.snackbar.openSnackbar(
                'Error al actualizar usuario',
                'snackbar-danger',
                3000
              );
            }
          );
      } else {
        // Crear nuevo cliente
        this.phasesService.createPhase(this.phaseForm.value!).subscribe(
          (response) => {
            console.log('Cliente creado:', response);
            this.snackbar.openSnackbar(
              'Cliente creado',
              'snackbar-success',
              3000
            );
          },
          (error) => {
            console.error('Error al actualizar usuario:', error);
            this.snackbar.openSnackbar(
              'Error al crear cliente',
              'snackbar-danger',
              3000
            );
          }
        );
      }
      this.clearSelection();
      this.loadPhases();
    }
  }

  deleteClient(phaseId: number): void {
    this.phasesService.deletePhase(phaseId).subscribe(
      (response) => {
        console.log('Cliente borrado:', response);
        this.snackbar.openSnackbar('Cliente borrado', 'snackbar-success', 3000);
        this.loadPhases();
      },
      (error) => {
        console.error('Error al actualizar usuario:', error);
        this.snackbar.openSnackbar(
          'Error al crear cliente',
          'snackbar-danger',
          3000
        );
      }
    );
  }

  addNewPhase(): void {
    this.clearSelection();
    this.phaseForm.reset();
  }

  clearSelection(): void {
    this.selectedPhase = null;
    this.phaseForm.reset();
  }

  updatePaginatedPhases(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.phases.length);
    this.paginatedPhases = this.phases.slice(startIndex, endIndex);
  }

  // Evento de cambio de página
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedPhases();
  }
}
