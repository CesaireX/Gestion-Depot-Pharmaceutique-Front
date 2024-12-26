import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    Client, Facture, FactureEntree,
    FactureSortie,
    Magasin,
    Recu,
    Sortie_stock
} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {RecuService} from "../../../store/services/gestock-service/Recu.service";
import {Mode_paiement} from "../../../store/enum/enums";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {Sortie_stockService} from "../../../store/services/gestock-service/Sortie_stock.service";

@Component({
    selector: 'app-facture',
    templateUrl: './facture.component.html',
    styleUrls: ['./facture.component.scss']
})
export class FactureEntreeComponent implements OnInit {

    factures: Facture[] = [];
    error: any;
    success: any;
    page: any;
    reverse: any;
    display?: Boolean;
    displayPaiementG?: Boolean = false;
    modal = '';
    menuBarBool?: boolean;
    menuitems: any;
    item: any;
    selectedItem: any = null;
    loading: boolean = true;
    facture: FactureEntree = {};
    recu: Recu = <Recu>{};
    dette = 'dette';
    paye = "payé";
    @ViewChild('filter') filter!: ElementRef;
    file: Blob | undefined;
    fileURL: string | undefined;
    activepaiementbool: boolean = false;
    clients: Client[] = [];
    clientselected?: Client;
    selectedFacture: FactureSortie = <FactureSortie>{};
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    factureSelected: FactureSortie = <FactureSortie>{};
    total_a_payer: number = 0;
    total_factures: number = 0;
    reste: number = 0;
    continue: boolean = false;
    droits: any;
    sortiesList: Sortie_stock[] = [];
    sortiebool: boolean = false;
    authorization: boolean = false;
    modifyrecu: Boolean = false;
    montant_a_rajouter: number = 0;

    constructor(
        protected factureService: FactureService,
        protected recuService: RecuService,
        private clientService: ClientService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        public sortieStockService: Sortie_stockService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.droits = this.tokenStorage.getdroits();
        this.display = false;
        this.menuBarBool = false;
        this.loadAll();
        this.loadClients();
        this.loadItems()
    }

