import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PhaseProject } from '../../../models/phasesProject.model';
import { Project } from '../../../services/projects.service';

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.css']
})
export class RegisterDialogComponent implements OnInit {
  registerForm!: FormGroup;
  filteredPhases: PhaseProject[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projects: Project[], phases: PhaseProject[], register: any }
  ) {}

  ngOnInit(): void {
    // Inicializar el formulario reactivo
    
    // Inicializar el formulario reactivo
    this.registerForm = this.fb.group({
      id: this.data.register?.id, 
      project: [this.data.register?.project || '', Validators.required],
      phase: [this.data.register?.phase || '', Validators.required],
      is_extra: [this.data.register?.isExtra || false],
      start: [this.data.register?.start || '', Validators.required],
      time: [this.data.register?.time || '', [Validators.required, Validators.min(0), Validators.max(8)]],
      coment: [this.data.register?.coment || '', Validators.required],
    });

    // Cargar las fases correspondientes al proyecto inicial
    this.updatePhases(this.registerForm.get('project')?.value);

    // Suscribirse a los cambios en el campo 'project' para actualizar las fases
    this.registerForm.get('project')?.valueChanges.subscribe((projectId) => {
      this.updatePhases(projectId);
      // Reiniciar el campo 'phase' cuando se cambia el proyecto
      this.registerForm.get('phase')?.setValue(this.filteredPhases[0].id);
    });
  }

  updatePhases(projectId: string): void {
    // Convertir projectId a número
    const numericProjectId = +projectId;
  
    // Filtrar las fases que corresponden al proyecto seleccionado
    this.filteredPhases = this.data.phases.filter(phase => phase.projectId === numericProjectId);
  }
  

  save(): void {
    if (this.registerForm.valid) {
      const formData = { ...this.registerForm.value };
  
      // Asegúrate de formatear el campo 'start' antes de enviarlo
      const date = new Date(formData.start)
      date.setHours(date.getHours() + 1);
      formData.start = date.toISOString().slice(0, 19);
      
      this.dialogRef.close(formData);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
  

  cancel(): void {
    this.dialogRef.close();
  }
}