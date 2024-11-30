import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import CryptoJS from 'crypto-js';
@Injectable({
    providedIn: 'root'
})
export class TokenStorage {

    TOKEN_KEY = 'ESCAPE';
    ROLE_KEY = 'CHEKSTYLE';
    DROITS_KEY = 'ATEMPS';
    USERNAME = 'TESTTRY';
    SOCIETY_KEY = 'UNDERGROUND';
    SOCIETY_NAME = 'LOWERCASE';


    constructor(private router: Router) {
    }

    public getToken(){
        let value = window.localStorage.getItem(this.TOKEN_KEY);
        const decryptedData = CryptoJS.AES.decrypt(value!, "this.token");
        return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    }

    public getsociety() {
        let value = window.localStorage.getItem(this.SOCIETY_KEY);
        const decryptedData = CryptoJS.AES.decrypt(value!, "this.token");
        return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    }

    public getsocietyname() {
        let value = window.localStorage.getItem(this.SOCIETY_NAME);
        const decryptedData = CryptoJS.AES.decrypt(value!, "this.token");
        return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    }

    public getusername() {
        let value = window.localStorage.getItem(this.USERNAME);
        const decryptedData = CryptoJS.AES.decrypt(value!, "this.token");
        return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    }

    public getusernameonload(): string | null{
        return window.localStorage.getItem(this.USERNAME);
    }

    public getuseracces() {
        return window.localStorage.getItem(this.DROITS_KEY);
    }

    public getrole() {
        let value = window.localStorage.getItem(this.ROLE_KEY);
        const decryptedData = CryptoJS.AES.decrypt(value!, "this.token");
        return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    }

    public getdroits() {
        //
        let value = window.localStorage.getItem(this.DROITS_KEY);
        const decryptedData = CryptoJS.AES.decrypt(value!, "this.token");
        return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    }
}
