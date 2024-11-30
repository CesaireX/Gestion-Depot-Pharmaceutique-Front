import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Entree_stockComponent } from './entree_stock.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: Entree_stockComponent }
	])],
	exports: [RouterModule]
})
export class Entree_stockRoutingModule { }
