import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Taxe, Magasin} from "../../../store/entities/gestock.entity";
import { Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {TaxeService} from "../../../store/services/gestock-service/Taxe.service";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";

@Component({
    selector: 'app-taxe',
    templateUrl: './taxe.component.html',
    styleUrls: ['./taxe.component.scss']
})
export class TaxeComponent implements OnInit {

    taxes: Taxe[] = [];
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
    taxe: Taxe = {};
    items: MenuItem[] | undefined;
    @ViewChild('filter') filter!: ElementRef;
    roles: any;
    droits: any;
    chrgmt: boolean = false;

    constructor(
        protected taxeService: TaxeService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        private authService:AuthService
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.roles = this.authService.role;
            this.droits = this.tokenStorage.getdroits();
            this.display = false;
            this.menuBarBool = false;
            await this.loadAll();
            await this.loadItems();
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }

    onDisplayDialog() {
        if (this.display) {
            this.display = false;
        } else {
            this.display = true;
            this.taxe = {};
        }
    }

    add(taxeValue: any) {
        if (taxeValue === null) {
            this.modal = 'ajouter';
            this.taxe = {}
        } else {
            this.taxe = taxeValue;
            this.modal = 'modifier';
        }
        this.display = true;
    }


    deleteElement(taxeToDelete: Taxe) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (taxeToDelete === null) {
                    return;
                } else {

                    if (taxeToDelete.id != null) {
                        this.chrgmt = true;
                        this.taxeService.delete(taxeToDelete.id).subscribe(
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
        this.taxeService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.taxes = res.payload;
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
        this.taxe.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.display = false;
            this.chrgmt = true;
                    if (this.taxe?.id) {

                        this.taxeService.update(this.taxe).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                    this.chrgmt = false;
                                });
                            },

                            () =>{
                                this.showMessage('error', 'Modification Impossible', 'Cette taxe est déja utilisée sur une facture !')
                                this.chrgmt = false;
                            }
                        );
                        editForm.resetForm();
                    } else {

                        this.taxeService.save(this.taxe).subscribe(
                            () => {
                                this.loadAll().then(()=>{
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
            this.showMessage('error', 'ENREGISTREMENT', 'Une taxe de la meme hauteur existe déja !');
        }

    }

    ifExist(): boolean {
        if (this.taxe.id) {
            return this.taxes.some(
                value =>
                    value.id !== this.taxe.id &&
                    value.hauteur === this.taxe.hauteur
            );
        } else {
            return this.taxes.some(value => value.hauteur === this.taxe.hauteur);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled:!this.droits.includes('VOIR_TAXE_MODIFIER'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled:!this.droits.includes('VOIR_TAXE_MODIFIER'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
