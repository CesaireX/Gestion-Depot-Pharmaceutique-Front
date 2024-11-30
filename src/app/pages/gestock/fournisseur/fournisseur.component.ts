import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ClientHistorique, Dates, Fournisseur, FrsHistorique, Transaction} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {FournisseurService} from "../../../store/services/gestock-service/Fournisseur.service";
import {Table} from 'primeng/table';
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {PdfService} from "../../../store/services/service-partage/Pdf.service";

@Component({
    selector: 'app-fournisseur',
    templateUrl: './fournisseur.component.html',
    styleUrls: ['./fournisseur.component.scss']
})
export class FournisseurComponent implements OnInit {

    fournisseurs: Fournisseur[] = [];
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
    loading: boolean = false;
    chrgmt: boolean = false;
    fournisseur: Fournisseur = {};
    droits: any;
    isSecondaryActive = false;
    items: MenuItem[] | undefined;
    tabs = [
        { label: 'Informations générales' },
        { label: 'Transactions' }
        ];
    selectedTab: number | null = 0;
    displayForm: boolean = false;
    @ViewChild('filter') filter!: ElementRef;
    societyId: number = 0;
    frshistoriques: FrsHistorique[] = [];
    transactions: Transaction | undefined;
    createormodif = false;
    today1: Date=new Date();
    constructor(
        protected fournisseurService: FournisseurService,
        protected router: Router,
        protected factureService: FactureService,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
        private pdfService : PdfService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.droits = this.tokenStorage.getdroits();

            await Promise.all([
                this.loadAll(),
                this.loadItems()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }
    selectTab(index: number) {
        this.selectedTab = index;
    }
    SaveChoice(editForm: NgForm, choix: string){
        if(choix === 'continuer'){
            this.display = true;
            this.save(editForm);
        }else{
            this.display = false;
            this.save(editForm);
        }
    }

    closeSection(editform: NgForm) {
        this.displayForm =  false
        editform.resetForm()
    }

    annulate() {
        this.displayForm = false;
        this.fournisseur = {};
    }

    onRowSelect(frs: any) {
        this.selectedItem = frs;
        this.isSecondaryActive = true;
        const dates: Dates = {
            // @ts-ignore
            dateDebut: null,
            // @ts-ignore
            dateFin: null,
            // @ts-ignore
            dateJournee: null,
            entityId:  frs?.id,
            entityId2:  this.societyId,
        };
        this.factureService.getFrsHistorique(dates).subscribe(
            (res) => {
                this.frshistoriques = res.payload;
                console.log(this.frshistoriques)
                this.loading = false; // Fin du chargement
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
        );

        this.factureService.generatefrstransactions(this.societyId,this.selectedItem.id).subscribe(value => {
            console.log(value.payload)
            this.transactions = value.payload;
        })
    }

    exportFournisseurListPDF() {
        const data = this.fournisseurs.map(fournisseur => ({
            Fournisseur: `${fournisseur.nom || ''} ${fournisseur.prenom || ''}`,
            Entreprise: fournisseur.entreprise || '',
            Téléphone: fournisseur.telephone || '',
            Adresse: fournisseur.adresse || '',
            CNIB: fournisseur.cinb || ''
        }));

        const headers = ['Fournisseur', 'Entreprise', 'Téléphone', 'Adresse', 'CNIB'];
        const title = 'Liste des Fournisseurs';

        let dateInfo = {};
        dateInfo = { day: this.today1 };

        this.pdfService.exportPDF(data, headers, title, 'liste_des_fournisseurs', dateInfo);
    }


    add(fournisseurValue: any) {
        if (fournisseurValue === null) {
            this.fournisseur = {}
            this.modal = 'ajouter';
            this.createormodif=true;
        } else {
            this.fournisseur = fournisseurValue;
            this.modal = 'modifier';
            this.createormodif=false;
        }
        this.displayForm = true;
    }


    deleteElement(fournisseurToDelete: Fournisseur) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (fournisseurToDelete === null) {
                    return;
                } else {

                    if (fournisseurToDelete.id != null) {
                        this.fournisseurService.delete(fournisseurToDelete.id).subscribe(
                            async () => {
                                this.loadAll();
                                this.isSecondaryActive = false
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car fournisseur est déja utilisé!')
                        );
                    }
                }
            }
        });
    }


    loadAll() {
        this.loading = true;
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
                this.loading = false;
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
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

    async save(editForm: NgForm) {
        this.fournisseur.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        console.log(this.fournisseur)
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer un nouvel fournisseur?',
            accept: async () => {
                try {
                    this.chrgmt = true; // Affiche le spinner

                    if (this.fournisseur?.id) {
                        await this.performSaveOperation(async () => {
                            await new Promise((resolve, reject) => {
                                this.fournisseurService.update(this.fournisseur).subscribe(
                                    async (value) => {
                                        this.fournisseur = value;
                                        this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                        resolve(null);
                                    },
                                    () => {
                                        this.showMessage('error', 'Modification', 'Echec de Modification !');
                                        reject(new Error('Echec de Modification'));
                                    }
                                );
                            });
                        });
                    } else {
                        await this.performSaveOperation(async () => {
                            await new Promise((resolve, reject) => {
                                this.fournisseurService.save(this.fournisseur).subscribe(
                                    async () => {
                                        this.loadAll();
                                        this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                        editForm.resetForm();
                                        resolve(null);
                                    },
                                    () => {
                                        this.showMessage('error', 'Ajout', 'Echec Ajout !');
                                        reject(new Error('Echec Ajout'));
                                    }
                                );
                            });
                        });
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    this.chrgmt = false;

                    if(this.display){
                        this.display = false
                    } else {
                        this.display = false;
                        this.displayForm = false;
                    }
                }
            }
        });
    }
    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('SUPPRIMER_FOURNISSEUR'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_FOURNISSEUR'),
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

    close(){
        this.isSecondaryActive = false;
    }
}
