import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Famille, Magasin} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {FamilleService} from "../../../store/services/gestock-service/Famille.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";

@Component({
    selector: 'app-famille',
    templateUrl: './famille.component.html',
    styleUrls: ['./famille.component.scss']
})
export class FamilleComponent implements OnInit {

    familles: Famille[] = [];
    error: any;
    success: any;
    page: any;
    reverse: any;
    display?: Boolean;
    modal = '';
    menuBarBool?: boolean;
    menuitems: any;
    item: any;
    selectedItem: any = null;
    loading: boolean = true;
    famille: Famille = {};
    droits: any;
    items: MenuItem[] | undefined;
    chrgmt: boolean = false;
    @ViewChild('filter') filter!: ElementRef;

    constructor(
        protected familleService: FamilleService,
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

        try {
            this.display = false;
            this.menuBarBool = false;
            this.droits = this.tokenStorage.getdroits();
            await this.loadAll();
            await this.loadItems();
            this.items = [
                {
                    label: 'Importer des produits',
                    icon: 'pi pi-upload',
                    routerLink: ['/fileupload']
                },
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

    add(familleValue: any) {
        if (familleValue === null) {
            this.modal = 'ajouter';
            this.famille = {}
        } else {
            this.famille = familleValue;
            this.modal = 'modifier';
        }
        this.display = true;
    }


    deleteElement(familleToDelete: Magasin) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (familleToDelete === null) {
                    return;
                } else {

                    if (familleToDelete.id != null) {
                        this.chrgmt = true;
                        this.familleService.delete(familleToDelete.id).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.chrgmt = false;
                                });
                            },
                            () => {
                                this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car Cet élément est déja utilisé!')
                                this.chrgmt = false;
                            }
                        );
                    }
                }
            }
        });
    }


    loadAll(): Promise<void>  {
        return new Promise<void>((resolve, reject) => {
            this.loading = true; // Début du chargement
            this.familleService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.familles = res.payload;
                    this.loading = false; // Fin du chargement
                    resolve(); // résoudre la promesse une fois les paiements chargés
                },
                (error) => {
                    this.loading = false; // Fin du chargement en cas d'erreur
                    reject(error); // rejeter la promesse en cas d'erreur
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

    annuler() {
        this.display = false;
    }

    save(editForm: NgForm) {
        this.famille.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.display = false;
            this.chrgmt = true;

                if (this.famille?.id) {

                        this.familleService.update(this.famille).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                    this.chrgmt = false;
                                });
                            },

                            () => {
                                this.showMessage('error', 'Modification', 'Echec de Modification !')
                                this.chrgmt = false;
                            }
                            );
                        editForm.resetForm()
                    } else {
                        this.familleService.save(this.famille).subscribe(
                            () => {
                                this.loadAll().then(() => {
                                    this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                    this.chrgmt = false;
                                });
                            },
                            () =>{
                                this.showMessage('error', 'Ajout', 'Echec Ajout !')
                                this.chrgmt = false;
                            }
                            );
                        editForm.resetForm();
                    }
        } else {
            this.showMessage('error', 'ENREGISTREMENT', 'Une famille portant le même nom existe déjà !');
        }

    }

    ifExist(): boolean {
        if (this.famille.id) {
            return this.familles.some(
                value =>
                    value.id !== this.famille.id &&
                    value.libelle === this.famille.libelle
            );
        } else {
            return this.familles.some(value => value.libelle === this.famille.libelle);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('SUPPRIMER_CATEGORIE'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_CATEGORIE'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
