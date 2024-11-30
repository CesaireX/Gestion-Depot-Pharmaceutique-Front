import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';

import {SharedCommonsModule} from "./shared-commons.module";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {TableModule} from "primeng/table";
import {DialogModule} from "primeng/dialog";
import {ToolbarModule} from "primeng/toolbar";
import {InputTextModule} from "primeng/inputtext";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AppHttpInterceptor} from "./store/interceptors/app-http.interceptor";
import { ColorPickerModule } from 'primeng/colorpicker';
import { TooltipModule } from 'primeng/tooltip';
import {OverlayPanelModule} from "primeng/overlaypanel";
import {ListboxModule} from "primeng/listbox";
@NgModule({
    declarations: [
        AppComponent,

    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        SharedCommonsModule,
        BrowserModule,
        BrowserAnimationsModule,
        ButtonModule,
        RippleModule,
        TableModule,
        DialogModule,
        ToolbarModule,
        InputTextModule,
        TooltipModule,
        OverlayPanelModule,
        ListboxModule,
        InputTextModule,
        ColorPickerModule],
    providers: [
        {provide : HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi:true}
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
