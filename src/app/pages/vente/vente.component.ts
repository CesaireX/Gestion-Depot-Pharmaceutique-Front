import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    Assurance,
    BonCommande,
    Client,
    Commande,
    Facture,
    LigneMagasin,
    Magasin,
    PaiementFactureDTO,
    Produit,
    Societe,
    Sortie_stock,
    Taxe,
    VentesDuJourData
} from "../../store/entities/gestock.entity";
import {ConfirmationService, MenuItem, Message, MessageService} from "primeng/api";
import {ClientService} from "../../store/services/gestock-service/Client.service";
import {MagasinService} from "../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../store/services/gestock-service/Produit.service";
import {TaxeService} from "../../store/services/gestock-service/Taxe.service";
import {TokenStorage} from "../../store/storage/tokenStorage";
import {NgForm} from "@angular/forms";
import {OverlayPanel} from "primeng/overlaypanel";
import {Table} from "primeng/table";
import {BonCommandeService} from "../../store/services/gestock-service/BonCommandeService";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin, lastValueFrom, map} from "rxjs";
import {FactureFournisseurClientService} from "../../store/services/gestock-service/Factureclientfournisseur.service";
import {LigneMagasinService} from "../../store/services/gestock-service/LigneMagasin.service";
import {RecuService} from "../../store/services/gestock-service/Recu.service";
import {Sortie_stockService} from "../../store/services/gestock-service/Sortie_stock.service";
import {formatDate} from "@angular/common";
import {SocieteService} from "../../store/services/gestock-service/Societe.service";
import html2pdf from 'html2pdf.js';
import {PaiementService} from "../../store/services/gestock-service/Paiement.service";
import {AssuranceService} from "../../store/services/gestock-service/Assurance.service";
import {RapportActiviteService} from "../../store/services/gestock-service/etats-gest-service/RapportActivite.service";

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
    selector: 'app-vente',
    templateUrl: './vente.component.html',
    styleUrls: ['./vente.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class VenteComponent implements OnInit {
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
    assurances: Assurance[] = [];
    selectedAssurance?: Assurance = {};
    selectedProducts: any;
    articles: {
        produitId: number,
        magasin: any | undefined,
        quantite: number | null;
        produitPrix: number,
        produitNom: string,
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
    sexePatient: string = '';
    nomAssure: string = '';
    relationAssure: string = '';

    sexeOptions = [
        { label: 'Homme', value: 'Homme' },
        { label: 'Femme', value: 'Femme' }
    ];

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
    display: boolean = false;
    @ViewChild('printSection') printSection!: ElementRef;
    ventesDuJourData: VentesDuJourData = {};
    totalAvecAssurance: number = 0;
    montantAssurance: number = 0;
    montantAPayer: number = 0;
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
        private rapportActiviteService: RapportActiviteService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
        this.getVentesDuJour();
        this.route.paramMap.subscribe(params => {
            const mode = params.get('mode');
            this.createOrModify = mode !== 'create'; // Si mode=history, on est dans l'historique
        });
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.droits = this.tokenStorage.getdroits();
            this.societyId = JSON.parse(this.tokenStorage.getsociety()!);

            const societePromise = this.societeService.findOne(this.societyId).toPromise();
            this.setInitialInvoiceNumber();
            const loadInvoicesPromise = this.loadInvoices();

            await Promise.all([societePromise, loadInvoicesPromise]);

            const societe = await societePromise;
            this.societegetted = societe!.payload;

            await this.loadData();

            this.bonCommandeId = +this.route.snapshot.paramMap.get('id')!;
            if (this.bonCommandeId) {
                this.selectBonCommandeDatas(this.bonCommandeId);
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
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }

    customizeBonCommandeNumber() {
        const customNumber = prompt('Initialiser le numéro à :');
        if (customNumber) {
            const prefix = this.newBonCommandeNumber.substring(0, this.newBonCommandeNumber.lastIndexOf('-') + 1);
            this.newBonCommandeNumber = `${prefix}${customNumber}`;
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

    print() {
        const printContent = this.printSection.nativeElement.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();  // Recharger la page pour restaurer le contenu original
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

    async loadData() {
        const [allData] = await Promise.all([
            this.loadall().toPromise()
        ]);
        this.clients = allData!.clients;
        this.articleOptions = allData!.articleOptions;
        this.magasins = allData!.magasins;
        this.assurances = allData!.assurances;
        console.log( this.assurances )
    }

    loadall() {
        const society = JSON.parse(this.tokenStorage.getsociety()!);
        const clients$ = this.clientService.findbysociety(society);
        const articleOptions$ = this.produitService.findbysociety(society);
        const magasins$ = this.magasinService.findbysociety(society);
        const taxes$ = this.taxeService.findbysociety(society).pipe(
            map((res: any) => res.payload.map((tax: Taxe) => ({
                id: tax.id!,
                label: tax.libelle!,
                value: tax.hauteur!
            })))
        );

        const assurances$ = this.assuranceService.findbysociety(society);

        return forkJoin({
            clients: clients$,
            articleOptions: articleOptions$,
            magasins: magasins$,
            taxes: taxes$,
            assurances: assurances$
        }).pipe(
            map((results: any) => ({
                clients: results.clients.payload,
                articleOptions: results.articleOptions.payload,
                magasins: results.magasins.payload,
                taxes: results.taxes,
                assurances: results.assurances.payload
            }))
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

        console.log(this.bonCommandes);
        console.log(this.bonCommande);

        this.remise = this.bonCommande?.remise!;
        this.sousTotal = this.bonCommande?.sous_total!;
        this.fraisExpedition = this.bonCommande?.frais_expedition!;
        this.ajustement = this.bonCommande?.ajustement!;
        this.total = this.bonCommande?.montant_total!;
        this.montantAssurance = this.bonCommande?.montantAssurance!;
    }

    loadInvoices(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.factureService.findClientInvoicesBySocieteId(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.factures = res.payload;
                    this.filteredFactures = this.factures;
                    console.log(this.filteredFactures)
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


    onRowSelected(event: any): void {
        console.log('yyyy')
        this.addProduct(event.data);
    }

    onRowUnselected(event: any): void {
        console.log('rrrrrr')
        this.onProductDeselected(event.data);
    }

    onCheckboxChange(event: any, product: any): void {
        const isChecked = event.checked;
        if (isChecked) {
            this.addProduct(product); // Ajouter le produit si coché
        } else {
            this.onProductDeselected(product); // Retirer le produit si décoché
        }
    }

    supprimerLigne(index: number) {
        if (this.articles.length > 0) {
            const removedArticle = this.articles[index];
            this.articles.splice(index, 1);

            if (removedArticle.produitId) {
                this.selectedProducts = this.selectedProducts.filter(product => product.id !== removedArticle.produitId);
            }
            this.calculateTotal();
        }
    }


    calculerMonnaie(event: any): void {
        this.montantDonne = event.value;

        // Vérifier si le montant donné est supérieur ou égal au montant à payer (après assurance)
        if (this.montantDonne >= this.montantAPayer) {
            this.monnaie = this.montantDonne - this.montantAPayer;
        } else {
            this.monnaie = 0;
        }
    }


    onProductDeselected(product: any) {
        const index = this.articles.findIndex(article => article.produitId === product.id);
        this.supprimerLigne(index);
    }

    getVentesDuJour(): void {

        this.rapportActiviteService.getVentesDuJour(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {

                this.ventesDuJourData = resp.payload;
                console.log(this.ventesDuJourData)
                this.loading = false;
            },
            error => {
                console.error('Erreur lors de la récupération des Rapport activité :', error);
                this.loading = false;
            }
        );
    }

    addProduct(product: any): void {
        // Vérifiez si le produit est déjà dans la liste
        if (this.articles.some(article => article.produitId === product.id)) {
            this.errorMessage = "Ce produit est déjà ajouté.";
            return;
        }
        // Créez un nouvel article avec l'assurance globale si elle existe
        const newArticle = {
            produitId: product.id,
            produitNom: product.nom,
            magasin: undefined,
            quantite: null,
            produitPrix: product.prixventettc || 0,
            montant: 0,
            initialQuantite: 0,
            taxeLibelle: '',
            stocks: [],
            commandeId: null
        };

        this.articles.push(newArticle);
        this.updateMontantWithAssurance(this.articles.length - 1);
        this.calculateTotal();
        this.loadStockDetails(product.id, this.articles.length - 1);
        this.errorMessage = '';
    }

    onQuantiteChange(event: any, index: number): void {
        this.articles[index].quantite = event.value;
        this.updateMontantWithAssurance(index);
        this.calculateTotal();
    }

    onPrixChange(event: any, index: number): void {
        this.articles[index].produitPrix = event.value;
        this.updateMontantWithAssurance(index);
        this.calculateTotal();
    }


    onGlobalAssuranceChange(): void {
        this.calculateTotal();
    }

    updateMontantWithAssurance(index: number): void {
        const article = this.articles[index];
        if (article.quantite != null) {
            const articleTotal = article.quantite * article.produitPrix;
            article.montant = articleTotal ;
            article.montant = +article.montant.toFixed(2);
        }
    }


    calculateTotal(): void {
        // Calcul du sous-total (montant total sans assurance)
        this.sousTotal = this.articles.reduce((acc, article) => acc + article.montant, 0);
        this.sousTotal = +this.sousTotal.toFixed(2);

        // Conserver le montant total sans assurance
        this.total = this.sousTotal;

        // Calcul de la prise en charge par l'assurance
        const assuranceHauteur: number = (this.selectedAssurance != null &&
            typeof this.selectedAssurance.hauteur === 'number' &&
            !isNaN(this.selectedAssurance.hauteur))
            ? this.selectedAssurance.hauteur
            : 0;

        const assuranceCouverture = this.sousTotal * (assuranceHauteur / 100);
        this.montantAssurance = +assuranceCouverture.toFixed(2);

        // Calcul du montant à payer (après déduction de l'assurance)
        this.montantAPayer = this.sousTotal - this.montantAssurance;
        this.montantAPayer = +this.montantAPayer.toFixed(2);

        // Calcul de la monnaie rendue basé sur le montant à payer
        if (this.montantDonne >= this.montantAPayer) {
            this.monnaie = this.montantDonne - this.montantAPayer;
        } else {
            this.monnaie = 0;
        }
    }




    calculateMontantAssure(facture: any): number {
        console.log(facture.assuranceValue)
        return (facture.montant_total * (facture.assuranceValue || 0)) / 100;
    }

    calculateMontant(facture:any, item: any): number {
        console.log(facture.assuranceValue)
        const assuranceMultiplier = (facture.assuranceValue || 0) / 100;
        return ((item.quantite! * item.produitPrix!)-(item.quantite! * item.produitPrix! * assuranceMultiplier));
    }

    scrollToTop() {
        window.scrollTo(0, 0);
    }

    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({
            severity: severity,
            summary: summary,
            detail: detail
        });
    }

    ifExist(): boolean {
        if (this.facture.id) {
            return this.factures.some(
                value =>
                    value.id !== this.facture.id &&
                    value.numero === this.facture.numero);
        } else {
            return this.factures.some(value => value.numero === this.newBonCommandeNumber);
        }
    }

    async loadAllArticles(): Promise<void> {
        this.loading = true; // Début du chargement
        try {
            const societyId = JSON.parse(this.tokenStorage.getsociety()!);
            const res = await lastValueFrom(this.produitService.findbysociety(societyId));
            this.articleOptions = res.payload;
        } catch (error) {
            console.error("Erreur lors du chargement des produits :", error);
        } finally {
            this.loading = false; // Fin du chargement, qu'il y ait une erreur ou non
        }
    }


    onSubmit(ngForm: NgForm) {
        this.errorMessage = '';
        // Validation: Vérifier si chaque article est sélectionné
        if (!this.client?.id) {
            if (this.clients && this.clients.length > 0) {
                this.client = this.clients[0]; // Sélectionner le premier client
            } else {
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: 'Aucun client trouvé dans la base de données. Veuillez vérifier.'}
                ];
                return;
            }
        }


        if (!this.newBonCommandeNumber) {
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Veuillez saisir un numéro de facture.`}
            ];
            return;
        }


        for (let i = 0; i < this.articles.length; i++) {
            if (!this.articles[i].produitId) {
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `L'article à la ligne ${i + 1} n'est pas sélectionné.`}
                ];
                return;
            } else if (!this.articles[i].magasin) {
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `Veuillez selectionner un magasin pour L'article à la ligne ${i + 1} .`}
                ];
                return;
            } else if (this.articles[i].initialQuantite == 0) {
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `L'article à la ligne ${i + 1}  n'est pas dans le magasin selectionné.`}
                ];
                return;
            } else if (this.articles[i].quantite==null||(this.articles[i].initialQuantite < this.articles[i].quantite!)) {
                this.scrollToTop();
                this.messages = [
                    {
                        severity: 'error',
                        detail: `Pour L'article à la ligne ${i + 1} sélectionnez une quantité inferieure ou équal au stock disponible.`
                    }
                ];
                return;
            }
        }


        this.facture.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.facture.numero = this.newBonCommandeNumber;
            this.facture.ajustement = this.ajustement;
            this.facture.lastNumber = this.newBonCommandeNumber.split('-').pop()!
            this.facture.date_facture = this.dateFacture;
            this.facture.date_echeance = this.dateEcheance;
            this.facture.remise = this.remise;
            this.facture.sous_total = this.sousTotal;
            this.facture.montant_total = this.total;
            this.facture.montantAssurance = this.montantAssurance;
            this.facture.clientId = this.client?.id;
            this.facture.boncommandeId = this.bonCommande.id;
            console.log(this.selectedAssurance)
            this.facture.assuranceId = this.selectedAssurance?.id ;
            if (this.selectedType == 'assure') {
                this.facture.nomAssure = this.nomAssure;
                this.facture.nomPatient = this.nomPatient;
                this.facture.matriculeAssure = this.matriculeAssure;
                this.facture.codeIDAssure = this.codeIDAssure;
                this.facture.agePatient = this.agePatient;
                this.facture.sexePatient = this.sexePatient;
                this.facture.relationAssure = this.relationAssure;
                this.facture.assure = true;
            }

            if (this.facture.clientId) {
                console.log("fffffff")
                this.facture.listSorties = this.articles.map(article => this.transformToSortie(article));
            }
            this.facture.createdBy = "false";
            console.log(this.facture)
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer une nouvelle facture client ?',
                accept: () => {
                    if (this.facture?.id) {
                        let id = this.facture.id;
                        this.chrgmt = true;
                        this.factureService.updateFacture(this.facture).subscribe(
                            () => {
                                this.getVentesDuJour();
                                this.loadAllArticles();
                                this.loadInvoices().then(() => {
                                    this.resetForm();
                                    // @ts-ignore
                                    this.facture = this.factures.find(f => f.id == id)
                                    //this.onRowSelect(this.facture)

                                    this.chrgmt = false;
                                    this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                    this.createOrModify = false;
                                });
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                    } else {
                        this.chrgmt = true;
                        this.factureService.save(this.facture).subscribe(
                            () => {
                                this.getVentesDuJour();
                                this.loadAllArticles();
                                this.loadInvoices().then(() => {
                                    // @ts-ignore
                                    this.chrgmt = false;
                                    this.showMessage('success', 'Succès', 'La facture fournisseur a été enregistrée.');
                                    this.createOrModify = false;
                                    this.isSecondaryActive = false;
                                    this.resetForm();
                                });
                            },
                            (error) => {
                                console.error('Erreur lors de l\'enregistrement de la facture fournisseur :', error);
                                this.showMessage('error', 'Erreur', 'Erreur lors de l\'enregistrement de la facture fournisseur.');
                            }
                        );
                    }
                }
            });
        } else {
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Une facture client avec le même numéro existe déjà !`}
            ];
            return;
        }
    }


    resetForm() {
        this.facture = {};
        this.client = undefined;
        this.reference = '';
        this.nomAssure = '';
        this.nomPatient = '';
        this.matriculeAssure = '';
        this.codeIDAssure = '';
        this.agePatient = '';
        this.sexePatient = '';
        this.relationAssure = '';
        this.selectedAssurance={};
        this.selectedType = 'nonAssure';
        this.dateFacture = new Date();
        this.dateEcheance = new Date();
        this.isDeliveryDateValid = true;
        this.articles = [];
        this.sousTotal = 0;
        this.remise = 0;
        this.ajustement = 0;
        this.remiseType = 0;
        this.messages = [];
        this.bonCommandeId = undefined;
        this.bonCommande = {};
        this.montantDonne=0;
        this.monnaie=0;
        this.total = 0;
        this.montantAssurance=0;
        this.montantAPayer=0;
        this.selectedProducts=[];
    }

    transformToSortie(article: any): Sortie_stock {
        return {
            id: article.id,
            commandeId: article.commandeId,
            produitId: article.produitId,
            magasinId: article.magasin.idMagasin,
            produitNom: article.produitNom,
            produitPrix: article.produitPrix,
            quantite: article.quantite,
            societyId: JSON.parse(this.tokenStorage.getsociety()!),
        };
    }

    async sortieStockToArticles(sorties: Sortie_stock[]): Promise<any[]> {
        return Promise.all(sorties.map(async (sortie) => {
            const articleTotal = sortie.quantite! * sortie.produitPrix!;
            const assurance = this.assurances.find(t => t.id === sortie.assuranceId);
            const assuranceCouverture = articleTotal * (assurance ? assurance.hauteur! / 100 : 0);

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
                montant: articleTotal  - assuranceCouverture,
                initialQuantite: initialQuantite1,
            };
        }));
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
                                this.getVentesDuJour();
                                this.loadInvoices().then(() => {
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


    async createModify(facture: Facture) {
        this.chrgmt = true;
        try {
            if (facture.id) {
                console.log(facture.assuranceId)
                this.client = this.clients.find(t => t.id === facture.clientId);
                this.selectedAssurance = this.assurances.find(t => t.id === facture.assuranceId);
                console.log(this.selectedAssurance)
                console.log(this.facture);
                if (this.facture.assure == true) {
                    this.selectedType = 'assure'
                    this.nomAssure = this.facture.nomAssure!;
                    this.nomPatient = this.facture.nomPatient!;
                    this.matriculeAssure = this.facture.matriculeAssure!;
                    this.codeIDAssure = this.facture.codeIDAssure!;
                    this.agePatient = this.facture.agePatient!;
                    this.sexePatient = this.facture.sexePatient!;
                    this.relationAssure = this.facture.relationAssure!;
                }
                if (this.facture.boncommandeId) {
                    const bonCommandeResponse = await this.bonCommandeService.findOne(this.facture.boncommandeId).toPromise();
                    if (bonCommandeResponse !== undefined) {
                        this.bonCommande = bonCommandeResponse.payload;
                        console.log(this.bonCommande);
                        this.bonCommandes.push(this.bonCommande);
                        console.log(this.bonCommandes);
                    }
                    const commandesResponse = await this.bonCommandeService.getCommandeByBonId(this.facture.boncommandeId).toPromise();
                    this.commandes1 = commandesResponse!.payload;
                }

                await this.loadSortieByInvoice(facture.id!);


                this.newBonCommandeNumber = facture.numero!;

                // Convertir bon.date_commande en Date
                if (Array.isArray(facture.date_facture) && facture.date_facture.length >= 5) {
                    this.dateFacture = new Date(
                        facture.date_facture[0],      // Année
                        facture.date_facture[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                        facture.date_facture[2],      // Jour
                        facture.date_facture[3],      // Heure
                        facture.date_facture[4]       // Minute
                    );
                }

                // Convertir bon.date_livraison en Date
                if (Array.isArray(facture.date_echeance) && facture.date_echeance.length >= 5) {
                    this.dateEcheance = new Date(
                        facture.date_echeance[0],      // Année
                        facture.date_echeance[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                        facture.date_echeance[2],      // Jour
                        facture.date_echeance[3],      // Heure
                        facture.date_echeance[4]       // Minute
                    );
                }

                this.sousTotal = facture.sous_total!;
                this.remise = facture.remise!;
                this.ajustement = facture.ajustement!;
                this.total = facture.montant_total!;
                this.montantAssurance = facture.montantAssurance!;
                this.montantAPayer = facture.montant_total!-facture.montantAssurance!;
                this.remiseType = 0;
            } else {
                this.resetForm();
            }
        } catch (error) {
            console.error('Error in createModify:', error);
        } finally {
            this.chrgmt = false; // Cache l'indication de chargement à la fin
        }

        this.createOrModify = false;
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

    viewBon(facture: Facture) {
        this.router.navigate(['gestock/commandeClient'], {queryParams: {idtowatch: facture.boncommandeId}});
    }

    retour() {
        this.createOrModify = true;
       // this.facture = this.factureSelect
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

    annler() {
        this.resetForm();
    }

    clearDropdowns() {
        this.nomAssure = '';
        this.nomPatient = '';
        this.matriculeAssure = '';
        this.codeIDAssure = '';
        this.agePatient = '';
        this.sexePatient = '';
        this.relationAssure = '';
        this.montantDonne=0;
        this.monnaie=0;
        this.total = 0;
        this.montantAssurance=0;
        this.montantAPayer=0;
        this.selectedAssurance={};
        this.articles=[];
    }
}
