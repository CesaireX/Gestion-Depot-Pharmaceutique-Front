import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    BonCommande,
    Client,
    Commande,
    Facture,
    LigneMagasin,
    Magasin,
    PaiementFactureDTO,
    Produit,
    Societe,
    Sortie_stock
} from "../../store/entities/gestock.entity";
import {ConfirmationService, MenuItem, Message, MessageService} from "primeng/api";
import {ClientService} from "../../store/services/gestock-service/Client.service";
import {MagasinService} from "../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../store/services/gestock-service/Produit.service";
import {TaxeService} from "../../store/services/gestock-service/Taxe.service";
import {TokenStorage} from "../../store/storage/tokenStorage";
import {Table} from "primeng/table";
import {BonCommandeService} from "../../store/services/gestock-service/BonCommandeService";
import {ActivatedRoute, Router} from "@angular/router";
import {FactureFournisseurClientService} from "../../store/services/gestock-service/Factureclientfournisseur.service";
import {LigneMagasinService} from "../../store/services/gestock-service/LigneMagasin.service";
import {RecuService} from "../../store/services/gestock-service/Recu.service";
import {Sortie_stockService} from "../../store/services/gestock-service/Sortie_stock.service";
import {formatDate} from "@angular/common";
import {SocieteService} from "../../store/services/gestock-service/Societe.service";
import html2pdf from 'html2pdf.js';
import {PaiementService} from "../../store/services/gestock-service/Paiement.service";
import {AssuranceService} from "../../store/services/gestock-service/Assurance.service";

interface TableRowSelectEvent {
    originalEvent?: Event;
    data?: any;
    type?: string;
    index?: number;
}

export interface StockDetail {
    idMagasin: number;
    magasinNom: string;
    stock_physique_dispo: number;
    stock_physique_engage: number;
    stock_physique_dispo_vente: number;
}

