import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  TuiButton,
  TuiDropdown,
  TuiDropdownManual,
  TuiIcon,
  TuiLink,
  TuiRoot,
} from '@taiga-ui/core';
import { TuiHeaderComponent, TuiNavComponent } from '@taiga-ui/layout';

@Component({
  imports: [
    RouterModule,
    TuiRoot,
    TuiHeaderComponent,
    TuiNavComponent,
    TuiLink,
    TuiButton,
    TuiDropdown,
    TuiDropdownManual,
    TuiIcon,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected drawerOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.drawerOpen.update(open => !open);
  }

  protected closeMobileMenu(): void {
    this.drawerOpen.set(false);
  }
}
