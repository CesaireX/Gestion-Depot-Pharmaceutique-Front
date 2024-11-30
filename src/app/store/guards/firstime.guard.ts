import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../services/gestock-service/Auth.service";
import {UtilisateurService} from "../services/gestock-service/Utilisateur.service";
import {Utilisateur} from "../entities/gestock.entity";

@Injectable({
  providedIn: 'root'
})
export class FirstimeGuard implements CanActivate {
  utilisateurs: Utilisateur[] = [];
  constructor(private utilisateurService:UtilisateurService, private authService: AuthService,private router:Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    this.authService.findUsers();
    if(this.authService.userdisponoibles){
      return true;
    }else {
      this.router.navigate(['firstime'])
      return false;
    }
  }

}
