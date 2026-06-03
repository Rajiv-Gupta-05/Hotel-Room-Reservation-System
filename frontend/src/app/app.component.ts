import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component – acts as the application shell.
 * All page content is rendered through the <router-outlet>.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
