import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Type } from '../../../models/types.model';
import { Phase } from '../../../models/phase.model';
import { TypesService } from '../../../services/type.service';
import { PhasesService } from '../../../services/phase.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-types',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.css'],
})
export class TypesComponent implements OnInit {
  types: Type[] = [];
  phases: Phase[] = [];
  selectedPhases: Phase[] = [];
  filteredPhases: Phase[] = [];
  paginatedTypes: Type[] = [];
  displayedColumns: string[] = ['name', 'actions'];
  selectedType: Type | null = null;
  typeForm: FormGroup;

  pageSize = 5;
  currentPage = 0;
  totalTypes = 0;

  phaseFilterCtrl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private typesService: TypesService,
    private phasesService: PhasesService
  ) {
    this.typeForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTypes();
    this.loadPhases();

    this.phaseFilterCtrl.valueChanges.subscribe((value) => {
      this.filteredPhases = this.filterPhases(value || '');
    });
  }

  loadTypes(): void {
    this.typesService.getAllTypes().subscribe((types) => {
      this.types = types;
      this.totalTypes = types.length;
      this.updatePaginatedTypes();
    });
  }

  loadPhases(): void {
    this.phasesService.getAllPhases().subscribe((phases) => {
      this.phases = phases;
      this.filteredPhases = phases;
    });
  }

  selectType(type: Type): void {
    this.selectedType = type;
    this.selectedPhases = type.phases || [];
    this.typeForm.setValue({
      name: type.name,
    });
  }

  saveType(): void {
    if (this.typeForm.valid) {
      const typeData: Type = {
        ...this.typeForm.value,
        phases: this.selectedPhases,
      };
      if (this.selectedType) {
        // Update existing type
        this.typesService.updateType(this.selectedType.id!, typeData).subscribe(() => {
          this.loadTypes();
          this.resetForm();
        });
      } else {
        // Create new type
        this.typesService.createType(typeData).subscribe(() => {
          this.loadTypes();
          this.resetForm();
        });
      }
    }
  }

  deleteType(typeId: number): void {
    this.typesService.deleteType(typeId).subscribe(() => {
      this.resetForm();
      this.loadTypes();
    });
  }

  addPhase(event: MatAutocompleteSelectedEvent): void {
    const selectedPhase = event.option.value as Phase;
    if (!this.selectedPhases.find((phase) => phase.id === selectedPhase.id)) {
      this.selectedPhases.push(selectedPhase);
    }
    this.phaseFilterCtrl.setValue('');
  }

  removePhase(phase: Phase): void {
    this.selectedPhases = this.selectedPhases.filter((p) => p.id !== phase.id);
  }

  addNewType(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.selectedType = null;
    this.selectedPhases = [];
    this.typeForm.reset();
  }

  filterPhases(value: string): Phase[] {
    const filterValue = value.toLowerCase();
    return this.phases.filter((phase) =>
      phase.name!.toLowerCase().includes(filterValue)
    );
  }

  updatePaginatedTypes(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.types.length);
    this.paginatedTypes = this.types.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedTypes();
  }
}
