import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sortie_stockRoutingModule } from './sortie_stock-routing.module';
import { StepsModule } from 'primeng/steps';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
    imports: [
        CommonModule,
        Sortie_stockRoutingModule,
        StepsModule,
        TabViewModule
    ],
    declarations: []
})
export class Sortie_stockModule { }
