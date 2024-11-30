import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', data: {breadcrumb: 'List'}, loadChildren: () => import('./list/entreelist.module').then(m => m.EntreelistModule) },
        { path: 'create', data: {breadcrumb: 'Create'}, loadChildren: () => import('./create/entree_stock.module').then(m => m.Entree_stockModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class Entree_stockRoutingModule { }
