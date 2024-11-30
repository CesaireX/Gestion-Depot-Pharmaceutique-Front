import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Client, ClientHistorique, Dates, EventItem, Transaction} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {Table} from 'primeng/table';
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {PdfService} from "../../../store/services/service-partage/Pdf.service";

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

    clients: Client[] = [];
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
    chrgmt: boolean = false;
    client: Client = {};
    societyId: number = 0;
    droits: any;
    isSecondaryActive = false;
    items: MenuItem[] | undefined;
    tabs = [
        { label: 'Informations générales' },
        { label: 'Transactions' }
    ];
    selectedTab: number | null = 0;
    displayForm: boolean = false;
    clienthistoriques: ClientHistorique[] = [];
    @ViewChild('filter') filter!: ElementRef;
    metaKey: boolean = true;

    transactions: Transaction | undefined;
    createormodif = false;
    today1: Date=new Date();

    constructor(
        protected clientService: ClientService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected factureService: FactureService,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
        private pdfService : PdfService,
    ) {
    }

    ngOnInit(): void {
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.droits = this.tokenStorage.getdroits();
        this.display = false;
        this.menuBarBool = false;
        this.chrgmt = true; // Afficher le spinner

        Promise.all([
            this.loadAll(),
            this.loadItems()
        ]).then(() => {
            this.chrgmt = false; // Cacher le spinner
        }).catch((error) => {
            console.error(error);
            this.chrgmt = false; // Cacher le spinner en cas d'erreur
        });
    }


    selectTab(index: number) {
        this.selectedTab = index;
        if(index===1){
            this.factureService.generateclientstransactions(this.societyId,this.selectedItem.id).subscribe(value => {
                this.transactions = value.payload;
            })
        }
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

    add(clientValue: any) {
        if (clientValue === null) {
            this.client = {}
            this.modal = 'ajouter';
            this.createormodif=true;
        } else {
            this.client = clientValue;
            this.modal = 'modifier';
            this.createormodif=false;
        }
        this.displayForm = true;
    }


    deleteElement(clientToDelete: Client) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (clientToDelete === null) {
                    return;
                } else {

                    if (clientToDelete.id != null) {
                        this.clientService.delete(clientToDelete.id).subscribe(
                            async () => {
                                this.loadAll();
                                this.isSecondaryActive = false
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car client est déja utilisé!')
                        );
                    }
                }
            }
        });
    }


    loadAll() {
        this.loading = true;
        this.clientService.findclientsbysociety(this.societyId).subscribe(
            (res) => {
                this.clients = res.payload;
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

    annuler() {
        this.display = false;
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
        this.client.societyId = this.societyId;
        console.log(this.client)
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer un nouveau client?',
            accept: async () => {
                try {
                    this.chrgmt = true; // Affiche le spinner

                    if (this.client?.id) {
                        await this.performSaveOperation(async () => {
                            await new Promise((resolve, reject) => {
                                this.clientService.update(this.client).subscribe(
                                    async (value) => {
                                        this.client = value
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
                                this.clientService.save(this.client).subscribe(
                                    async () => {
                                        this.loadAll();
                                        this.isSecondaryActive = false
                                        editForm.resetForm();
                                        this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
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
                    }else{
                        this.display = false
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
                    disabled: !this.droits.includes('SUPPRIMER_CLIENT'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_CLIENT'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    onRowSelect(client: any) {
        this.selectedItem = client;
        this.isSecondaryActive = true;
            const dates: Dates = {
                // @ts-ignore
                dateDebut: null,
                // @ts-ignore
                dateFin: null,
                // @ts-ignore
                dateJournee: null,
                entityId:  client?.id,
                entityId2:  this.societyId,
            };
            this.factureService.getClientHistorique(dates).subscribe(
                (res) => {
                    this.clienthistoriques = res.payload;
                    console.log(this.clienthistoriques)
                    this.loading = false; // Fin du chargement
                },
                (error) => {
                    console.error(error);
                    this.loading = false; // Fin du chargement en cas d'erreur
                }
            );

        this.factureService.generateclientstransactions(this.societyId,this.selectedItem.id).subscribe(value => {
            console.log(value.payload)
            this.transactions = value.payload;
        })

    }

    exportClientListPDF() {
        const data = this.clients.map(client => ({
            Client: `${client.nom || ''} ${client.prenom || ''}`,
            Entreprise: client.entreprise || '',
            Téléphone: client.telephone || '',
            Adresse: client.adresse || '',
            CNIB: client.cinb || ''
        }));

        const headers = ['Client', 'Entreprise', 'Téléphone', 'Adresse', 'CNIB'];
        const title = 'Liste des Clients';

        let dateInfo = {};
        dateInfo = { day: this.today1 };

        this.pdfService.exportPDF(data, headers, title, 'liste_des_clients', dateInfo);
    }


    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    annulate() {
        this.displayForm = false;
        this.client = {};
    }

    close(){
        this.isSecondaryActive = false;
    }
}
