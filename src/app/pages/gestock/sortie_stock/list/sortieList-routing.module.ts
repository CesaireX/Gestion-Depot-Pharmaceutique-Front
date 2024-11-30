import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sortie_listComponent } from './sortie_list.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: Sortie_listComponent }
	])],
	exports: [RouterModule]
})
export class SortieListRoutingModule { }
