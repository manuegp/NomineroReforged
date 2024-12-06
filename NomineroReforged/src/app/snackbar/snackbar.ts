import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root', // Disponible globalmente en la aplicación
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Abre un snackbar con un mensaje y estilo personalizados.
   * @param message Mensaje a mostrar en el snackbar.
   * @param style Clase CSS personalizada para estilizar el snackbar.
   * @param duration Duración del snackbar en milisegundos (opcional, por defecto 3000 ms).
   */
  openSnackbar(message: string, style: string = '', duration: number = 3000): void {
    
    const config: MatSnackBarConfig = {
      
      duration,
      horizontalPosition: 'end',
      verticalPosition:'bottom',
      panelClass: style ? [style] : [],
    };
    this.snackBar.open(message, undefined, config);
  }
}
