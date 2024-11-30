import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AuthService} from "./store/services/gestock-service/Auth.service";
import {TokenStorage} from "./store/storage/tokenStorage";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
title="G-STOCK";
    constructor(private primengConfig: PrimeNGConfig, private authService:AuthService,
    public tokenStorage: TokenStorage) { }

    ngOnInit(): void {
        this.primengConfig.ripple = true;
        if(this.tokenStorage.getusernameonload()!=null){
            this.authService.loadJwtTokenFromStorage();
        }
    }

}
