import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {AuthEntity, PasswordReset} from "../../../store/entities/gestock.entity";
import {ActivatedRoute, Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-connexion',
    templateUrl: './resetPsswd.component.html',
    styleUrls: ['./resetPsswd.component.scss']
})
export class ResetPsswdComponent implements OnInit {

    authEntity: AuthEntity = {};
    errorMessage: string = '';
    data: any;

    username="";
    email="";
    password ="";
    resetToken="";
     response: any;
    confirmPassword = "";
    constructor(
        protected authService: AuthService,
        protected router : Router,
        protected messageService: MessageService,
        private route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {

        this.route.queryParams.subscribe(params => {
            this.resetToken = params['token'];
        });

    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    resetPsswd(editForm: NgForm){
        if (this.password !== this.confirmPassword) {
            this.errorMessage = "Les mots de passe ne correspondent pas.";
            return; // Arrêter l'exécution de la fonction si les mots de passe ne correspondent pas
        }

        const p : PasswordReset={
            username:this.username,
            email:this.email,
            password:this.password,
            resetToken:this.resetToken,
        }

        this.authService.resetPsswdService(p).subscribe(
            resp => {
                this.response = resp;
                if(this.response==2){
                    this.showMessage('success', 'Réinitialisation de mot de passe', 'Réinitialisation effectuée avec succès. Veillez vous connecter!');
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 2000);
                }else if(this.response==1){
                    this.showMessage('warning', 'Réinitialisation de mot de passe', 'Reprenez le processus de  Réinitialisation!')
                }else{
                    this.showMessage('error', 'Réinitialisation de mot de passe', 'Echec de la Réinitialisation car l\'utilisateur n\'existe pas!')
                }
           },
            error => {
                console.error('Erreur de Mot de passe', error);
            }
        );


    }




}
