import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MenuItem, Message, MessageService} from "primeng/api";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {Entree_stockService} from "../../../store/services/gestock-service/Entree_stock.service";
import {FournisseurService} from "../../../store/services/gestock-service/Fournisseur.service";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../../store/services/gestock-service/Produit.service";
import {
    BonCommande,
    Commande,
    Fournisseur, LigneMagasin,
    Magasin,
    Produit, Reception,
    ResponseGeneric, Societe,
    Taxe
} from "../../../store/entities/gestock.entity";
import {BonCommandeService} from "../../../store/services/gestock-service/BonCommandeService";
import {Table} from "primeng/table";
import {NgForm} from "@angular/forms";
import {TaxeService} from "../../../store/services/gestock-service/Taxe.service";
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";
import {formatDate} from "@angular/common";
import {SocieteService} from "../../../store/services/gestock-service/Societe.service";
import html2pdf from 'html2pdf.js';
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {ReceptionService} from "../../../store/services/gestock-service/Reception.service";
import {LigneMagasinService} from "../../../store/services/gestock-service/LigneMagasin.service";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    templateUrl: './bon-commande.component.html',
    styleUrls: ['./bon-commande.component.scss']
})
export class BonCommandeComponent implements OnInit {
    fournisseur?: Fournisseur;
    article?: Produit;
    numeroCommande: string = 'PO-00001';
    reference: string = '';
    date: Date = new Date();
    dateLivraison: Date = new Date();
    isDeliveryDateValid: boolean = true;
    isSecondaryActive = false;
    // @ts-ignore
    items: MenuItem[];
    loading: boolean = true;
    bonCommande: BonCommande = {};
    bonCommandeSelect: BonCommande = {};

    taxes: { id: number, label: string, value: number }[] = [];

    articles: { produitId: number, magasin: any | undefined, quantite: number, produitPrix: number, taxe: number, montant: number, stocks?: StockDetail[] }[] = [];
    sousTotal = 0;
    remise = 0;
    ajustement = 0;
    prixProduct = 0;
    quantiteProduct = 1;
    total = 0;
    remiseType : any; // default type
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

    // Variables pour la gestion du numéro de commande
    commandPrefix: string = 'POA-';
    lastCommandNumber: number = 13;
    errorMessage: string = '';
    createOrModify: boolean = false;

