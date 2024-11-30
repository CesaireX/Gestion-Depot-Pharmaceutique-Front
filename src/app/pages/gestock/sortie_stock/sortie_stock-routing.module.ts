import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', data: {breadcrumb: 'List'}, loadChildren: () => import('./list/sortieList.module').then(m => m.SortieListModule) },
        { path: 'create', data: {breadcrumb: 'Create'}, loadChildren: () => import('./create/sortie_stock.module').then(m => m.Sortie_stockModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class Sortie_stockRoutingModule { }
