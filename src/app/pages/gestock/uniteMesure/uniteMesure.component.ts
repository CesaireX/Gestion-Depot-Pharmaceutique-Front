import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UniteMesure, Magasin} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {UniteMesureService} from "../../../store/services/gestock-service/UniteMesure.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";

@Component({
    selector: 'app-uniteMesure',
    templateUrl: './uniteMesure.component.html',
    styleUrls: ['./uniteMesure.component.scss']
})
export class UniteMesureComponent implements OnInit {

    uniteMesures: UniteMesure[] = [];
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
    uniteMesure: UniteMesure = {};
    droits: any;
    chrgmt: boolean = false;
    items: MenuItem[] | undefined;
    @ViewChild('filter') filter!: ElementRef;

    constructor(
        protected uniteMesureService: UniteMesureService,
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
                    label: 'Importer des articles',
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
    add(uniteMesureValue: any) {
        if (uniteMesureValue === null) {
            this.modal = 'ajouter';
            this.uniteMesure = {}
        } else {
            this.uniteMesure = uniteMesureValue;
            this.modal = 'modifier';
        }
        this.display = true;
    }

    deleteElement(uniteMesureToDelete: Magasin) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (uniteMesureToDelete === null) {
                    return;
                } else {

                    if (uniteMesureToDelete.id != null) {
                        this.chrgmt = true;
                        this.uniteMesureService.delete(uniteMesureToDelete.id).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.chrgmt = false;
                                });
                            },
                            () => {
                                this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car Cet élément est déja utilisé!')
                                this.chrgmt = false;
                            }                        );
                    }
                }
            }
        });
    }


    loadAll(): Promise<void>  {
        return new Promise<void>((resolve, reject) => {
            this.loading = true; // Début du chargement
            this.uniteMesureService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.uniteMesures = res.payload;
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
        this.uniteMesure.societyId = JSON.parse(this.tokenStorage.getsociety()!)
        if (!this.ifExist()) {
            this.display = false;
            this.chrgmt = true;

            if (this.uniteMesure?.id) {
                        this.uniteMesureService.update(this.uniteMesure).subscribe(
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
                        editForm.resetForm();
                    }
                    else {
                this.uniteMesureService.save(this.uniteMesure).subscribe(
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
            this.showMessage('error', 'ENREGISTREMENT', 'Une unité de mesure portant le même libellé existe déjà !');
        }

    }

    ifExist(): boolean {
        if (this.uniteMesure.id) {
            return this.uniteMesures.some(
                value =>
                    value.id !== this.uniteMesure.id &&
                    value.libelle === this.uniteMesure.libelle
            );
        } else {
            return this.uniteMesures.some(value => value.libelle === this.uniteMesure.libelle);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('SUPPRIMER_UNITE_MESURE'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_UNITE_MESURE'),
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
