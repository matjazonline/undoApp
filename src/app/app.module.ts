import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {NglModule, provideNglConfig} from "ng-lightning/ng-lightning";
import { EllipsisPipe } from './ellipsis.pipe';
import {SimpleRxStoreModule} from "./simple-rx-store/simple-rx-store.module";
import {AppState} from "./AppState";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NglModule,

    SimpleRxStoreModule
  ],
  declarations: [
    AppComponent,
    EllipsisPipe
  ],
  providers: [provideNglConfig(), AppState],
  bootstrap: [AppComponent]
})
export class AppModule { }
