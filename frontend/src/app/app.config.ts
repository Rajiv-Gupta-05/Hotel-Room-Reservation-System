import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

/**
 * Root application configuration.
 * Registers global providers: router, HTTP client (with JWT interceptor),
 * and Angular animations.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // The jwtInterceptor automatically attaches the Bearer token to every request
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations(),
  ],
};
