import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PasswordReset, Role, Utilisateur} from "../../../store/entities/gestock.entity";
import { Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {UtilisateurService} from "../../../store/services/gestock-service/Utilisateur.service";
import {Table} from 'primeng/table';
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {RoleService} from "../../../store/services/gestock-service/Role.service";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";

@Component({
    selector: 'app-utilisateur',
    templateUrl: './utilisateur.component.html',
    styleUrls: ['./utilisateur.component.scss']
})
export class UtilisateurComponent implements OnInit {

    utilisateurs: Utilisateur[] = [];
    error: any;
    success: any;
    page: any;
    reverse: any;
    display?: Boolean;
    display2?: Boolean;
    modal = '';
    menuBarBool?: boolean;
    menuitems: any;
    item: any;
    loading: boolean = true;
    societyId: number = 0;
    utilisateur: Utilisateur = {};
    droits: any;
    rolss: any;
    @ViewChild('filter') filter!: ElementRef;
    roles: Role [] =[];
    role: Role[] | undefined =[];
    roleList: Role[]  | undefined =[];
    confirmPassword: string="";
    errorMessage: string = '';
    private response: any;
    username="";
    email="";
    password ="";
    actuelPsswd="";
    modif=false;
    items: MenuItem[] | undefined;
    displayForm: boolean = false;
    chrgmt: boolean = false;
    constructor(
        protected utilisateurService: UtilisateurService,
        protected roleService :RoleService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner
        this.display = false;
        this.modif = false;
        this.menuBarBool = false;

        try {
            this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.droits = this.tokenStorage.getdroits();
            this.rolss = this.tokenStorage.getrole();

            await this.loadAll();
            await this.loadAllRole();

            this.items = [
                // {
                //     label: 'Importer des articles',
                //     icon: 'pi pi-upload',
                //     routerLink: ['/fileupload']
                // },
                {
                    icon: 'pi pi-external-link',
                    label: 'Exporter la fiche'
                }
            ];
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
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

    add(utilisateurValue: any) {
        this.role=[];
        this.modif=true;
        // @ts-ignore
        if (utilisateurValue?.roles[0].name==='ADMIN'){
            this.role=utilisateurValue.roles;
            // @ts-ignore
            this.utilisateur.roles?.push(this.role);
        }else {
            // @ts-ignore
            this.role=this.roles?.find(rol => rol.id === utilisateurValue?.roles[0].id);
        }
        if (utilisateurValue === null) {
            this.annulate()
            this.modal = 'ajouter';
        } else {
            this.utilisateur = utilisateurValue;
            this.modal = 'modifier';
            this.modif=false;
        }
        this.displayForm = true;

    }

    confirmDesactivation(utilisateur: Utilisateur) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: `Êtes-vous sûr de vouloir ${utilisateur.activated ? 'activer' : 'désactiver'} cet utilisateur ?`,
            accept: () => {
                this.deleteElement(utilisateur);
            },
            reject: () => {
                utilisateur.activated =  !utilisateur.activated;
            }
        });
    }


    deleteElement(utilisateurToDelete: Utilisateur) {

        if (utilisateurToDelete === null) {
            return;
        } else {

            if (utilisateurToDelete.id != null) {
                this.chrgmt = true;
                this.utilisateurService.delete(utilisateurToDelete.id).subscribe(
                    () => {
                        this.loadAll().then(()=>{
                            if(utilisateurToDelete.activated!=true){
                                this.showMessage('success', 'DESACTIVATION', 'Utilisateur désactivé avec succès !');}
                            else {
                                this.showMessage('success', 'ACTIVATION', 'Utilisateur activé avec succès !');}
                            this.chrgmt = false;
                        });
                    },
                    () => {
                        utilisateurToDelete.activated =  !utilisateurToDelete.activated;
                        this.showMessage('error', 'ACTIVATION/DESACTIVATION', 'Echec de la DESACTIVATION ou l\'ACTIVATION !');
                    }
                    );
            }
        }
    }


    loadAllRole() {
        this.roleService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.roles = res.payload;
            }
        );
    }

    /*  loadAll() {
          // Récupérez le rôle de l'utilisateur depuis le token JWT ou d'autres informations d'authentification
          const userRole = this.tokenStorage.getrole();

          // Vérifiez si l'utilisateur a le rôle "ADMIN"
          if (userRole === 'ADMIN') {
              // Si l'utilisateur a le rôle "ADMIN", chargez tous les utilisateurs
              this.utilisateurService.findAllUsers(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                  (res) => {
                      this.utilisateurs = res.payload;
                      console.log(this.utilisateurs);
                  }
              );
          } else {
              // Si l'utilisateur n'a pas le rôle "ADMIN", chargez uniquement les informations de l'utilisateur connecté
              this.utilisateurService.findAllUsers(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                  (res) => {
                      // @ts-ignore
                      this.utilisateurs = res.payload.find(user => user.username === this.tokenStorage.getusername());

                      console.log(this.utilisateurs);
                  }
              );
          }
      }*/

    loadAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
        this.loading = true; // Début du chargement
        this.utilisateurService.findAllUsers(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.utilisateurs = res.payload.filter(value => value.username!=this.tokenStorage.getusername());
                this.loading = false; // Fin du chargement
                resolve(); // résoudre la promesse une fois les paiements chargés
            },
            (error) => {
                reject(error); // rejeter la promesse en cas d'erreur
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
        });
    }


    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    displayDialogChangePsswd(utilisateurValue: any){
        console.log(utilisateurValue)
        this.username=utilisateurValue.username!;
        this.display2=true;
    }

    annuler() {
        this.display = false;
        this.display2 =false;
    }

    private performSaveOperation(saveFunction: () => Promise<void>): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    await saveFunction();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 1000); // Délai de 1 seconde avant de résoudre la promesse
        });
    }

    async save(editForm: NgForm, choix: string) {
        this.utilisateur.societyId = this.societyId;
        console.log(this.utilisateur)
        if(!this.utilisateur?.id){
            if (this.utilisateur.password !== this.confirmPassword) {
                this.errorMessage = "Les mots de passe ne correspondent pas.";
                console.log( this.errorMessage)
                return; // Arrêter l'exécution de la fonction si les mots de passe ne correspondent pas
            }
        }
        if (!this.ifExist()) {
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer un nouvel utilisateur?',
                accept: async () => {
                    try {
                        this.chrgmt = true; // Affiche le spinner

                        if (this.utilisateur?.id) {
                            // @ts-ignore
                            if (this.utilisateur.roles[0].name != 'ADMIN') {
                                // @ts-ignore
                                this.roleList?.push(this.role);
                                this.utilisateur.roles = this.roleList;
                            }
                            await this.performSaveOperation(async () => {
                                await new Promise((resolve, reject) => {
                                    this.utilisateurService.update(this.utilisateur).subscribe(
                                        async () => {
                                            this.loadAll().then(()=>{
                                                this.displayForm = choix === 'continuer';
                                                this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                            });
                                            resolve(null);
                                        },
                                        () => {
                                            this.showMessage('error', 'Modification', 'Echec de Modification !');
                                            reject(new Error('Echec de Modification'));
                                        }
                                    );
                                });
                            });
                            editForm.resetForm();
                        } else {
                            // @ts-ignore
                            this.roleList?.push(this.role);
                            this.utilisateur.roles = this.roleList;

                            await this.performSaveOperation(async () => {
                                await new Promise((resolve, reject) => {
                                    this.utilisateurService.save(this.utilisateur).subscribe(
                                        async () => {
                                            this.loadAll().then(()=>{
                                                this.displayForm = choix === 'continuer';
                                                this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                            });
                                            resolve(null);
                                        },
                                        () => {
                                            this.showMessage('error', 'Ajout', 'Echec Ajout !');
                                            reject(new Error('Echec Ajout'));
                                        }
                                    );
                                });
                            });
                            editForm.resetForm();
                            this.display = false;
                        }
                    } catch (error) {
                        console.error(error);
                    } finally {
                        this.chrgmt = false;

                        if(this.display){
                            this.display = false
                        }else{
                            this.display = false
                        }
                    }
                }
            });
        } else {
            this.showMessage('error', 'ENREGISTREMENT', 'Un utilisateur portant le même Username ou le meme email existe déjà !');
        }
    }

    ifExist(): boolean {
        if (this.utilisateur.id) {
            return this.utilisateurs.some(
                value =>
                    value.id !== this.utilisateur.id &&
                    (value.username === this.utilisateur.username ||
                        (this.utilisateur.email !== null && value.email === this.utilisateur.email))
            );
        } else {
            return this.utilisateurs.some(
                value =>
                    value.username === this.utilisateur.username ||
                    (this.utilisateur.email !== null && value.email === this.utilisateur.email)
            );
        }
    }

    changePsswd(editForm2:NgForm){
        if (this.password !== this.confirmPassword) {
            this.errorMessage = "Les mots de passe ne correspondent pas.";
            return; // Arrêter l'exécution de la fonction si les mots de passe ne correspondent pas
        }
        const p : PasswordReset={
            username:this.username,
            password:this.password,
            actuelPsswd:null
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
                           /* setTimeout(() => {
                                this.router.navigate(['/auth/login']);
                            }, 2200);*/
                            this.display2=false;
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

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }



    annulate() {
        this.displayForm = false;
        this.utilisateur = {};
        this.confirmPassword="";
        this.errorMessage="";
    }
}
