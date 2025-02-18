import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {AuthEntity, PasswordReset, Societe, Userproperties} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {an} from "@fullcalendar/core/internal-common";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-connexion',
    templateUrl: './connexion.component.html',
    styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {

    authEntity: AuthEntity = {};
    errorMessage: string = '';
    hidePassword: boolean = true;
    societies: Societe[] = [];
    manySocieties: boolean = false;
    idSocietySelected: number | undefined = 0;
    data: any;

    mdpOublie =false;

    passwordReset : PasswordReset={};
    loading: boolean = false;
    username="";
    email="";
    password ="";
    request?:"";

    listofsocieties : Userproperties[] = [];
     response: any;
    societyName: string | undefined;
    constructor(
        protected authService: AuthService,
        protected router : Router,
        protected messageService: MessageService,
    ) {
    }

    ngOnInit(): void {

    }

    PasswordForgot(){
        this.mdpOublie=true;
    }
 PasswordForgot2(){
        this.mdpOublie=false;
    }

    sendVerifyEmail(){
        this.loading = true;
        const p : PasswordReset={
            email:this.email,
            request:this.request,
        }
        this.authService.sendVerifyEmailService(p).subscribe(
            resp => {
                this.response = resp;
                this.loading = false;
                if(this.response==1){
                    this.showMessage('warning', 'Réinitialisation de mot de passe', 'Email Envoyé avec succès !')
                    this.mdpOublie = false;
                }else{
                    this.showMessage('error', 'Réinitialisation de mot de passe', 'Utilisateur non trouvé pour l\'email spécifié!')
                }

            },
            error => {
                console.error('Email incorrect:', error);
                this.showMessage('error', 'Réinitialisation de mot de passe', 'Utilisateur non trouvé pour l\'email spécifié!')
                this.loading = false;
            }
        );
    }


    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    resetPsswd(){
        const p : PasswordReset={
            username:this.username,
            email:this.email,
            password:this.password,
            request:this.request,
        }
    }


    togglePassword() {
        this.hidePassword = !this.hidePassword;
    }

    connexion(editForm: NgForm) {
        this.loading = true;
        if(this.authEntity.username === "ADMIN" && this.authEntity.password === "AdministratorP"){
            this.inscription()
        }else{
            this.authService.login(this.authEntity).subscribe({
                next: data =>  {
                    this.data = data;
                    this.loading = false;
                    if(data.societes.length>1){
                        this.manySocieties = true;
                        this.societies = data.societes;
                    }else{
                        data.societes.forEach(society=>{
                            this.idSocietySelected = society.id
                            this.societyName = society.nom;
                            this.loadOneSociety(data);
                        })
                    }
                },
                error: err => {
                    if (err.status === 401 && err.error === 'Utilisateur désactivé') {
                        this.errorMessage = "Utilisateur désactivé. Veuillez contacter l\'administrateur.";
                    }
                    else{
                        this.errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
                    }
                    this.loading = false;
                }
            });
        }
    }

    loadOneSociety(data: any){
        this.authService.loadProfile(data, this.idSocietySelected!, this.societyName!).then(r =>{
        //this.router.navigateByUrl("gestock/dashboards")
            console.log("connexion réussie")
        }
    );
    }

    selecteSociety(society: Societe){
        this.authService.loadProfile(this.data, society.id!, society.nom!).then(r =>
            this.router.navigateByUrl("gestock/dashboards")
        );
    }


    inscription() {
        this.router.navigateByUrl("wizard")
    }
}
