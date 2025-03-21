import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../services/gestock-service/Auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate{

    constructor(private authService: AuthService, private router:Router) {
    }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if(this.authService.isAuthenticated){
            return true;
        }else {
            this.router.navigateByUrl("auth/login")
            return false;
        }
  }

}