    fournisseurs: Fournisseur[] = [];
    bonCommandes: BonCommande[] = [];
    commandes: Commande[] = [];
    chrgmt: boolean = false;
    idtowatch: any
    hasFacture: boolean=false;
    societegetted: Societe = {};
    societyId: any;
    checked: boolean = false;
    allQuantitiesMatch: boolean=false;
    allQuantitiesMatch2: boolean=false;
    allQuantitiesMatch3: boolean=false;
    newBonCommandeNumber: any;
    droits: any;
    constructor(
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        private confirmationService: ConfirmationService,
        private entreeStockService: Entree_stockService,
        private fournisseurService: FournisseurService,
        private magasinService: MagasinService,
        private produitService: ProduitService,
        private bonCommandeService: BonCommandeService,
        private receptionService: ReceptionService,
        private factureService: FactureService,
        private taxeService: TaxeService,
        private aroute: ActivatedRoute,
        protected societeService: SocieteService,
        protected router: Router,
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

    exportPDF() {
        const element = document.getElementById('commandeClient'); // Sélectionne l'élément à exporter

        if (element) {
            html2canvas(element).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();

                const imgWidth = 210; // Largeur de l'image en mm
                const pageHeight = 297; // Hauteur de la page en mm (A4)
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                // Ajouter l'image capturée dans le PDF
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                // Si le contenu dépasse une page, créer des pages supplémentaires
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                // Enregistrer le fichier PDF
                pdf.save('commande_client.pdf');
            });
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
        const newBonCommandeNumber = `BC/${this.tokenStorage.getusername().charAt(0).toUpperCase()}${this.tokenStorage.getusername().charAt(1).toUpperCase()}/${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;

        return newBonCommandeNumber;
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }

    // Initialiser le numéro de commande lors du chargement du composant
    setInitialCommandNumber() {
        this.numeroCommande = this.generateCommandNumber(this.lastCommandNumber);
    }

    generateCommandNumber(lastNumber: number): string {
        return this.commandPrefix + String(lastNumber).padStart(5, '0');
    }

    resetCommandNumber() {
        this.lastCommandNumber = 1;
        this.numeroCommande = this.generateCommandNumber(this.lastCommandNumber);
    }

    loadall() {
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );

        this.produitService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.articleOptions = res.payload;
                console.log(this.articleOptions)
            }
        );

        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );

        this.taxeService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.taxes = res.payload.map((tax: Taxe) => ({id : tax.id!, label: tax.libelle!, value: tax.hauteur!}));
            }
        );
    }

    loadBonCommandes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.bonCommandeService.getBonBySocietyAndFrs(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
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
    loadCommandesByBonCommande(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.bonCommandeService.getCommandeByBonId(id).subscribe({
                next: res => {
                    const commandes = res.payload;
                    this.articles = this.commandesToArticles(commandes);
                    this.commandes = commandes;
                    // Vérification de la quantité et de la quantité facturée
                    this.allQuantitiesMatch = this.commandes.every(commande => commande.quantiterecue != 0);
                    this.allQuantitiesMatch2 = this.commandes.every(commande => commande.quantite === commande.quantitereglee);
                    this.allQuantitiesMatch3 = this.commandes.every(commande => commande.quantite === commande.quantiterecue);
                    const stockDetailsPromises = this.articles.map((article, index) => {
                        return this.loadStockDetails(article.produitId, index);
                    });
                    Promise.all(stockDetailsPromises).then(() => {
                        this.calculerTotal();
                        resolve(); // Résoudre la promesse une fois toutes les opérations terminées
                    }).catch(error => {
                        reject(error); // Rejeter la promesse en cas d'erreur
                    }); // Rejeter la promesse en cas d'erreur
                },
                error: err => {
                    reject(err); // Rejeter la promesse en cas d'erreur
                }
            });
        });
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

    convertToFacture(bonCommandeId: number) {
        this.chrgmt = true;
        console.log("fffffffffff")
        setTimeout(() => {
         //this.router.navigate(['gestock/bonCommande'], { queryParams: { id: bonCommandeId } });
            this.router.navigate(['gestock/factureFournisseur', bonCommandeId]).then(r =>{
                console.log("kkkkkkkkkkkkkkkk")
            } );

            this.chrgmt = false;
        }, 650);
    }

    ajouterLigne() {
        this.articles.push({produitId: 0,magasin: undefined, quantite: 1, produitPrix: 0, taxe: 0, montant: 0,  stocks: []});
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
            this.articles[index].produitPrix = selectedArticle.prixachatht || 0;
            this.articles[index].magasin = undefined;
            this.articles[index].stocks = [];
            this.loadStockDetails(selectedArticle.id!, index);
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

        this.total = this.sousTotal - remiseValue + this.ajustement;

        // Formater le total avec deux chiffres après la virgule
        this.total = +this.total.toFixed(2);
        this.sousTotal = + this.sousTotal.toFixed(2)
    }

    formatStatus(status?: string): string {
        switch (status) {
            case 'EN_ATTENTE':
                return 'En attente';
            case 'PARTIELLEMENT_RECU':
                return 'Partiellement reçu';
            case 'RECU':
                return 'Reçu';
            case 'PARTIELLEMENT_REGLEE':
                return 'Partiellement facturé';
            case 'REGLEE':
                return 'Facturé';
            default:
                return status!;
        }
    }


    onRemiseChange(event: any): void {
        this.remise = event.value;
        this.calculerTotal();
    }

    onAjustementChange(event: any): void {
        this.ajustement = event.value;
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
        if (this.bonCommande.id) {
            return this.bonCommandes.some(
                value =>
                    value.id !== this.bonCommande.id &&
                    value.numero === this.bonCommande.numero);
        } else {
            return this.bonCommandes.some(value => value.numero === this.newBonCommandeNumber);
        }
    }

    onSubmit(ngForm: NgForm) {
        this.errorMessage = '';
        // Validation: Vérifier si chaque article est sélectionné
        if(!this.fournisseur?.id){
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Veuillez selectionner un fournisseur.`}
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
        }

        this.bonCommande.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.bonCommande.numero = this.newBonCommandeNumber;
            this.bonCommande.lastCommandNumber = this.newBonCommandeNumber.split('-').pop()!
            this.bonCommande.numero_reference = this.reference;
            this.bonCommande.ajustement = this.ajustement;
            this.bonCommande.date_commande = new Date(this.date.getTime());
            this.bonCommande.date_livraison = new Date(this.dateLivraison.getTime());
            this.bonCommande.remise = this.remise;
            this.bonCommande.sous_total = this.sousTotal;
            this.bonCommande.montant_total = this.total;
            this.bonCommande.commandes = this.articles.map(article => this.transformToCommande(article));
            this.bonCommande.fournisseurId = this.fournisseur?.id;
            this.bonCommande.createdBy = "false";
            console.log(this.bonCommande)
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer un nouveau bon de commande?',

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
                                console.error('Erreur lors de l\'enregistrement du bon de commande :', error);
                                this.showMessage('error', 'Erreur', 'Erreur lors de l\'enregistrement du bon de commande.');
                            }
                        );
                    }
                }
            });
        } else {
            this.scrollToTop();
            this.messages = [
                {severity: 'error', detail: `Un bon de commande avec le même numero existe déjà !`}
            ];
        }
    }

    resetForm() {
        this.fournisseur = undefined;
        this.reference = '';
        this.date = new Date();
        this.dateLivraison = new Date();
        this.isDeliveryDateValid = true;
        this.articles = [{produitId: 0,magasin: undefined, quantite: 1, produitPrix: 0, taxe: 0, montant: 0,  stocks: []}];
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


    commandesToArticles(commandes: Commande[]): any[] {
        return commandes.map(commande => {
            const taxe = this.taxes.find(t => t.id === commande.taxeId);
            const articleTotal = commande.quantite! * commande.produitPrix!;
            const taxeTotal = articleTotal * (taxe ? taxe.value / 100 : 0);
            const magasin = this.magasins.find(m => m.id === commande.magasinId);
            return {
                id: commande.id,
                produitId: commande.produitId,
                magasin: magasin,
                quantite: commande.quantite,
                produitPrix: commande.produitPrix,
                taxe: taxe ? taxe.value : 0,
                montant: articleTotal + taxeTotal,
                stocks: []
            };
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
                }
            }
        });
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
        this.isDeliveryDateValid = this.dateLivraison >= this.date;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onRowSelect(bon: BonCommande) {
        this.bonCommande = bon;
        this.bonCommandeSelect = this.bonCommande
        console.log(this.bonCommande)
        console.log(bon)
        this.isSecondaryActive = true;
        this.loadCommandesByBonCommande(bon.id!)
        this.loadFacturesByBon(bon.id!)
        this.checkFacture(bon.id!)
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
                    if (this.allQuantitiesMatch3){
                        this.showMessage('error', 'SUPPRESSION', 'Impossible de supprimé car des avis de receptions sont liées !');
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
    deleteReception(receptionToDelete: Reception) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (receptionToDelete === null) {
                    return;
                } else {
                    if (this.hasFacture){
                        this.showMessage('error', 'SUPPRESSION', 'Impossible de supprimé car des factures sont liées !');
                        return;
                    }
                    if (receptionToDelete.id != null) {
                        this.chrgmt = true;
                        let id = receptionToDelete.boncommandeId
                        this.receptionService.delete(receptionToDelete.id).subscribe(
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

    createModify(bon: BonCommande) {
        this.chrgmt = true; // Début du chargement

        if (bon.id) {
            this.fournisseur = this.fournisseurs.find(value => value.id === bon.fournisseurId);
            this.loadCommandesByBonCommande(bon.id!).then(() => {
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
                if (Array.isArray(bon.date_livraison) && bon.date_livraison.length >= 5) {
                    this.dateLivraison = new Date(
                        bon.date_livraison[0],      // Année
                        bon.date_livraison[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                        bon.date_livraison[2],      // Jour
                        bon.date_livraison[3],      // Heure
                        bon.date_livraison[4]       // Minute
                    );
                }

                console.log(this.date);
                console.log(this.dateLivraison);
                this.sousTotal = bon.sous_total!;
                this.remise = bon.remise!;
                this.ajustement = bon.ajustement!;
                this.total = bon.montant_total!;
                this.remiseType = 0;
                this.createOrModify = true;
                this.chrgmt = false; // Fin du chargement
            })
                .catch((error) => {
                    console.error('Erreur lors du chargement des commandes:', error);
                    this.chrgmt = false; // Fin du chargement en cas d'erreur
                });
        } else {
            this.resetForm()
            this.bonCommande={};
            this.createOrModify = true;
            this.chrgmt = false; // Fin du chargement
        }
    }

    make_a_reception(id: number){
        this.chrgmt = true;
        setTimeout(() => {
            this.router.navigate(['gestock/reception'], { queryParams: { id: id } });
            this.chrgmt = false;
        }, 650);
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
    }

    viewReception(reception: any) {
        this.router.navigate(['gestock/reception'], { queryParams: { idtowatch: reception.id } });
    }

    viewFacture(reception: any) {
        this.router.navigate(['gestock/factureFournisseur'], { queryParams: { idfacture: reception.id } });
    }


    checkFacture(id: number): void {
        this.bonCommandeService.hasFacture(id).subscribe(
            (res) => {
                this.hasFacture  = res;
                console.log(this.hasFacture)
            }
        );
    }

    retour() {
        this.createOrModify = false;
        this.bonCommande = this.bonCommandeSelect;
    }

    close(){
        this.isSecondaryActive = false;
    }
}
