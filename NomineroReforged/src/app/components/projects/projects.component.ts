import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, MatTabsModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  activeTabIndex: number = 0;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Escuchar cambios en la URL para actualizar la pestaña activa
    this.route.url.subscribe(() => {
      const currentRoute = this.route.firstChild?.snapshot.url[0]?.path || 'list';
      this.activeTabIndex = this.getTabIndexFromRoute(currentRoute);
    });
  }

  onTabChange(index: number): void {
    const route = this.getRouteFromTabIndex(index);
    this.router.navigate(['./', route], { relativeTo: this.route });
  }

  private getTabIndexFromRoute(route: string): number {
    switch (route) {
      case 'list':
        return 0;
      case 'types':
        return 1;
      case 'phases':
        return 2;
      default:
        return 0; // Por defecto, selecciona la primera pestaña
    }
  }

  private getRouteFromTabIndex(index: number): string {
    switch (index) {
      case 0:
        return 'list';
      case 1:
        return 'types';
      case 2:
        return 'phases';
      default:
        return 'list';
    }
  }
}
