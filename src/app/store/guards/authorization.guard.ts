import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../services/gestock-service/Auth.service";
import {TokenStorage} from "../storage/tokenStorage";

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {
    constructor(private authService:AuthService, private router:Router,private tokenStorage: TokenStorage,
    ) {
    }
    canActivate(
        route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const rolesRequis = route.data['roles'];
        if (!rolesRequis || !Array.isArray(rolesRequis)) {
            return false; // ou une autre logique de gestion d'erreur
        }
        // @ts-ignore
        const aDroit = rolesRequis.some((role: any) => this.tokenStorage.getdroits() && this.tokenStorage.getdroits().includes(role));

        if (aDroit) {
            return true;
        } else {
            this.router.navigateByUrl("gestock/notauthorize");
            return false;
        }
    }

}
