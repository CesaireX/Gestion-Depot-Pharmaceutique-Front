import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Assurance, Magasin} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {AssuranceService} from "../../../store/services/gestock-service/Assurance.service";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";

@Component({
    selector: 'app-assurance',
    templateUrl: './assurance.component.html',
    styleUrls: ['./assurance.component.scss']
})
export class AssuranceComponent implements OnInit {

    assurances: Assurance[] = [];
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
    assurance: Assurance = {};
    items: MenuItem[] | undefined;
    @ViewChild('filter') filter!: ElementRef;
    roles: any;
    droits: any;
    chrgmt: boolean = false;

    constructor(
        protected assuranceService: AssuranceService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        private authService: AuthService
    ) {}

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
            this.assurance = {};
        }
    }

    add(assuranceValue: any) {
        if (assuranceValue === null) {
            this.modal = 'ajouter';
            this.assurance = {};
        } else {
            this.assurance = assuranceValue;
            this.modal = 'modifier';
        }
        this.display = true;
    }

    deleteElement(assuranceToDelete: Assurance) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (assuranceToDelete === null) {
                    return;
                } else {
                    if (assuranceToDelete.id != null) {
                        this.chrgmt = true;
                        this.assuranceService.delete(assuranceToDelete.id).subscribe(
                            () => {
                                this.loadAll().then(() => {
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.chrgmt = false;
                                });
                            },
                            () => {
                                this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car Cet élément est déja utilisé!');
                                this.chrgmt = false;
                            }
                        );
                    }
                }
            }
        });
    }

    loadAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.loading = true; // Début du chargement
            this.assuranceService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.assurances = res.payload;
                    this.loading = false; // Fin du chargement
                    resolve(); // Résoudre la promesse une fois les paiements chargés
                },
                (error) => {
                    this.loading = false; // Fin du chargement en cas d'erreur
                    reject(error); // Rejeter la promesse en cas d'erreur
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
        this.assurance.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.display = false;
            this.chrgmt = true;
            if (this.assurance?.id) {
                this.assuranceService.update(this.assurance).subscribe(
                    () => {
                        this.loadAll().then(() => {
                            this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                            this.chrgmt = false;
                        });
                    },
                    () => {
                        this.showMessage('error', 'Modification Impossible', 'Cette assurance est déja utilisée !');
                        this.chrgmt = false;
                    }
                );
                editForm.resetForm();
            } else {
                this.assuranceService.save(this.assurance).subscribe(
                    () => {
                        this.loadAll().then(() => {
                            this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                            this.chrgmt = false;
                        });
                    },
                    () => {
                        this.showMessage('error', 'Ajout', 'Echec Ajout !');
                        this.chrgmt = false;
                    }
                );
                editForm.resetForm();
            }
        } else {
            this.showMessage('error', 'ENREGISTREMENT', 'Une assurance de la même hauteur existe déjà !');
        }
    }

    ifExist(): boolean {
        if (this.assurance.id) {
            return this.assurances.some(
                value =>
                    value.id !== this.assurance.id &&
                    value.hauteur === this.assurance.hauteur
            );
        } else {
            return this.assurances.some(value => value.hauteur === this.assurance.hauteur);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('VOIR_ASSURANCE_MODIFIER'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('VOIR_ASSURANCE_MODIFIER'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }];
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
