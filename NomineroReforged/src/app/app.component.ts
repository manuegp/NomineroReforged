import { Component } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nominero-reforged';
}


