import {Component, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, MenuItem, Message, MessageService, SelectItem} from "primeng/api";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../../store/services/gestock-service/Produit.service";
import {
    BonCommande,
    Client,
    Commande,
    LigneMagasin, Livraison,
    Magasin,
    Produit,
    Societe,
    Taxe
} from "../../../store/entities/gestock.entity";
import {BonCommandeService} from "../../../store/services/gestock-service/BonCommandeService";
import {Table} from "primeng/table";
import {NgForm} from "@angular/forms";
import {TaxeService} from "../../../store/services/gestock-service/Taxe.service";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {LigneMagasinService} from "../../../store/services/gestock-service/LigneMagasin.service";
import {ActivatedRoute, Router} from "@angular/router";
import {formatDate} from "@angular/common";
import html2pdf from 'html2pdf.js';
import {SocieteService} from "../../../store/services/gestock-service/Societe.service";
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {LivraisonService} from "../../../store/services/gestock-service/Livraison.service";

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
    selector: 'app-bon-commande',
    templateUrl: './commande-client.component.html',
    styleUrls: ['./commande-client.component.scss']
})
export class CommandeClientComponent implements OnInit {
    @ViewChild('op') overlayPanel: OverlayPanel | undefined;

    client?: Client;
    article?: Produit;
    numeroCommande: string = 'PO-00001';
    reference: string = '';
    date: Date = new Date();
    dateExp: Date = new Date();
    isDeliveryDateValid: boolean = true;
    isSecondaryActive = false;
    // @ts-ignore
    items: MenuItem[];
    loading: boolean = true;
    bonCommande: BonCommande = {};
    bonCommandeSelect: BonCommande = {};
    taxes: { id: number, label: string, value: number }[] = [];
    articles: { produitId: number, magasin: any | undefined, quantite: number, produitPrix: number, taxe: number, montant: number,  stockDisponible: number,stocks?: StockDetail[]  }[] = [];
    hasFacture: boolean=false;
    sousTotal = 0;
    remise = 0;
    ajustement = 0;
    total = 0;
    fraisExpedition=0;
    remiseType : any; // default type
    messages: Message[] | undefined;
    modal = '';
    articleOptions: Produit[] = [];
    magasins: Magasin[] = [];
    magasin?: Magasin;
    remiseOptions = [
        {label: '%', value: 0},
        {label: 'XOF', value: 1}
    ];
    // Variables pour la gestion du numéro de commande
    commandPrefix: string = 'CCOA-';
    lastCommandNumber: number = 13;
    errorMessage: string = '';
    createOrModify: boolean = false;
    clients: Client[] = [];
    bonCommandes: BonCommande[] = [];
    commandes: Commande[] = [];
    searchQuery: string = '';
    filteredMagasins: any[] = [];
    ligneMagasin:LigneMagasin={};
    chrgmt: boolean = false;
    idtowatch: any
    newBonCommandeNumber: string = '';
    allQuantitiesMatch: boolean=false;
    allQuantitiesMatch2: boolean=false;
    allQuantitiesMatch3: boolean=false;
    societyId: any;
    societegetted: Societe = {};
    checked: boolean = false;
    droits: any;
    constructor(
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        private confirmationService: ConfirmationService,
        private livraisonService: LivraisonService,
        private clientService: ClientService,
        private magasinService: MagasinService,
        private produitService: ProduitService,
        private bonCommandeService: BonCommandeService,
        private factureService: FactureService,
        private taxeService: TaxeService,
        private aroute: ActivatedRoute,
        protected router: Router,
        protected societeService: SocieteService,
        private ligneMagasinService:LigneMagasinService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize(): Promise<void> {
        this.droits = this.tokenStorage.getdroits();
        this.setInitialCommandNumber();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.chrgmt = true; // Cacher le spinner après le chargement de toutes les données

        try {
            // Charger toutes les données nécessaires
            await Promise.all([this.loadBonCommandes(), this.loadall(), this.loadSociete()]);

            // Charger les paramètres de route et traiter en conséquence
            this.aroute.queryParams.subscribe(async (params) => {
                this.idtowatch = params['idtowatch'];

                if (this.idtowatch) {
                    const value = await this.bonCommandeService.findOne(this.idtowatch).toPromise();
                    this.onRowSelect(value!.payload);
                }
            });
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données
        }
    }

    async loadSociete(): Promise<void> {
        try {
            const societe = await this.societeService.findOne(this.societyId).toPromise();
            console.log(societe);
            this.societegetted = societe!.payload;
        } catch (error) {
            console.error('Error loading société', error);
            throw error;
        }
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
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
        const newBonCommandeNumber = `CC/${this.tokenStorage.getusername().charAt(0).toUpperCase()}${this.tokenStorage.getusername().charAt(1).toUpperCase()}/${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;

        return newBonCommandeNumber;
    }


    // Initialiser le numéro de commande lors du chargement du composant
    setInitialCommandNumber() {
        this.numeroCommande = this.generateCommandNumber(this.lastCommandNumber);
    }

    generateCommandNumber(lastNumber: number): string {
        return this.commandPrefix + String(lastNumber).padStart(5, '0');
    }
    loadall() {
        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
            }
        );

        this.produitService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.articleOptions = res.payload;
                console.log(this.articleOptions)
            }
        );

        this.taxeService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.taxes = res.payload.map((tax: Taxe) => ({id : tax.id!, label: tax.libelle!, value: tax.hauteur!}));
            }
        );


        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );
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

    startPdf(){
        const element = document.getElementById('commandeClient');

        // Obtient l'heure actuelle
        const now = new Date();
        const date = now.getDate();
        const heures = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const secondes = now.getSeconds().toString().padStart(2, '0');

        // Formate le nom du fichier
        const nomFichierPDF = `Commande cliente N° ${this.bonCommande.numero} ${date}- ${heures}-${minutes}-${secondes}.pdf`;

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

    loadBonCommandes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.bonCommandeService.getBonBySocietyAndClients(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.bonCommandes = res.payload;
                    console.log(this.bonCommandes);
                    this.loading = false;

                    // Obtenez le dernier numéro de commande
                    let lastCommandNumber = '00000';  // valeur par défaut
                    if (this.bonCommandes.length > 0 && this.bonCommandes[0].lastCommandNumber != null) {
                        lastCommandNumber = this.bonCommandes[0].lastCommandNumber;
                    }
                    console.log(lastCommandNumber);

                    // Générer le nouveau numéro de bon de commande
                    // @ts-ignore
                    this.newBonCommandeNumber = this.generateBonCommandeNumber(lastCommandNumber);

                    resolve(); // résoudre la promesse une fois les bons de commande chargés
                },
                (error) => {
                    reject(error); // rejeter la promesse en cas d'erreur
                }
            );
        });
    }

    customizeBonCommandeNumber() {
        const customNumber = prompt('Initialiser le numéro à :');
        if (customNumber) {
            const prefix = this.newBonCommandeNumber.substring(0, this.newBonCommandeNumber.lastIndexOf('-') + 1);
            this.newBonCommandeNumber = `${prefix}${customNumber}`;
        }
    }

    loadCommandesByBonCommande(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.bonCommandeService.getCommandeByBonId(id).subscribe({
                next: async res => {
                    const commandes = res.payload;
                    this.articles = await this.commandesToArticles(commandes);
                    this.commandes = commandes;
                    // Vérification de la quantité et de la quantité facturée
                    this.allQuantitiesMatch = this.commandes.every(commande => commande.quantiterecue != 0);
                    this.allQuantitiesMatch2 = this.commandes.every(commande => commande.quantite === commande.quantitefacturee);
                    this.allQuantitiesMatch3 = this.commandes.every(commande => commande.quantite === commande.quantiteLivree);

                    // Charger les détails du stock pour chaque article
                    const stockDetailsPromises = this.articles.map((article, index) => {
                        return this.loadStockDetails(article.produitId, index);
                    });

                    // Attendre que tous les détails du stock soient chargés
                    Promise.all(stockDetailsPromises).then(() => {
                        this.calculerTotal();
                        resolve(); // Résoudre la promesse une fois toutes les opérations terminées
                    }).catch(error => {
                        reject(error); // Rejeter la promesse en cas d'erreur
                    });
                },
                error: err => {
                    reject(err); // Rejeter la promesse en cas d'erreur
                }
            });
        });
    }



    formatStatus(status?: string): string {
        switch (status) {
            case 'EN_ATTENTE':
                return 'En attente';
            case 'PARTIELLEMENT_LIVREE':
                return 'Partiellement livrée';
            case 'LIVREE':
                return 'Livré';
            case 'PARTIELLEMENT_FACTURE':
                return 'Partiellement facturé';
            case 'FACTURE':
                return 'Facturé';
            default:
                return status!;
        }
    }

    viewFacture(reception: any) {
        this.router.navigate(['gestock/factureClient'], { queryParams: { idfacture: reception.id } });
    }

    loadFacturesByBon(id: number) {
        this.factureService.findbybon(id).subscribe(
            (res) => {
                this.bonCommandes.forEach(bon => {
                    if (bon.id === id) {
                        bon.factures = res.payload;
                        this.bonCommande.factures = res.payload
                        this.bonCommandeSelect.factures = res.payload
                    }
                })
            }
        );
    }

    ajouterLigne() {
        this.articles.push({produitId: 0,magasin: undefined, quantite: 1, produitPrix: 0, taxe: 0, montant: 0,  stockDisponible: 0,  stocks: [] });
    }

    supprimerLigne(index: number) {
        if (this.articles.length > 1) {
            this.articles.splice(index, 1);
            this.calculerTotal();
        }
    }

    onArticleClear(index: number) {
        this.resetArticleFields(index);
        this.updateMontant(index);
        this.calculerTotal();
    }

    resetArticleFields(index: number) {
        this.articles[index].produitId = 0;
        this.articles[index].produitPrix = 0;
        this.articles[index].quantite = 0;
        this.articles[index].taxe = 0;
    }

    onArticleChange(event: any, index: number) {
        const selectedArticle = this.articleOptions.find(article => article.id === event.value);
        if (selectedArticle) {
            this.articles[index].produitId = selectedArticle.id!;
            this.articles[index].produitPrix = selectedArticle.prixventeht || 0;
            this.articles[index].magasin = undefined;
            this.articles[index].stocks = [];
            this.loadStockDetails(selectedArticle.id!, index)
        }

        this.updateMontant(index);
        this.calculerTotal();
    }

    onQuantiteChange(event: any, index: number): void {
        this.articles[index].quantite = event.value;
        this.updateMontant(index);
        this.calculerTotal();
    }

    onPrixChange(event: any, index: number): void {
        this.articles[index].produitPrix = event.value;
        this.updateMontant(index);
        this.calculerTotal();
    }

    onTaxeChange(event: any, index: number): void {
        this.articles[index].taxe = event.value;
        this.updateMontant(index);
        this.calculerTotal();
    }

    updateMontant(index: number): void {
        const article = this.articles[index];
        const articleTotal = article.quantite * article.produitPrix;
        const taxeTotal = articleTotal * (article.taxe / 100);
        article.montant = articleTotal + taxeTotal;
    }

    async actualiseProducts(id:number) {
        try {
            const result = await this.produitService.getProductOfmagasin(id, JSON.parse(this.tokenStorage.getsociety()!)).toPromise();
            // Handle the result here
            this.articleOptions = result?.payload;
        } catch (error) {
            // Handle errors here
            console.error(error);
        }
    }


    calculerTotal(): void {
        this.sousTotal = this.articles.reduce((acc, article) => {
            return acc + article.montant;
        }, 0);

        let remiseValue = 0;
        if (this.remiseType === 0) {
            remiseValue = this.sousTotal * (this.remise / 100);
        } else if (this.remiseType === 1) {
            remiseValue = this.remise;
        }

        this.total = this.sousTotal - remiseValue + this.ajustement + this.fraisExpedition;

        // Formater le total avec deux chiffres après la virgule
        this.total = +this.total.toFixed(2);
        this.sousTotal = + this.sousTotal.toFixed(2)
    }

    onRemiseChange(event: any): void {
        this.remise = event.value;
        this.calculerTotal();
    }

    onAjustementChange(event: any): void {
        this.ajustement = event.value;
        this.calculerTotal();
    }

    onFraisExpeditionChange(event: any): void {
        this.fraisExpedition = event.value;
        this.calculerTotal();
    }



    scrollToTop() {
        window.scrollTo(0, 0);
    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    ifExist(): boolean {
        console.log(this.bonCommande)
        console.log(this.bonCommande.id)
        if (this.bonCommande.id) {
            console.log("hfhhhfhffffh")
            return this.bonCommandes.some(
                value =>
                    value.id !== this.bonCommande.id &&
                    value.numero === this.bonCommande.numero);
        } else {
            return this.bonCommandes.some(value => value.numero === this.newBonCommandeNumber);
        }
    }

    onSubmit(ngForm: NgForm) {
        console.log(this.newBonCommandeNumber.split('-').pop()!)
        this.errorMessage = '';
        // Validation: Vérifier si chaque article est sélectionné

        if(!this.client?.id){
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Veuillez selectionner un client.`}
            ];
            return;
        }

        if(!this.newBonCommandeNumber){
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Veuillez saisir un numéro d.`}
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
            }
            else if(!this.articles[i].magasin){
                console.log('fffffffffffff')
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `Veuillez selectionner un magasin pour L'article à la ligne ${i + 1} .`}
                ];
                return;
            }
            else if(this.articles[i].stockDisponible===0){
                console.log('fffffffffffff')
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `L'article à la ligne ${i + 1}  n'est pas dans le magasin selectionné.`}
                ];
                return;
            }
            else if(this.articles[i].quantite > this.articles[i].stockDisponible){
                this.scrollToTop();
                this.messages = [
                    {severity: 'error', detail: `Pour L'article à la ligne ${i + 1} sélectionnez une quantité inferieure ou équal au stock disponible.`}
                ];
                return;
            }
        }

        this.bonCommande.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.bonCommande.numero = this.newBonCommandeNumber;
            this.bonCommande.lastCommandNumber = this.newBonCommandeNumber.split('-').pop()!
            this.bonCommande.numero_reference = this.reference;
            this.bonCommande.ajustement = this.ajustement;
            this.bonCommande.date_commande = new Date(this.date.getTime());
            this.bonCommande.date_expedition = new Date(this.dateExp.getTime());
            this.bonCommande.remise = this.remise;
            this.bonCommande.sous_total = this.sousTotal;
            this.bonCommande.montant_total = this.total;
            this.bonCommande.frais_expedition = this.fraisExpedition;
            this.bonCommande.commandes = this.articles.map(article => this.transformToCommande(article));
            this.bonCommande.clientId = this.client?.id;
            this.bonCommande.createdBy = "false";
            console.log(this.bonCommande)
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer une nouvelle  commande client?',

                accept: () => {
                    if (this.bonCommande?.id) {
                        this.chrgmt = true;
                        let id = this.bonCommande.id
                        this.bonCommandeService.update(this.bonCommande).subscribe(
                            () => {
                                this.loadBonCommandes().then(()=>{
                                    this.resetForm();
                                    // @ts-ignore
                                    this.bonCommande = this.bonCommandes.find(f=>f.id == id)
                                    this.onRowSelect(this.bonCommande);
                                    this.chrgmt = false;
                                    this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                    this.createOrModify = false;
                                });
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                    } else {
                        console.log(this.bonCommande)
                        this.chrgmt = true;
                        this.bonCommandeService.saveBonCommandes(this.bonCommande).subscribe(
                            (response) => {
                                this.loadBonCommandes().then(()=>{
                                    this.chrgmt = false;
                                    this.showMessage('success', 'Succès', 'Le bon de commande a été enregistré.');
                                    this.isSecondaryActive = false
                                    this.createOrModify = false;
                                    this.resetForm();
                                });
                            },
                            (error) => {
                                console.error('Erreur lors de l\'enregistrement de la  commande client :', error);
                                this.showMessage('error', 'Erreur', 'Erreur lors de l\'enregistrement de la commande client.');
                            }
                        );
                    }
                }
            });
        } else {
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Une  commande client avec le même numero existe déjà !`}
            ];
        }
    }
    resetForm() {
        this.client = undefined;
        this.reference = '';
        this.date = new Date();
        this.dateExp = new Date();
        this.isDeliveryDateValid = true;
        this.articles = [{produitId: 0,magasin: undefined, quantite: 1, produitPrix: 0, taxe: 0, montant: 0,stockDisponible:0,  stocks: []}];
        this.sousTotal = 0;
        this.remise = 0;
        this.ajustement = 0;
        this.total = 0;
        this.remiseType = 0;
        this.messages = [];
    }

    transformToCommande(article: any): Commande {
        return {
            id: article.id,
            produitId: article.produitId,
            magasinId: article.magasin.idMagasin,
            taxeId: this.getTaxeId(article.taxe),
            produitNom: article.produitNom,
            produitPrix: article.produitPrix,
            quantite: article.quantite,
            societyId: JSON.parse(this.tokenStorage.getsociety()!),
            bondCommandeId: this.bonCommande.id
        };
    }

    async commandesToArticles(commandes: Commande[]): Promise<any[]> {
        console.log('jjjjjjjjjjjjjjjjj');
        return await Promise.all(commandes.map(async commande => {
            const taxe = this.taxes.find(t => t.id === commande.taxeId);
            const articleTotal = commande.quantite! * commande.produitPrix!;
            const taxeTotal = articleTotal * (taxe ? taxe.value / 100 : 0);
            const magasin = this.magasins.find(m => m.id === commande.magasinId);

            let initialQuantite1 = 0;
            try {
                const p = await this.ligneMagasinService.findByProductAndMagasin(commande.produitId!, commande.magasinId!).toPromise();
                // @ts-ignore
                const ligne = p.payload;
                console.log(ligne);

                if (this.bonCommande.id) {
                    initialQuantite1 = commande.quantite! + (ligne?.stock_physique_dispo_vente || 0);
                    console.log("", initialQuantite1);
                } else {
                    initialQuantite1 =  (ligne?.stock_physique_dispo_vente || 0);
                    console.log(initialQuantite1);
                }
            } catch (error) {
                console.error('Error fetching ligne magasin:', error);
            }

            console.log(initialQuantite1);
            return {
                id: commande.id,
                produitId: commande.produitId,
                magasin: magasin ? {
                    ...magasin,
                    stock_physique_dispo_vente: 0 // Valeur par défaut, mise à jour dans loadStockDetails
                } : undefined,
                quantite: commande.quantite,
                produitPrix: commande.produitPrix,
                taxe: taxe ? taxe.value : 0,
                montant: articleTotal + taxeTotal,
                stockDisponible: initialQuantite1, // Valeur par défaut, mise à jour dans loadStockDetails
                stocks: []
            };
        }));
    }

    getTaxeId(taxeValue?: number): number | undefined {
        const taxe = this.taxes.find(t => t.value === taxeValue);
        console.log(taxe)
        return taxe ? taxe.id : undefined;
    }
    cancel() {
        this.createOrModify = false;
    }

    validateDeliveryDate() {
        this.isDeliveryDateValid = this.dateExp >= this.date;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onRowSelect(bon: BonCommande) {
        this.bonCommande = bon;
        this.bonCommandeSelect = this.bonCommande
        console.log(bon)
        this.isSecondaryActive = true;
        this.loadCommandesByBonCommande(bon.id!);
        this.loadFacturesByBon(bon.id!)
        this.checkFacture(bon.id!);
    }


    deleteElement(bonCommandeToDelete: BonCommande) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (bonCommandeToDelete === null) {
                    return;
                } else {
                    if (this.hasFacture){
                        this.showMessage('error', 'SUPPRESSION', 'Impossible de supprimé car des factures sont liées !');
                        return;
                    }
                     if (this.allQuantitiesMatch){
                        this.showMessage('error', 'SUPPRESSION', 'Impossible de supprimé car des avis de livraisons sont liées !');
                        return;
                    }
                    if (bonCommandeToDelete.id != null) {
                        this.chrgmt = true;
                        this.bonCommandeService.annulerBonCommandes(bonCommandeToDelete).subscribe(
                            () => {
                                //this.loadAll();
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                this.loadBonCommandes().then(()=>{
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

    createModify(bon: BonCommande) {
        this.chrgmt = true; // Début du chargement

        if (bon.id) {
            this.client = this.clients.find(value => value.id === bon.clientId);
            this.loadCommandesByBonCommande(bon.id!).then(() => {
                    console.log(bon.clientId, this.client)
                    this.newBonCommandeNumber = bon.numero!;
                    this.reference = bon.numero_reference!;

                    // Convertir bon.date_commande en Date
                    if (Array.isArray(bon.date_commande) && bon.date_commande.length >= 5) {
                        this.date = new Date(
                            bon.date_commande[0],      // Année
                            bon.date_commande[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                            bon.date_commande[2],      // Jour
                            bon.date_commande[3],      // Heure
                            bon.date_commande[4]       // Minute
                        );
                    }

                    // Convertir bon.date_livraison en Date
                    if (Array.isArray(bon.date_expedition) && bon.date_expedition.length >= 5) {
                        this.dateExp = new Date(
                            bon.date_expedition[0],      // Année
                            bon.date_expedition[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                            bon.date_expedition[2],      // Jour
                            bon.date_expedition[3],      // Heure
                            bon.date_expedition[4]       // Minute
                        );
                    }

                    this.sousTotal = bon.sous_total!;
                    this.remise = bon.remise!;
                    this.ajustement = bon.ajustement!;
                    this.total = bon.montant_total!;
                    this.fraisExpedition = bon.frais_expedition!;
                    this.remiseType = 0;
                    this.messages = [];
                    this.createOrModify = true;
                    this.chrgmt = false; // Fin du chargement
                })
                .catch((error) => {
                    console.error('Erreur lors du chargement des commandes:', error);
                    this.chrgmt = false; // Fin du chargement en cas d'erreur
                });
        } else {
            this.resetForm();
            this.bonCommande = {};
            this.createOrModify = true;
            this.chrgmt = false; // Fin du chargement
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


    magasinSelect(event: TableRowSelectEvent, op: OverlayPanel, index: number) {
        op.hide();
        this.articles[index].magasin = event.data;
        console.log(event.data)
        console.log(this.articles[index].magasin )
        if(this.articles[index].magasin){
             this.articles[index].stockDisponible =this.articles[index].magasin.stock_physique_dispo_vente; // Mettre à jour le stock disponible
                    console.log(this.ligneMagasin)

        }
    }


    convertToFacture(bonCommandeId: number) {
        this.chrgmt = true;
        console.log("fffffffffff")
        setTimeout(() => {
            //this.router.navigate(['gestock/bonCommande'], { queryParams: { id: bonCommandeId } });
            this.router.navigate(['gestock/factureClient', bonCommandeId]).then(r =>{
            } );

            this.chrgmt = false;
        }, 650);
    }

    deleteLivraison(livraisonToDelete: Livraison) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (livraisonToDelete === null) {
                    return;
                } else {
                    if (this.hasFacture){
                        this.showMessage('error', 'SUPPRESSION', 'Impossible de supprimé car des factures sont liées !');
                        return;
                    }
                    if (livraisonToDelete.id != null) {
                        this.chrgmt = true;
                        let id = livraisonToDelete.boncommandeId
                        this.livraisonService.delete(livraisonToDelete.id).subscribe(
                            () => {
                                this.loadBonCommandes().then(() => { // utilisez .then() pour attendre que loadInvoices soit terminé
                                    // @ts-ignore
                                    this.bonCommande = this.bonCommandes.find(fact=>fact.id == id);
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.chrgmt = false;
                                    this.onRowSelect(this.bonCommande)
                                });
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression !')
                        );
                    }
                }
            }
        });
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
                    // this.articles[index].stockDisponible = selectedMagasin.stock_physique_dispo_vente;
                }
            }
        });
    }

    viewLivraison(livraison: Livraison) {
        this.router.navigate(['gestock/livraison'], { queryParams: { idtowatch: livraison.id } });
    }

    checkFacture(id: number): void {
        this.bonCommandeService.hasFacture(id).subscribe(
            (res) => {
                this.hasFacture  = res;
                console.log(this.hasFacture)
            }
        );
    }

    make_a_livraison(id: number) {
        this.chrgmt = true;
        setTimeout(() => {
            this.router.navigate(['gestock/livraison'], { queryParams: { id: id } });
            this.chrgmt = false;
        }, 650);
    }

    retour() {
        this.createOrModify = false;
        this.bonCommande = this.bonCommandeSelect;
    }

    close(){
        this.isSecondaryActive = false;
    }
}
