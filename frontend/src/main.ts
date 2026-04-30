import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Register pt-BR locale so pipes (date, currency) and Material datepicker use Portuguese
registerLocaleData(localePtBr);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