@Component({
    selector: 'app-vente-assurance',
    templateUrl: './vente-assurance.component.html',
    styleUrls: ['./vente-assurance.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class VenteAssuranceComponent implements OnInit {
    client?: Client;
    article?: Produit;
    numeroFacture: string = 'FF-00001';
    reference: string = '';
    dateFacture: Date = new Date();
    dateEcheance: Date = new Date();
    isDeliveryDateValid: boolean = true;
    isSecondaryActive = false;
    // @ts-ignore
    items: MenuItem[];
    loading: boolean = true;
    facture: Facture = {};
    factureSelect: Facture = {};
    taxes: { id: number, label: string, value: number }[] = [];
    assurances: { id: number, label: string, value: number }[] = [];
    selectedProducts: any;
    articles: {
        produitId: number,
        magasin: any | undefined,
        quantite: number,
        produitPrix: number,
        produitNom: string,
        taxeLibelle: string,
        assuranceLibelle: string,
        taxe: number,
        assurance: number,
        montant: number,
        initialQuantite: number,
        stocks?: StockDetail[],
        commandeId: number | null
    }[] = [];
    sousTotal = 0;
    fraisExpedition = 0;
    remise = 0;
    ajustement = 0;
    total = 0;
    remiseType: any; // default type
    messages: Message[] | undefined;
    modal = '';
    articleOptions: Produit[] = [];
    magasins: Magasin[] = [];
    magasin?: Magasin;

    searchQuery: string = '';
    filteredMagasins: any[] = [];

    nomPatient: string = '';
    matriculeAssure: string = '';
    codeIDAssure: string = '';
    agePatient: string = '';
    nomAssure: string = '';
    relationAssure: string = '';

    remiseOptions = [
        {label: '%', value: 0},
        {label: 'XOF', value: 1}
    ];

    // Variables pour la gestion du numéro de facture
    facturePrefix: string = 'FFA-';
    lastInvoiceNumber: number = 13;
    errorMessage: string = '';
    createOrModify: boolean = false;
    selectedType: string = 'nonAssure';
    clients: Client[] = [];
    factures: Facture[] = [];
    commandes: Commande[] = [];
    bonCommande: BonCommande = {};
    bonCommandeId: number | undefined;
    bonCommandes: BonCommande[] = [];
    recuState: boolean = false;
    idfacture: any;


    commandes1: Commande[] = [];
    newBonCommandeNumber: any;
    societyId: any;
    societegetted: Societe = {};
    checked: boolean = false;
    clientselected?: Client;
    filteredFactures: Facture[] = [];
    selectedfactures: Facture[] = [];
    factureIDS: number[] = [];
    paiementtowatch: PaiementFactureDTO = <PaiementFactureDTO>{};
    facturetoWach: Facture = <Facture>{};
    chrgmt: boolean = false;
    facturestoWach: Facture[] = [];
    droits: any;
    montantDonne: number = 0;
    monnaie: number = 0;
    @ViewChild('printSection') printSection!: ElementRef;
    type?: "NON_REMBOURSE" | "REMBOURSE";

    constructor(
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        private confirmationService: ConfirmationService,
        private bonCommandeService: BonCommandeService,
        private clientService: ClientService,
        private magasinService: MagasinService,
        private produitService: ProduitService,
        private factureService: FactureFournisseurClientService,
        private taxeService: TaxeService,
        private assuranceService: AssuranceService,
        private sortieStockService: Sortie_stockService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected recuService: RecuService,
        private paymentService: PaiementService,
        protected societeService: SocieteService,
        private ligneMagasinService: LigneMagasinService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.droits = this.tokenStorage.getdroits();
            this.societyId = JSON.parse(this.tokenStorage.getsociety()!);

            const societePromise = this.societeService.findOne(this.societyId).toPromise();
            this.setInitialInvoiceNumber();
            this.type = this.route.snapshot.queryParams['type'] as 'NON_REMBOURSE' | 'REMBOURSE';
            const loadInvoicesPromise = this.loadInvoices(this.type);

            await Promise.all([societePromise, loadInvoicesPromise]);

            const societe = await societePromise;
            this.societegetted = societe!.payload;


            this.bonCommandeId = +this.route.snapshot.paramMap.get('id')!;
            if (this.bonCommandeId) {
                this.selectBonCommandeDatas(this.bonCommandeId);
                console.log(this.bonCommandeId);
            }

            this.route.queryParams.subscribe((params) => {
                this.idfacture = params['idfacture'];
                if (this.idfacture != null) {
                    // @ts-ignore
                    this.facture = this.factures.find(fact => fact.id == this.idfacture);
                    this.onRowSelect(this.facture);
                }
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false;
        }
    }


    generateBonCommandeNumber(lastCommandNumber: string): string {
        const today = new Date();
        const formattedDate = formatDate(today, 'yyyyMMdd', 'en-US');

        const lastNumber = parseInt(lastCommandNumber, 10);
        const newCommandNumber = lastNumber + 1;

        const commandNumberLength = lastCommandNumber.toString().length;
        return `FA/${this.tokenStorage.getusername().charAt(0).toUpperCase()}${this.tokenStorage.getusername().charAt(1).toUpperCase()}/${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }

    // Initialiser le numéro de facture lors du chargement du composant
    setInitialInvoiceNumber() {
        this.numeroFacture = this.generateInvoiceNumber(this.lastInvoiceNumber);
    }

    generateInvoiceNumber(lastNumber: number): string {
        return this.facturePrefix + String(lastNumber).padStart(5, '0');
    }

    generatePDF() {
        this.chrgmt = true; // Affiche l'indication de chargement

        if (this.checked) {
            this.startPdf();
        } else {
            this.checked = !this.checked;
            // Attendez que Angular mette à jour la vue
            setTimeout(() => {
                this.startPdf();
            }, 1); // Un court délai permet à Angular de mettre à jour la vue
        }
    }

    validerRemboursement(factureId: number): void {
        console.log("dddddddddddddddd")
        this.confirmationService.confirm({
                header: 'Confirmer le Remboursement',
                message: 'Êtes-vous sûr de vouloir valider ce remboursement ?',
                accept: () => {
                this.factureService.markAsRembourse(factureId).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Remboursement validé avec succès.'
                        });
                        this.isSecondaryActive = false;
                        this.loadInvoices(this.type!);
                        console.log("ffffffffffffff")
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de valider le remboursement.'
                        });
                        console.log("gggggggggggg")
                    }
                });
            },
        }
        );
    }
    startPdf() {
        const element = document.getElementById('commandeClient');

        // Obtient l'heure actuelle
        const now = new Date();
        const date = now.getDate();
        const heures = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const secondes = now.getSeconds().toString().padStart(2, '0');

        // Formate le nom du fichier
        const nomFichierPDF = `Facture N° ${this.facture.numero} ${date}- ${heures}-${minutes}-${secondes}.pdf`;

        const options = {
            filename: nomFichierPDF // Utilisez le nom de fichier formaté
        };

        html2pdf()
            .from(element)
            .set(options)
            .save()
            .then(() => {
                this.chrgmt = false; // Cache l'indication de chargement après la sauvegarde
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                this.chrgmt = false; // Cache l'indication de chargement même en cas d'erreur
            });
    }

    imprimerTicketThermique(facture: Facture) {
        if (!facture) {
            this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Aucune facture sélectionnée'});
            return;
        }

        this.factureService.imprimerTicket(facture).subscribe(
            (response) => {
                if (response && response.success) {
                    this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Ticket imprimé avec succès'});
                } else {
                    this.messageService.add({severity: 'error', summary: 'Erreur', detail: response.message || 'Erreur lors de l\'impression! Verifier si l\'imprimante est connectée.'});
                }
            },
            (error) => {
                console.error('Erreur d\'impression:', error);
                this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'impression du ticket! Verifier si l\'imprimante est connectée.'});
            }
        );
    }

    loadCommandesByBonCommande(id: number) {
        this.bonCommandeService.getCommandeByBonId(id).subscribe(
            (res) => {
                const filteredCommandes = res.payload.filter((commande: Commande) => commande.quantitefacturee !== commande.quantite);

                this.articles = this.commandesToArticles(filteredCommandes);
                this.commandes = filteredCommandes;

                this.articles.forEach((article, index) => {
                    this.loadStockDetails(article.produitId, index);
                });

                this.calculateTotal(); // Recalculate the totals
                console.log(this.commandes);
            }
        );
    }

    async selectBonCommandeDatas(id: number) {
        if (id) {
            await this.bonCommandeService.findOne(id).toPromise().then(
                (res) => {
                    if (res != undefined)
                        this.bonCommande = res.payload;
                    console.log(this.bonCommande)
                    this.bonCommandes.push(this.bonCommande);
                    console.log(this.bonCommandes)
                }
            );
        }

        this.client = this.clients.find(t => t.id === this.bonCommande?.clientId);
        if (!this.createOrModify) {
            this.createOrModify = false;
        }

        this.loadCommandesByBonCommande(this.bonCommande?.id!);
        console.log(this.bonCommandes);
        console.log(this.bonCommande);

        this.remise = this.bonCommande?.remise!;
        this.sousTotal = this.bonCommande?.sous_total!;
        this.fraisExpedition = this.bonCommande?.frais_expedition!;
        this.ajustement = this.bonCommande?.ajustement!;
        this.total = this.bonCommande?.montant_total!;
    }


    loadInvoices(type: 'NON_REMBOURSE' | 'REMBOURSE'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const societyId = JSON.parse(this.tokenStorage.getsociety()!);
            let observable;

            if (type === 'NON_REMBOURSE') {
                observable = this.factureService.findNonRembourseClientInvoicesBySocieteId(societyId);
            } else if (type === 'REMBOURSE') {
                observable = this.factureService.findRembourseClientInvoicesBySocieteId(societyId);
            } else {
                reject(new Error('Type de facture invalide'));
                return;
            }

            observable.subscribe(
                (res) => {
                    this.factures = res.payload;
                    this.filteredFactures = this.factures;
                    console.log(this.factures)
                    this.loading = false;

                    // Obtenez le dernier numéro de commande
                    let lastCommandNumber = '00000';  // valeur par défaut
                    if (this.factures.length > 0 && this.factures[0].lastNumber != null) {
                        lastCommandNumber = this.factures[0].lastNumber;
                    }
                    // Générer le nouveau numéro de bon de commande
                    // @ts-ignore
                    this.newBonCommandeNumber = this.generateBonCommandeNumber(lastCommandNumber);

                    resolve(); // résoudre la promesse une fois les factures chargées
                },
                (error) => {
                    reject(error); // rejeter la promesse en cas d'erreur
                }
            );
        });
    }


    loadSortieByInvoice(id: number) {
        this.sortieStockService.getSortiesByFactures(id).subscribe(
            async (res) => {
                this.articles = await this.sortieStockToArticles(res.payload);
                this.commandes = res.payload;
                console.log(this.commandes);
                console.log(this.articles);
                this.calculateTotal();
                this.articles.forEach((article, index) => {
                    this.loadStockDetails(article.produitId, index);
                });// Recalculate the totals
            }
        );
    }


    calculateTotal(): void {
        this.sousTotal = this.articles.reduce((acc, article) => {
            return (acc + article.montant);
        }, 0);

        let remiseValue = 0;
        if (this.remiseType === 0) {
            remiseValue = this.sousTotal * (this.remise / 100);
        } else if (this.remiseType === 1) {
            remiseValue = this.remise;
        }

        this.total = this.sousTotal - remiseValue + this.ajustement;

        // Formater le total avec deux chiffres après la virgule
        this.total = +this.total.toFixed(2);
        this.sousTotal = +this.sousTotal.toFixed(2)
        if (this.montantDonne >= this.total) {
            this.monnaie = this.montantDonne - this.total;
        } else {
            this.monnaie = 0;
        }
    }


    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({
            severity: severity,
            summary: summary,
            detail: detail
        });
    }

    commandesToArticles(commandes: Commande[]): any[] {
        return commandes.map(command => {
            const taxe = this.taxes.find(t => t.id === command.taxeId);
            const articleTotal = (command.quantite! - command.quantitefacturee!) * command.produitPrix!;
            const taxeTotal = articleTotal * (taxe ? taxe.value / 100 : 0);
            const assurance = this.assurances.find(t => t.id === command.assuranceId);
            const assuranceCouverture = articleTotal * (assurance ? assurance.value / 100 : 0);

            const magasin = this.magasins.find(m => m.id === command.magasinId);
            let initialQuantite1;
            if (this.facture.id) {
                // @ts-ignore
                initialQuantite1 = command.quantitefacturee + command.quantite;
            } else {
                initialQuantite1 = command.quantite! - command.quantitefacturee!;
            }

            return {
                produitId: command.produitId,
                magasin: magasin,
                produitNom: command.produitNom,
                quantite: command.quantite! - command.quantitefacturee!,
                initialQuantite: initialQuantite1,
                produitPrix: command.produitPrix,
                taxe: taxe ? taxe.value : 0,
                taxeLibelle: command.taxeLibelle,
                assurance: assurance,
                montant: articleTotal + taxeTotal - assuranceCouverture,
                commandeId: command.id
            };
        });
    }


    async sortieStockToArticles(sorties: Sortie_stock[]): Promise<any[]> {
        return Promise.all(sorties.map(async (sortie) => {
            const taxe = this.taxes.find(t => t.id === sortie.taxeId);
            const articleTotal = sortie.quantite! * sortie.produitPrix!;
            const taxeTotal = articleTotal * (taxe ? taxe.value / 100 : 0);
            const assurance = this.assurances.find(t => t.id === sortie.assuranceId);
            const assuranceCouverture = articleTotal * (assurance ? assurance.value / 100 : 0);

            const magasin = this.magasins.find(m => m.id === sortie.magasinId);
            let initialQuantite1;

            if (sortie.commandeId != null) {
                const commande = this.commandes1.find(c => c.id === sortie.commandeId);
                if (this.facture.id) {
                    initialQuantite1 = commande?.quantite! - commande?.quantitefacturee! + sortie.quantite!;
                } else {
                    initialQuantite1 = commande?.quantite! - commande?.quantitefacturee!;
                }
            } else {
                try {
                    const p = await this.ligneMagasinService.findByProductAndMagasin(sortie.produitId!, sortie.magasinId!).toPromise();
                    // @ts-ignore
                    const ligne = p.payload;
                    if (this.facture.id) {
                        initialQuantite1 = sortie.quantite! + (ligne?.stock_physique_dispo_vente || 0);
                    } else {
                        initialQuantite1 = (ligne?.stock_physique_dispo_vente || 0);
                    }
                } catch (error) {
                    console.error('Error fetching ligne magasin:', error);
                }
            }

            return {
                id: sortie.id,
                commandeId: sortie.commandeId,
                produitId: sortie.produitId,
                produitNom: sortie.produitNom,
                magasin: magasin,
                quantite: sortie.quantite,
                produitPrix: sortie.produitPrix,
                taxe: taxe ? taxe.value : 0,
                assurance: assurance ? assurance.value : 0,
                montant: articleTotal + taxeTotal - assuranceCouverture,
                initialQuantite: initialQuantite1,
            };
        }));
    }

    getTaxeId(taxeValue?: number): number | undefined {
        const taxe = this.taxes.find(t => t.value === taxeValue);
        return taxe ? taxe.id : undefined;
    }

    getAssuranceId(assuranceValue?: number): number | undefined {
        const assurance = this.assurances.find(t => t.value === assuranceValue);
        return assurance ? assurance.id : undefined;
    }


    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onRowSelect(facture: Facture) {
        this.recuState = false;
        this.facture = facture;
        this.factureSelect = facture;
        this.isSecondaryActive = true;
        this.loadSortieByInvoice(facture.id!)
        this.getPaiementsByFactureId(facture.id!)
    }


    deleteElement(factureToDelete: Facture) {
        console.log(factureToDelete)
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (factureToDelete === null) {
                    return;
                } else {
                    if (factureToDelete.id != null) {
                        this.chrgmt = true;
                        this.factureService.DeleteFacture(factureToDelete).subscribe(
                            () => {
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                this.loadInvoices(this.type!).then(() => {
                                    this.isSecondaryActive = false;
                                    this.chrgmt = false;
                                });
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression !')
                        );
                    }
                }
            }
        });
    }


    formatStatus(status?: boolean): string {
        switch (status) {
            case false:
                return 'Non Remboursée';
            case true:
                return 'Remboursée';
            default:
                return 'Non Remboursée';
        }
    }


    effectuer_paiement(idFacture: number) {
        this.router.navigate(['gestock/caisse'], {queryParams: {idfacture: idFacture}});
    }

    effectuer_paiement_en_bloc() {
        this.selectedfactures.forEach(v => {
            if (v.id != null) {
                this.factureIDS.push(v.id)
            }
        })
        console.log(this.factureIDS)
        const idsString = this.factureIDS.join(',');
        this.router.navigate(['gestock/paiement'], {queryParams: {idfactures: idsString}});
    }


    loadStockDetails(produitId: number, index: number) {
        this.articles[index].stocks = [];
        this.ligneMagasinService.findAllByBesoin(produitId).subscribe(res => {
            const stockDetails = res.payload.map((ligneMagasin: LigneMagasin) => ({
                idMagasin: ligneMagasin.magasinId,
                magasinNom: ligneMagasin.magasinNom,
                stock_physique_dispo: ligneMagasin.stock_physique_dispo || 0,
                stock_physique_engage: ligneMagasin.stock_physique_engage || 0,
                stock_physique_dispo_vente: ligneMagasin.stock_physique_dispo_vente || 0
            }));

            // @ts-ignore
            this.articles[index].stocks = this.magasins.map(magasin => {
                const existingStock = stockDetails.find(detail => detail.idMagasin === magasin.id);
                return {
                    idMagasin: magasin.id,
                    magasinNom: magasin.nom,
                    stock_physique_dispo: existingStock ? existingStock.stock_physique_dispo : 0,
                    stock_physique_engage: existingStock ? existingStock.stock_physique_engage : 0,
                    stock_physique_dispo_vente: existingStock ? existingStock.stock_physique_dispo_vente : 0
                };
            });

            // Sélectionner automatiquement le premier magasin si aucun n'est sélectionné
            // @ts-ignore
            if (!this.articles[index].magasin && this.articles[index].stocks.length > 0) {
                // @ts-ignore
                this.articles[index].magasin = this.articles[index].stocks[0]; // Sélectionner le premier magasin
                this.articles[index].initialQuantite = this.articles[index].magasin.stock_physique_dispo_vente; // Mettre à jour la quantité initiale
            } else if (this.articles[index].magasin) {
                // @ts-ignore
                const selectedMagasin = this.articles[index].stocks.find(s => s.idMagasin === this.articles[index].magasin.id);
                if (selectedMagasin) {
                    this.articles[index].magasin = selectedMagasin;
                }
            }
        });
    }

    getfacturebyclients(event: any) {
        console.log(event.value)
        if (event.value != null) {
            this.filteredFactures = this.factures.filter(facture => facture.clientId === event.value.id)
        } else {
            this.selectedfactures = []
            this.filteredFactures = this.factures
        }
    }

    viewBon(facture: Facture) {
        this.router.navigate(['gestock/commandeClient'], {queryParams: {idtowatch: facture.boncommandeId}});
    }

    retour() {
        this.createOrModify = true;
        this.facture = this.factureSelect
    }

    close() {
        this.isSecondaryActive = false;
    }

    private getPaiementsByFactureId(factureId: number) {
        this.recuService.getPaiementByFactureId(factureId).subscribe(
            (res) => {
                this.factures.forEach(factureverif => {
                    if (factureverif.id === factureId) {
                        factureverif.listPaiements = res.payload;
                    }
                })
            }
        );
    }

}
