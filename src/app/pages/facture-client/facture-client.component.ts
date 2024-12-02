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
    Recu,
    Societe,
    Sortie_stock,
    Taxe
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
import {forkJoin, map} from "rxjs";
import {FactureFournisseurClientService} from "../../store/services/gestock-service/Factureclientfournisseur.service";
import {LigneMagasinService} from "../../store/services/gestock-service/LigneMagasin.service";
import {RecuService} from "../../store/services/gestock-service/Recu.service";
import {Sortie_stockService} from "../../store/services/gestock-service/Sortie_stock.service";
import {formatDate} from "@angular/common";
import {SocieteService} from "../../store/services/gestock-service/Societe.service";
import html2pdf from 'html2pdf.js';
import {PaiementService} from "../../store/services/gestock-service/Paiement.service";

interface TableRowSelectEvent {
    originalEvent?: Event;
    data?: any;
    type?: string;
    index?: number;
}

export interface StockDetail {
    idMagasin : number;
    magasinNom: string;
    stock_physique_dispo: number;
    stock_physique_engage: number;
    stock_physique_dispo_vente: number;
}

@Component({
    selector: 'app-facture-client',
    templateUrl: './facture-client.component.html',
    styleUrls: ['./facture-client.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class FactureClientComponent implements OnInit {
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

    articles: {
        produitId: number,
        magasin: any | undefined,
        quantite: number,
        produitPrix: number,
        produitNom: string,
        taxeLibelle: string,
        taxe: number,
        montant: number,
        initialQuantite: number,
        stocks?: StockDetail[],
        commandeId:number|null
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

    remiseOptions = [
        {label: '%', value: 0},
        {label: 'XOF', value: 1}
    ];

    // Variables pour la gestion du numéro de facture
    facturePrefix: string = 'FFA-';
    lastInvoiceNumber: number = 13;
    errorMessage: string = '';
    createOrModify: boolean = false;

    clients: Client[] = [];
    factures: Facture[] = [];
    commandes: Commande[] = [];
    bonCommande: BonCommande ={};
    bonCommandeId: number|undefined;
    bonCommandes: BonCommande[] = [];
    recuState: boolean = false;
    idfacture: any;

    commandes1:Commande[] = [];
    newBonCommandeNumber: any;
    societyId: any;
    societegetted: Societe = {};
    checked: boolean = false;
    clientselected?: Client;
    filteredFactures: Facture[] = [];
    selectedfactures: Facture[] = [];
    factureIDS : number[] = [];
    paiementtowatch: PaiementFactureDTO = <PaiementFactureDTO>{};
    facturetoWach: Facture = <Facture>{};
    chrgmt: boolean = false;
    facturestoWach: Facture[] = [];
    droits: any;
    @ViewChild('printSection') printSection!: ElementRef;

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
        private sortieStockService: Sortie_stockService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected recuService: RecuService,
        private paymentService: PaiementService,
        protected societeService: SocieteService,
        private ligneMagasinService:LigneMagasinService,
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
            const loadInvoicesPromise = this.loadInvoices();

            await Promise.all([societePromise, loadInvoicesPromise]);

            const societe = await societePromise;
            console.log(societe);
            this.societegetted = societe!.payload;

            await this.loadData();

            this.bonCommandeId = +this.route.snapshot.paramMap.get('id')!;
            if (this.bonCommandeId) {
                this.selectBonCommandeDatas(this.bonCommandeId);
                console.log(this.bonCommandeId);
            }

            this.route.queryParams.subscribe((params) => {
                this.idfacture = params['idfacture'];
                if (this.idfacture != null) {
                    console.log(this.factures);
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

        // Convertir lastCommandNumber en nombre pour l'incrémenter
        const lastNumber = parseInt(lastCommandNumber, 10);
        const newCommandNumber = lastNumber + 1;

        // Déterminer la longueur nécessaire pour les zéros initiaux (ici, toujours 5 chiffres)
        const commandNumberLength = lastCommandNumber.toString().length;

        // Générer le nouveau numéro de bon de commande avec le format de longueur correcte
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

    startPdf(){
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
        console.log(this.clients)
        this.articleOptions = allData!.articleOptions;
        this.magasins = allData!.magasins;
        this.taxes = allData!.taxes;
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

        return forkJoin({
            clients: clients$,
            articleOptions: articleOptions$,
            magasins: magasins$,
            taxes: taxes$
        }).pipe(
            map((results: any) => ({
                clients: results.clients.payload,
                articleOptions: results.articleOptions.payload,
                magasins: results.magasins.payload,
                taxes: results.taxes
            }))
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

    async selectBonCommandeDatas(id : number) {
        if (id) {
            await this.bonCommandeService.findOne(id).toPromise().then(
                (res) => {
                    if(res!=undefined)
                    this.bonCommande = res.payload;
                    console.log(this.bonCommande)
                    this.bonCommandes.push(this.bonCommande);
                    console.log( this.bonCommandes)
                }
            );
        }

        this.client = this.clients.find(t => t.id === this.bonCommande?.clientId);
        if (!this.createOrModify) {
            this.createOrModify = true;
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



    loadInvoices(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.factureService.findClientInvoicesBySocieteId(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.factures = res.payload;
                    this.filteredFactures = this.factures;
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

    ajouterLigne() {
        this.articles.push({produitId: 0, magasin: undefined, quantite: 1, produitPrix: 0, taxe: 0, montant: 0,initialQuantite:0, taxeLibelle:'', produitNom:'', stocks: [], commandeId:null });
    }

    supprimerLigne(index: number) {
        if (this.articles.length > 1) {
            this.articles.splice(index, 1);
            this.calculateTotal();
        }
    }

    onArticleClear(index: number) {
        this.resetArticleFields(index);
        this.updateMontant(index);
        this.calculateTotal();
    }

    resetArticleFields(index: number) {
        this.articles[index].produitId = 0;
        this.articles[index].produitPrix = 0;
        this.articles[index].quantite = 1;
        this.articles[index].taxe = 0;
        this.articles[index].magasin = undefined;
    }

    onArticleChange(event: any, index: number) {
        this.resetArticleFields(index)
        const selectedArticle = this.articleOptions.find(article => article.id === event.value);
        if (selectedArticle) {
            this.articles[index].produitId = selectedArticle.id!;
            this.articles[index].produitPrix = selectedArticle.prixventettc || 0;
        }
        this.updateMontant(index);
        this.calculateTotal();

       // if (!this.bonCommande){
            this.loadStockDetails(selectedArticle?.id!, index)
        //}

    }

    onQuantiteChange(event: any, index: number): void {
        this.articles[index].quantite = event.value;
        this.updateMontant(index);
        this.calculateTotal();
    }

    onPrixChange(event: any, index: number): void {
        this.articles[index].produitPrix = event.value;
        this.updateMontant(index);
        this.calculateTotal();
    }

    onTaxeChange(event: any, index: number): void {
        this.articles[index].taxe = event.value;
        this.updateMontant(index);
        this.calculateTotal();
    }

    updateMontant(index: number): void {
        const article = this.articles[index];
        const articleTotal = article.quantite * article.produitPrix;
        const taxeTotal = articleTotal * (article.taxe / 100);
        article.montant = articleTotal + taxeTotal;
    }

    calculateTotal(): void {
        this.sousTotal = this.articles.reduce((acc, article) => {
            return( acc + article.montant);
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
        this.sousTotal = + this.sousTotal.toFixed(2)
    }

    onRemiseChange(event: any): void {
        this.remise = event.value;
        this.calculateTotal();
    }

    onAjustementChange(event: any): void {
        this.ajustement = event.value;
        this.calculateTotal();
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

    onSubmit(ngForm: NgForm) {
        this.errorMessage = '';
        // Validation: Vérifier si chaque article est sélectionné
        if (!this.client?.id) {
            if (this.clients && this.clients.length > 0) {
                this.client = this.clients[0]; // Sélectionner le premier client
            } else {
                this.scrollToTop();
                this.messages = [
                    { severity: 'error', detail: 'Aucun client trouvé dans la base de données. Veuillez vérifier.' }
                ];
                return;
            }
        }


        if(!this.newBonCommandeNumber){
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
            }else if(!this.articles[i].magasin ){
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `Veuillez selectionner un magasin pour L'article à la ligne ${i + 1} .`}
                ];
                return;
            }else if(this.articles[i].initialQuantite==0){
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `L'article à la ligne ${i + 1}  n'est pas dans le magasin selectionné.`}
                ];
                return;
            }
            else if( this.articles[i].initialQuantite< this.articles[i].quantite){
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `Pour L'article à la ligne ${i + 1} sélectionnez une quantité inferieure ou équal au stock disponible.`}
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
            this.facture.clientId = this.client?.id;
            this.facture.boncommandeId = this.bonCommande.id;

            if(this.facture.clientId){
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
                                this.loadInvoices().then(() => {
                                    this.resetForm();
                                    // @ts-ignore
                                    this.facture = this.factures.find(f=>f.id == id)
                                    this.onRowSelect(this.facture)
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

/*                    if(this.bonCommandeId){
                        this.createOrModify = false;
                        this.resetForm();
                        this.router.navigate(['gestock/factureClient']).then(r => {
                        });
                    }*/
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
        this.dateFacture = new Date();
        this.dateEcheance = new Date();
        this.isDeliveryDateValid = true;
        this.articles = [{produitId: 0, magasin: undefined, quantite: 1, produitPrix: 0, taxe: 0, montant: 0, initialQuantite:0,taxeLibelle:'', produitNom:'', stocks: [], commandeId:null }];
        this.sousTotal = 0;
        this.remise = 0;
        this.ajustement = 0;
        this.total = 0;
        this.remiseType = 0;
        this.messages = [];
        this.bonCommandeId=undefined;
        this.bonCommande={};
    }

    commandesToArticles(commandes: Commande[]): any[] {
        return commandes.map(command => {
            const taxe = this.taxes.find(t => t.id === command.taxeId);
            const articleTotal = (command.quantite!-command.quantitefacturee!) * command.produitPrix!;
            const taxeTotal = articleTotal * (taxe ? taxe.value / 100 : 0);
            const magasin = this.magasins.find(m => m.id === command.magasinId);
            let initialQuantite1;
            if(this.facture.id){
                // @ts-ignore
                 initialQuantite1 = command.quantitefacturee+command.quantite;
            }else{
                 initialQuantite1 =command.quantite!-command.quantitefacturee!
            }
            return {

                produitId: command.produitId,
                magasin: magasin,
                produitNom: command.produitNom,
                quantite: command.quantite!-command.quantitefacturee!,
                initialQuantite: initialQuantite1,
                produitPrix: command.produitPrix,
                taxe: taxe ? taxe.value : 0,
                taxeLibelle: command.taxeLibelle,
                montant: articleTotal + taxeTotal,
                commandeId:command.id
            };
        });
    }

    transformToSortie(article: any): Sortie_stock {
        return {
            id:article.id,
            commandeId: article.commandeId,
            produitId: article.produitId,
            magasinId: article.magasin.idMagasin,
            taxeId: this.getTaxeId(article.taxe),
            produitNom: article.produitNom,
            produitPrix: article.produitPrix,
            quantite: article.quantite,
            societyId: JSON.parse(this.tokenStorage.getsociety()!),
        };
    }

    async sortieStockToArticles(sorties: Sortie_stock[]): Promise<any[]> {
        return Promise.all(sorties.map(async (sortie) => {
            const taxe = this.taxes.find(t => t.id === sortie.taxeId);
            const articleTotal = sortie.quantite! * sortie.produitPrix!;
            const taxeTotal = articleTotal * (taxe ? taxe.value / 100 : 0);
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
                montant: articleTotal + taxeTotal,
                initialQuantite: initialQuantite1,
            };
        }));
    }

    getTaxeId(taxeValue?: number): number | undefined {
        const taxe = this.taxes.find(t => t.value === taxeValue);
        return taxe ? taxe.id : undefined;
    }

    validateDeliveryDate() {
        this.isDeliveryDateValid = this.dateEcheance >= this.dateFacture;
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

    viewRecu(recu: any) {
        console.log(recu)
        this.recuState = true;
        this.facturestoWach = []
        this.paiementtowatch = recu
        console.log(this.paiementtowatch)
        for (const factureId in this.paiementtowatch.invoicePayments) {
            if (this.paiementtowatch.invoicePayments.hasOwnProperty(factureId)) {
                const amount = this.paiementtowatch.invoicePayments[factureId];

                this.factureService.findOne(Number(factureId)).subscribe(facture=>{
                    console.log(`Facture ID: ${factureId}, Amount: ${amount}`);
                    this.facturetoWach = facture.payload
                    this.facturestoWach.push(this.facturetoWach)
                    console.log(this.facturestoWach)
                })
            }
        }
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
                                this.loadInvoices().then(() => {
                                    this.isSecondaryActive=false;
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

    deleteRecu(recuToDelete: Recu) {
        let id = this.facture.id;
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler le paiement?',
            accept: () => {
                if (recuToDelete === null) {
                    return;
                } else {

                    if (recuToDelete.id != null) {
                        this.chrgmt = true;
                        this.paymentService.deletePayment(recuToDelete.id, "factureclient").subscribe(
                            () => {
                                this.loadInvoices().then(() => { // utilisez .then() pour attendre que loadInvoices soit terminé
                                    // @ts-ignore
                                    this.facture = this.factures.find(fact=>fact.id == id);
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.onRowSelect(this.facture)
                                    this.chrgmt = false;
                                });
                            },
                            error => {
                                console.error(error);
                            }
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
                this.client = this.clients.find(t => t.id === facture.clientId);

                console.log(this.facture);

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

                console.log(this.clients);
                console.log(this.client);
                console.log(facture.clientId);

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
                this.remiseType = 0;
            } else {
                this.resetForm();
            }
        } catch (error) {
            console.error('Error in createModify:', error);
        } finally {
            this.chrgmt = false; // Cache l'indication de chargement à la fin
        }

        this.createOrModify = true;
    }


    formatStatus(status?: string): string {
        switch (status) {
            case 'EN_ATTENTE':
                return 'En attente';
            case 'PAYEE':
                return 'Payée';
            case 'PARTIELLEMENT_PAYEE':
                return 'Partiellement payée';
            default:
                return status!;
        }
    }


    filterMagasins() {
        if (this.searchQuery) {
            // @ts-ignore
            this.filteredMagasins = this.magasins.filter(magasin => magasin.nom.toLowerCase().includes(this.searchQuery.toLowerCase()));
        } else {
            this.filteredMagasins = this.magasins;
        }
    }

    // Méthode pour attribuer le premier magasin par défaut
    setDefaultMagasin(index: number) {
        // @ts-ignore
        if (this.articles[index].stocks && this.articles[index].stocks.length > 0) {
            // Affecter le premier magasin de la liste
            // @ts-ignore
            this.articles[index].magasin = this.articles[index].stocks[0];

            // Mettre à jour la quantité initiale disponible
            this.articles[index].initialQuantite = this.articles[index].magasin.stock_physique_dispo_vente;
            console.log('Premier magasin attribué par défaut :', this.articles[index].magasin);
        }
    }

    magasinSelect(event: TableRowSelectEvent, op: OverlayPanel, index: number) {
        op.hide();
        this.articles[index].magasin = event.data;
        console.log(event.data);
        //if(!this.bonCommande){
            if(this.articles[index].magasin){
                this.articles[index].initialQuantite =this.articles[index].magasin.stock_physique_dispo_vente; // Mettre à jour le stock disponible
            }
       // }
    }

    refreshBoncommandeData() {
        if(this.bonCommande){
           // this.selectBonCommandeDatas();
        }
    }

    effectuer_paiement(idFacture: number){
        this.router.navigate(['gestock/caisse'], { queryParams: { idfacture: idFacture } });
    }

    effectuer_paiement_en_bloc(){
        this.selectedfactures.forEach(v=>{
            if (v.id != null) {
                this.factureIDS.push(v.id)
            }
        })
        console.log(this.factureIDS)
        const idsString = this.factureIDS.join(',');
        this.router.navigate(['gestock/paiement'], { queryParams: { idfactures: idsString } });
    }

    onBonCommandeClear() {
        this.resetForm()
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

            if (this.articles[index].magasin) {
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
        if(event.value!=null){
            this.filteredFactures = this.factures.filter(facture=>facture.clientId === event.value.id)
        }else{
            this.selectedfactures = []
            this.filteredFactures = this.factures
        }
    }

    viewBon(facture: Facture) {
        this.router.navigate(['gestock/commandeClient'], { queryParams: { idtowatch: facture.boncommandeId } });
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

    retour() {
        this.createOrModify = false;
        this.facture = this.factureSelect
    }

    cancel() {
        this.createOrModify = false;
        this.resetForm();
        this.router.navigate(['gestock/factureClient']).then(r => {
        });
    }

    close(){
        this.isSecondaryActive = false;
    }
}
