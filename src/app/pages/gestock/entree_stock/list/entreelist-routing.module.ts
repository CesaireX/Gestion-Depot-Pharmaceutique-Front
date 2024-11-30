import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Entree_listComponent } from './entree_list.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: Entree_listComponent }
	])],
	exports: [RouterModule]
})
export class EntreelistRoutingModule { }
