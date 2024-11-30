import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sortie_stockComponent } from './sortie_stock.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: Sortie_stockComponent }
    ])],
    exports: [RouterModule]
})
export class Sortie_stockRoutingModule { }
