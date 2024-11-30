import { Component, ElementRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { LayoutService } from './service/app.layout.service';
import {AuthService} from "../store/services/gestock-service/Auth.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {ConfirmationService, MessageService} from "primeng/api";
import {PasswordReset, Role, Utilisateur} from "../store/entities/gestock.entity";
import {UtilisateurService} from "../store/services/gestock-service/Utilisateur.service";
import {RoleService} from "../store/services/gestock-service/Role.service";
import {TokenStorage} from "../store/storage/tokenStorage";
import CryptoJS from 'crypto-js';

@Component({
    selector: 'app-menu-profile',
    templateUrl: './app.menuprofile.component.html',
    animations: [
        trigger('menu', [
            transition('void => inline', [
                style({ height: 0 }),
                animate('400ms cubic-bezier(0.86, 0, 0.07, 1)', style({ opacity: 1, height: '*' })),
            ]),
            transition('inline => void', [
                animate('400ms cubic-bezier(0.86, 0, 0.07, 1)', style({ opacity: 0, height: '0' }))
            ]),
            transition('void => overlay', [
                style({ opacity: 0, transform: 'scaleY(0.8)' }),
                animate('.12s cubic-bezier(0, 0, 0.2, 1)')
            ]),
            transition('overlay => void', [
                animate('.1s linear', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class AppMenuProfileComponent {

username="";
     display: boolean | undefined;
    utilisateur: Utilisateur = {};
    utilisateurs: Utilisateur[] = [];
    roles: Role [] =[];
    role?: Role[] =[];
    roleList: Role[]  | undefined =[];
    societyId: number = 0;
    droits: any;
    confirmPassword: string="";
    errorMessage: string = '';
     response: any;
    email="";
    password ="";
    actuelPsswd="";

    modif=false;
     display2: boolean | undefined;
     utilisa: Utilisateur = {};
     rolss: any;
    constructor(public layoutService: LayoutService, public el: ElementRef, protected authService:AuthService,
                private route:Router,  protected messageService: MessageService,
                protected utilisateurService:UtilisateurService, protected roleService:RoleService,
                private tokenStorage: TokenStorage,protected confirmationService: ConfirmationService,
                protected router: Router,
                ) { }

    ngOnInit(): void {
        this.loadAll();
        this.loadAllRole();
        this.modif=false;
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.droits = this.tokenStorage.getdroits();
        this.rolss = this.tokenStorage.getrole();
        // @ts-ignore
        this.username= this.tokenStorage.getusername();
       /* if (this.authService.isAuthenticated){
            console.log(this.authService.isAuthenticated);
            console.log(this.authService.token);
            console.log(this.authService.username);
            this.username=this.authService.username;
            console.log("ffffffff"+this.authService.username)
        }else{
            console.log("this.authService.username")
        }
*/

    }

    add(utilisateurValue: Utilisateur) {
        //this.role=[];
        this.modif=true;
        if (this.rolss.includes('ADMIN')){
            this.role=utilisateurValue.roles;
            // @ts-ignore
            this.utilisateur.roles?.push(this.role);
            this.utilisateur = utilisateurValue;
        }else {
            // @ts-ignore
            this.role=this.roles.find(rol => rol.id === utilisateurValue.roles[0].id);
            this.utilisateur = utilisateurValue;
        }
        this.display = true;

    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }


    ifExist(): boolean {
        if (this.utilisateur.id) {
            return this.utilisateurs.some(
                value =>
                    value.id !== this.utilisateur.id &&
                    ( value.username===this.utilisateur.username
                    )
            );
        } else {
            return this.utilisateurs.some(value =>  (value.username===this.utilisateur.username
            ))
        }
    }

    loadAllRole() {
        this.roleService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.roles = res.payload;
            }
        );
    }

    loadAll() {
        this.utilisateurService.findAllUsers(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.utilisateurs = res.payload;
                // @ts-ignore
                this.utilisa=res.payload.find(user => user.username === this.tokenStorage.getusername());
            }
        );
    }

    save(editForm: NgForm) {
       if(!this.rolss.includes('ADMIN')){
           // @ts-ignore
           this.roleList?.push(this.role);
           this.utilisateur.roles = this.roleList;
       }
        this.utilisateur.societyId =this.societyId;
        if (!this.ifExist()) {
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment modifier votre compte?',
                accept: () => {
                    if (this.utilisateur?.id) {
                        this.utilisateurService.update(this.utilisateur).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                this.display = false;
                                const username = CryptoJS.AES.encrypt(JSON.stringify(this.utilisateur.username!),"this.token").toString();
                                window.localStorage.setItem("TESTTRY",username);
                                // @ts-ignore
                                this.username = this.utilisateur.username;
                                editForm.resetForm();
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                        this.display = false;
                    }

                }
            });

        } else {

            this.showMessage('error', 'ENREGISTREMENT', 'Un utilisateur portant le même numero de télephone ou cnib ou emaail  existe déjà !');

        }

    }

    onDisplayDialog(utilisateurtocheck?: Utilisateur, isDetail?: boolean) {
        if (this.display) {
            this.display = false;
        } else {
            this.display = true;
            this.utilisateur = {};
        }
    }

    displayDialogChangePsswd(){
        this.display2=true;
    }

    annuler() {
        this.display = false;
        this.display2 =false;
    }


    changePsswd(editForm2:NgForm){
        if (this.password !== this.confirmPassword) {
            this.errorMessage = "Les mots de passe ne correspondent pas.";
            return; // Arrêter l'exécution de la fonction si les mots de passe ne correspondent pas
        }
        const p : PasswordReset={
            username:this.username,
            password:this.password,
            actuelPsswd:this.actuelPsswd,
        }
        this.confirmationService.confirm({
            header: 'Changement de mot de passe',
            message: 'Voulez-vous vraiment changer le mot de passe?',

            accept: () => {
                this.authService.changePsswdService(p).subscribe(
                    resp => {
                        this.response = resp;
                        if(this.response==2){
                            this.showMessage('success', 'Modification de mot de passe', 'Modification effectuée avec succès.!');
                            setTimeout(() => {
                                //this.router.navigate(['/auth/login']);
                                this.authService.logout();
                            }, 2200);
                        }else if(this.response==1){
                            this.showMessage('error', 'Modification de mot de passe', 'Mot de passe incorrect!')
                        }else{
                            this.showMessage('error', 'Modification de mot de passe', 'Echec de la Modification car l\'utilisateur n\'existe pas!')
                        }
                    },
                    error => {
                        console.error('Erreur de Mot de passe', error);
                    }
                );
            }
        });
    }

    toggleMenu() {
        this.layoutService.onMenuProfileToggle();
    }

    get isHorizontal() {
       return this.layoutService.isHorizontal() && this.layoutService.isDesktop();
    }

    get menuProfileActive(): boolean {
        return this.layoutService.state.menuProfileActive;
    }

    get menuProfilePosition(): string {
        return this.layoutService.config.menuProfilePosition;
    }

    get isTooltipDisabled(): boolean {
        return !this.layoutService.isSlim();
    }

    handleLogout() {
        this.authService.logout();
    }
}
