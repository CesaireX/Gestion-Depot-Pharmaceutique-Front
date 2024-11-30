import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import {ConnexionComponent} from "./pages/gestock/connexion/connexion.component";
import {AuthenticationGuard} from "./store/guards/authentication.guard";
import {ResetPsswdComponent} from "./pages/gestock/resetPsswd/resetPsswd.component";
import {DashboardSaasComponent} from "./pages/gestock/saas/dashboardsass.component";
import {AdministrationComponent} from "./pages/gestock/administration/administration.component";
const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled',
    useHash: false
};

const routes: Routes = [
    {
        path: '', component: AppLayoutComponent, canActivate:[AuthenticationGuard],
        children: [
            { path: '', redirectTo: 'gestock/dashboards', pathMatch: 'full' },
            { path: 'gestock/dashboards', component: DashboardSaasComponent },
            { path: 'gestock', data: { breadcrumb: 'GESTOCK' },
                loadChildren: () => import('./pages/gestock/gestock.module').then(m => m.GestockModule) }
        ]
    },
    { path: 'auth/login',  component: ConnexionComponent},
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, // Redirection vers '/connexion'
    {path:'auth/resetpwd', component:ResetPsswdComponent},
    { path: 'wizard', component: AdministrationComponent },
    { path: '**', redirectTo: '/notfound' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions,)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
