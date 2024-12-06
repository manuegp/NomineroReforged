import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { ClientsService } from '../../services/clients.service';
import { SnackbarService } from '../../snackbar/snackbar';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-clients',
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
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  paginatedClients: Client[] = [];
  displayedColumns: string[] = ['id', 'name', 'contact', 'actions'];
  selectedClient: Client | null = null;
  totalClients:number = 0;
  clientForm: FormGroup;

  // Paginación
  pageSize = 5;
  currentPage = 0;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientsService,
    private snackbar: SnackbarService
  ) {
    this.clientForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      contact: [''],
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(
      (clients) => {
        this.clients = clients;
        this.totalClients = clients.length;
        this.updatePaginatedClients();
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

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.clientForm.setValue({
      id: client.id,
      name: client.name,
      contact: client.contact,
    });
  }

  saveClient(): void {
    if (this.clientForm.valid) {
      if (this.selectedClient) {
        // Actualizar cliente
        this.clientService
          .updateClient(this.selectedClient.id!, this.clientForm.value)
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
        this.clientService.createClient(this.clientForm.value!).subscribe(
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
      this.loadClients();
    }
  }

  deleteClient(clientId: number): void {
    this.clientService.deleteClient(clientId).subscribe(
      (response) => {
        console.log('Cliente borrado:', response);
        this.snackbar.openSnackbar('Cliente borrado', 'snackbar-success', 3000);
        this.loadClients();
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

  addNewClient(): void {
    this.clearSelection();
    this.clientForm.reset();
  }

  clearSelection(): void {
    this.selectedClient = null;
    this.clientForm.reset();
  }

  // Paginación: actualizar clientes mostrados
  updatePaginatedClients(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.clients.length);
    this.paginatedClients = this.clients.slice(startIndex, endIndex);
  }

  // Evento de cambio de página
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedClients();
  }
}