    loadClients() {
        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
            }
        );
    }


    onDisplayDialog() {
        if (this.display) {
            this.display = false;
        } else {
            this.display = true;
            this.facture = {};
        }
    }

    OnSelectFacture(facture: FactureSortie) {
        this.sortieStockService.getSortiesByFactures(facture.id).subscribe(
            (res) => {
                this.sortiesList = res.payload;
            },
            (error) => {
                console.error(error);
            }
        );
        this.sortiebool = true;
        this.selectedFacture = facture;
    }

    onDisplayDialogGeneral() {
        this.displayPaiementG = true;
        this.modifyrecu = false;
    }

    add(factureValue: Magasin) {
        if (factureValue === null) {
            this.modal = 'ajouter';
        } else {
            this.facture = factureValue;
            this.modal = 'modifier';
        }
        this.display = true;
    }

    navigateToUpdateFacture(facture: FactureSortie) {
        let id = facture.id;
        if (facture.reste!=facture.montant_total) {
            this.showMessage('error', 'IMPOSSIBLE', 'Une facture ayant reçu un paiement ne peut etre modifiée, vous pouvez la supprimer et reprendre le processus!');
        } else {
            this.router.navigate(['/gestock/sortieStock'], {queryParams: {id: id}})
        }
    }

    deleteElement(factureToAnnulate: Facture) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler le processus de facturation? Si la facture à déja subit un paiement ce paiement sera automatiquement supprimé!',
            accept: () => {
                if (factureToAnnulate === null) {
                    return;
                } else {

                    if (factureToAnnulate.id != null) {
                        this.factureService.Annulerfacture(factureToAnnulate).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'ANNULATION', 'Annulation du processus effectuée avec succès !');
                                this.sortiebool = false;
                            },
                            () => this.showMessage('error', 'ANNULATION', 'Echec de lannulation !')
                        );
                    }
                }
            }
        });
    }


    loadAll() {
        this.loading = true; // Début du chargement
        this.factureService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.factures = res.payload;
                this.loading = false; // Fin du chargement
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

    /*    getEntreesByFactureId(facture: FactureEntree) {
            if (facture.id != null) {
                this.entreeStockService.getEntreeByFactureId(facture.id).subscribe(
                    (res) => {
                        console.log(res);
                        this.factures.forEach(factureverif => {
                            if (factureverif.id === facture.id) {
                                factureverif.listEntrees = res.payload;
                            }
                        })
                    }
                );
            }
        }*/

    getRecuByFactureId(factureId: number) {
        this.recuService.getRecuByFactureId(factureId).subscribe(
            (res) => {
                this.factures.forEach(factureverif => {
                    if (factureverif.id === factureId) {
                        factureverif.listRecus = res.payload;
                    }
                })
            }
        );
    }

    // @ts-ignore
    getSeverity(status: string): string {
        switch (status) {
            case 'dette':
                return 'danger';

            case 'payé':
                return 'success';
        }
    }


    annuler() {
        this.activepaiementbool = false;
    }

    save(editForm: NgForm) {
        this.facture.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {

            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer une nouvelle facture?',

                accept: () => {

                    if (this.facture?.id) {

                        // @ts-ignore
                        this.factureService.update(this.facture).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                this.display = false;
                            },

                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                        editForm.resetForm();
                        this.display = false;
                    } else {

                        // @ts-ignore
                        this.factureService.save(this.facture).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                this.display = false;
                            },

                            () => this.showMessage('error', 'Ajout', 'Echec Ajout !')
                        );
                        this.loadAll();
                        this.display = false;
                        editForm.resetForm();
                    }

                }
            });

        } else {

            this.showMessage('error', 'ENREGISTREMENT', 'Une facture de la meme hauteur existe déja !');

        }

    }

    addsortie() {
        this.router.navigate(['/gestock/sortieStock'])
    }

    async saveManyRecus() {

        let montant_allouer = this.recu.montant;

        if (montant_allouer! <= this.total_a_payer) {
            this.reste = 0;
            this.authorization = true
            for (const facture of this.factures) {

                if (facture.reste! < montant_allouer!) {
                    this.reste = montant_allouer! - facture.reste!;
                    if (facture.reste != null) {
                        this.recu.montant = facture.reste;
                    }
                }

                if (facture.reste! > montant_allouer!) {
                    this.reste = 0;
                    this.recu.montant = montant_allouer;
                }

                if (facture.reste! == montant_allouer!) {
                    this.reste = 0;
                    this.recu.montant = montant_allouer;
                }

                if (facture.id != null) {
                    this.recu.factureId = facture.id;
                }
                this.recu.societyId = JSON.parse(this.tokenStorage.getsociety()!);

                if (this.authorization) {
                    try {
                        await this.recuService.saveNewRecu(this.recu).toPromise();

                        if (this.reste == 0) {
                            this.authorization = false
                        }
                        if (this.reste > 0) {
                            this.authorization = true
                            montant_allouer = this.reste;
                        }

                    } catch (error) {
                        this.showMessage('error', 'Ajout', 'Echec Ajout !');
                    }
                } else {
                    this.loadAll();
                    this.showMessage('success', 'Enregistremenet', 'Paiement effectué avec succès !');
                    this.displayPaiementG = false;
                }
            }
            if (!this.authorization) {
                this.loadAll();
                this.showMessage('success', 'Enregistremenet', 'Paiement effectué avec succès !');
                this.displayPaiementG = false;
                this.clientselected = undefined;
            }
        } else {
            this.showMessage('error', 'Paiement impossible', 'Le total versé ne peut exceder le total général !');
        }
    }

    saveRecu(editForm: NgForm) {
        if (!this.modifyrecu) {
            this.recu.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            if (this.factureSelected.id != null) {
                this.recu.factureId = this.factureSelected.id;
            }
            // @ts-ignore
            if (this.recu.montant <= this.factureSelected.reste) {
                this.confirmationService.confirm({
                    header: 'ENREGISTREMENT',
                    message: 'Voulez-vous vraiment enregistrer ce paiement?',

                    accept: () => {
                        this.recuService.saveNewRecu(this.recu).subscribe(
                            value => {
                                this.loadAll();
                                this.showMessage('success', 'Enregistremenet', 'Paiement effectué avec succès !');
                                this.activepaiementbool = false;
                                this.getRecuByFactureId(this.recu.factureId)
                                this.reportrecu(value.payload.id!);

                            },

                            () => this.showMessage('error', 'Erreur Paiement', 'Echec lors du paiement !')
                        );
                        this.loadAll();
                        this.activepaiementbool = false;
                        editForm.resetForm();
                    }
                });
            } else {
                this.showMessage('error', 'ERREUR', 'Le montant du paiement ne peut exeder celui du reste à payer!');
            }
        } else {
            this.UpdateRecucontent(this.recu, editForm);
        }
    }

    ifExist(): boolean {
        if (this.facture.id) {
            return this.factures.some(
                value =>
                    value.id !== this.facture.id &&
                    value.numero === this.facture.numero
            );
        } else {
            return this.factures.some(value => value.numero === this.facture.numero);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Annuler le processus',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('ANNULER_PROCESSUS_FACTURE'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_FACTURE'),
                    command: ($event: any) => {
                        this.navigateToUpdateFacture(this.selectedItem);
                    }
                },

                {
                    label: 'Facture Sans en-tete',
                    icon: 'pi pi-eye',
                    command: ($event: any) => {
                        this.selectedItem.factureAvecEntete = false;
                        this.report(this.selectedItem.id, 0);
                    }
                },
                {
                    label: 'Facture Avec en-tete',
                    icon: 'pi pi-eye',
                    command: ($event: any) => {
                        this.selectedItem.factureAvecEntete = true;
                        this.report(this.selectedItem.id, 1);
                    }
                },
                {
                    label: 'Paiement',
                    icon: 'pi pi-money-bill',
                    disabled: !this.droits.includes('EFFECTUER_PAIEMENT'),
                    command: ($event: any) => {
                        this.activepaiement(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    activepaiement(facture: FactureSortie) {
        this.modifyrecu = false;
        this.activepaiementbool = true;
        this.factureSelected = facture;
        // @ts-ignore
        this.recu = {};
    }

    reportvalues(id: number) {
        this.factureService.Report(id).subscribe((response) => {
            this.file = new Blob([response], {type: 'application/pdf'});
            // @ts-ignore
            this.fileURL = URL.createObjectURL(this.file);
            const anchor = document.createElement('a');
            anchor.href = this.fileURL;
            anchor.download = "localites_export"; // Set the custom filename here

            // Trigger the download
            anchor.click();
            URL.revokeObjectURL(this.fileURL);
        });
    }

    report(id: number, type: number) {
        this.factureService.generateReportforFacture(id, type).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], {type: 'application/pdf'});
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }

    reportrecu(id: number) {
        this.recuService.generateReport(id).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], {type: 'application/pdf'});
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getfacturesbyclients(event: any) {
        if (event.value != null) {
            this.factureService.getfacturesnonpayesbyclient(JSON.parse(this.tokenStorage.getsociety()!), this.clientselected?.id!).subscribe(
                (res) => {
                    this.factures = res.payload;
                    this.total_a_payer = 0;
                    this.total_factures = this.factures.length;
                    this.factures.forEach(fact => {
                        this.total_a_payer = this.total_a_payer + fact.reste!
                    })
                }
            );
        } else {
            this.loadAll();
        }
    }

    modifyRecu(recu: Recu, facture: FactureSortie) {
        this.recu = recu;
        this.montant_a_rajouter = this.recu.montant;
        this.factureSelected = facture;
        this.modifyrecu = true;
        this.activepaiementbool = true;
    }

    deleteRecu(recuToDelete: Recu) {
        let id = recuToDelete.factureId;
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler le paiement?',
            accept: () => {
                if (recuToDelete === null) {
                    return;
                } else {

                    if (recuToDelete.id != null) {

                        this.recuService.deleteRecu(recuToDelete.id).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                this.getRecuByFactureId(id);
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression est déja utilisé!')
                        );
                    }
                }
            }
        });
    }

    UpdateRecucontent(recu: Recu, editForm: NgForm) {
        recu.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        // @ts-ignore
        this.confirmationService.confirm({
            header: 'MISE A JOUR DU REÇU',
            message: 'Voulez-vous vraiment modifier ce reçu?',

            accept: () => {
                this.recuService.updateRecu(this.recu).subscribe(
                    value => {
                        this.loadAll();
                        this.showMessage('success', 'Enregistremenet', 'Paiement effectué avec succès !');
                        this.activepaiementbool = false;
                        this.getRecuByFactureId(recu.factureId)
                        this.reportrecu(value.payload.id!);
                    },
                    () => this.showMessage('error', 'Erreur Paiement', 'Echec lors du paiement !')
                );
                this.loadAll();
                this.activepaiementbool = false;
                editForm.resetForm();
            }
        });
    }
}
