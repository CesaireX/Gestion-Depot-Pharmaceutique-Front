import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MenuItem, Message, MessageService} from "primeng/api";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {
    Livraison,
    Commande,
    Client,
    Produit,
    BonCommande,
    LigneLivraisonClient, Magasin, Reception, Facture
} from "../../../store/entities/gestock.entity";
import {NgForm} from "@angular/forms";
import {LivraisonService} from "../../../store/services/gestock-service/Livraison.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BonCommandeService} from "../../../store/services/gestock-service/BonCommandeService";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {CommandeService} from "../../../store/services/gestock-service/Commande.service";
import {formatDate} from "@angular/common";
import {Table} from "primeng/table";
import {finalize} from "rxjs";

@Component({
    selector: 'app-livraison-commande',
    templateUrl: './livraison-commande.component.html',
    styleUrls: ['./livraison-commande.component.scss']
})
export class LivraisonCommandeComponent implements OnInit {
    client?: Client;
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
    bonCommande: Livraison = {};

    taxes: { id: number, label: string, value: number }[] = [];

    articles = [{id: null, produitId: 0, quantite: 1, produitPrix: 0, taxe: 0, montant: 0}];
    total = 0;
    remiseType : any; // default type
    messages: Message[] | undefined;
    modal = '';
    // Variables pour la gestion du numéro de commande
    commandPrefix: string = 'POA-';
    lastCommandNumber: number = 13;
    errorMessage: string = '';
    createOrModify: boolean = false;

    clients: Client[] = [];
    livraisons: Livraison[] = [];
    bonCommandes: BonCommande[] = [];
    livraison: Livraison = {};
    livraisonToModify: Livraison = {};
    commandetoModify: Commande = {};
    commandes: Commande[] = [];
    id: any;
    selectedBon: BonCommande | undefined = {};
    lignelivraison: LigneLivraisonClient[] = [];
    ligne: LigneLivraisonClient = {};
    magasins: Magasin[] = [];
    idtowatch: any;
    newBonCommandeNumber: any;
    selectedBoolean = false;
    chrgmt: boolean = false;
    droits: any;
    constructor(
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        private confirmationService: ConfirmationService,
        private clientService: ClientService,
        private magasinService: MagasinService,
        protected router: Router,
        private bonCommandeService: BonCommandeService,
        private commandeService: CommandeService,
        private livraisonService: LivraisonService,
        private aroute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        this.droits = this.tokenStorage.getdroits();

        try {
            await Promise.all([
                this.loadLivraisons(),
                this.loadMagasins(),
                this.loadInitialy()
            ]);

        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }

    loadInitialy() {
        this.aroute.queryParams.subscribe((params) => {
            this.id = params['id'];
            console.log(this.id)

            if(this.id==undefined){
                this.createOrModify = false
            }

            this.idtowatch = params['idtowatch'];

            if (this.idtowatch) {
                this.livraisonService.findOne(this.idtowatch).subscribe(value => {
                    this.onRowSelect(value.payload);
                }, () => this.chrgmt = false, () => this.chrgmt = false);
            }

            if (this.id != null) {
                this.bonCommandeService.findOne(this.id).subscribe(val => {
                    this.clientService.findOne(val.payload.clientId!).subscribe(value1 => {
                        this.client = value1.payload;
                        this.bonCommandeService.getBonByClient(this.client.id!).pipe(
                            finalize(() => this.chrgmt = false)
                        ).subscribe(v => {
                            this.bonCommandes = v.payload;
                            this.selectedBon = this.bonCommandes.find(bon => bon.id == this.id);
                            this.loadCommandesByBonCommande(this.selectedBon?.id!);
                        });
                    });
                });

                this.createOrModify = true;
            } else {
                this.bonCommandes = [];
                this.loadClients();
                this.client = {};
                this.selectedBon = {};
            }
        });
    }

    loadClients(){
        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
            }
        );
    }

    loadMagasins(){
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );
    }
    loadLivraisons(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.livraisonService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe({
                next: (res) => {
                    this.livraisons = res.payload;
                    this.loading = false;

                    // Obtenez le dernier numéro de commande
                    let lastNumber = '00000';  // valeur par défaut
                    if (this.livraisons.length > 0 && this.livraisons[0].lastNumber != null) {
                        lastNumber = this.livraisons[0].lastNumber;
                    }

                    // Générer le nouveau numéro de bon de commande
                    this.newBonCommandeNumber = this.generateBonCommandeNumber(lastNumber);

                    resolve(); // Résoudre la promesse une fois toutes les opérations terminées
                },
                error: (err) => {
                    reject(err); // Rejeter la promesse en cas d'erreur
                }
            });
        });
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
        const newBonCommandeNumber = `AL${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;

        return newBonCommandeNumber;
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }

    supprimerLigne(index: number) {
        if (this.commandes.length > 1) {
            this.commandes.splice(index, 1);
        }
    }

    isValidCommandes(): boolean {
        // @ts-ignore
        return this.commandes.every(commande => commande.quantiteLivree > 0);
    }

    ifExist(): boolean {
        if (this.livraisonToModify.id) {
            console.log("hfhhhfhffffh")
            return this.livraisons.some(
                value =>
                    value.id !== this.livraisonToModify.id &&
                    value.numero === this.livraisonToModify.numero);
        } else {
            return this.livraisons.some(value => value.numero === this.numeroCommande);
        }
    }

    onSubmit(ngForm: NgForm) {
        this.errorMessage = '';
            this.lignelivraison = [];
            this.commandes.forEach(commande => {
                this.ligne = {};
                if (commande.ligne_qui_puisse_id != null) {
                    this.ligne.id = commande.ligne_qui_puisse_id;
                }
                this.ligne.magasinId = commande.magasin?.id;
                this.ligne.commandeId = commande?.id;
                this.ligne.quantiteLivree = commande.quantiteLivree;
                this.ligne.livraisonClientId = this.livraisonToModify.id;
                this.lignelivraison.push(this.ligne);
            });
            this.livraisonToModify.numero = this.newBonCommandeNumber;
            this.livraisonToModify.lastNumber = this.newBonCommandeNumber.split('-').pop()!
            this.livraisonToModify.dateLivraison = this.date;
            this.livraisonToModify.ligneLivraisonClient = this.lignelivraison;
            this.livraisonToModify.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.livraisonToModify.boncommandeId = this.selectedBon?.id;
            console.log(this.livraisonToModify);

            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer cet avis de livraison?',
                accept: () => {
                    if (this.livraisonToModify?.id) {
                        let id = this.livraisonToModify.id
                        this.chrgmt = true;
                        this.livraisonService.update(this.livraisonToModify).subscribe(
                            () => {
                                this.loadLivraisons().then(()=>{
                                    this.resetForm();
                                    // @ts-ignore
                                    this.livraison = this.livraisons.find(f=>f.id == id)
                                    this.showMessage('success', 'Succès', 'La `livraison` a étée enregistré.');
                                    this.onRowSelect(this.livraison);
                                    this.chrgmt = false;
                                    this.createOrModify = false;
                                });
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                    } else {
                        console.log(this.livraisonToModify);
                        this.loading = true;
                        this.livraisonService.save(this.livraisonToModify).subscribe(
                            (response) => {
                                this.loadLivraisons().then(()=>{
                                    this.chrgmt = false;
                                    this.isSecondaryActive = false;
                                    this.showMessage('success', 'Succès', 'Cette livraison à été enregistré.');
                                    this.resetForm();
                                    this.createOrModify = false;
                                });
                            },
                            (error) => {
                                console.error('Erreur lors de l\'enregistrement du bon de commande :', error);
                                this.showMessage('error', 'Erreur', 'Erreur lors de l\'enregistrement de l\'avis');
                            }
                        );
                    }
                }
            });
    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    resetForm() {
        this.livraisonToModify = {};
        this.client = undefined;
        this.selectedBon = {};
    }

    cancel() {
        if(this.id!=null){
            this.retour(this.selectedBon!)
        }else{
            this.createOrModify = false;
        }
    }

    onRowSelect(recept: Livraison) {
        this.livraison = recept;
        console.log(this.livraison)
        this.isSecondaryActive = true;
        this.loadCommandesforshow(recept)
    }

    loadCommandesByBonCommande(id: number) {
        if(id!=null){
            this.bonCommandeService.getCommandeByBonId(id).subscribe(
                (res) => {
                    this.commandes = res.payload;
                    // @ts-ignore
                    this.commandes = res.payload.filter(commande => commande.quantiteLivree < commande.quantite);
                    this.commandes.forEach(v=>{
                        v.quantiteLivreetowatch = v.quantiteLivree;
                        // @ts-ignore
                        v.quantiteLivree = v.quantite - v.quantiteLivreetowatch
                        v.isInvalid = false;
                        if(v.magasinId!=null){
                            this.magasinService.findOne(v.magasinId).subscribe(magasin=>{
                                v.magasin = magasin.payload
                            })
                        }
                    })
                }
            );
        }else{
            this.commandes = [];
        }
    }

    loadCommandesforshow(livraison: Livraison) {
        if(livraison.boncommandeId!=null){
            this.bonCommandeService.getCommandeByBonId(livraison.boncommandeId).subscribe(
                (res) => {
                    this.commandes = res.payload;
                    var i =0;

                    this.commandes.forEach(v=>{
                        console.log(livraison.ligneLivraisonClient)
                        if(livraison.ligneLivraisonClient)
                        if(v.id === livraison.ligneLivraisonClient[i].commandeId){
                            livraison.ligneLivraisonClient[i].articleName = v.produitNom
                            i++;
                        }
                    })
                }
            );
        }else{
            this.commandes = [];
        }
    }

    validateQuantity(commande: any): boolean {
        console.log("Vision")
        console.log(commande)
        console.log(commande.quantiteLivree)
        console.log(commande.quantite + (commande.quantiteLivreetowatch))
        return commande.quantiteLivree <= (commande.quantite - (commande.quantiteLivreetowatch || 0));
    }

    onQuantityChange(commande: any, event: any) {
        commande.quantiteLivree = event.value
        console.log(commande)
        if (!this.validateQuantity(commande)) {
            commande.isInvalid = true;
            this.showMessage('error', 'Erreur', 'La quantité à livraisonnée ne peut pas exceder celle commandée');
            // Reset the invalid quantity
            commande.quantiteLivree = (commande.quantite - (commande.quantiteLivreetowatch || 0));
        }else{
            commande.isInvalid = false;
        }
    }

    async createModify(recept: Livraison) {
        if (recept.id) {
            this.livraisonToModify = recept;
            this.selectedBoolean=true;
            if (Array.isArray(this.livraisonToModify.dateLivraison) && this.livraisonToModify.dateLivraison.length >= 5) {
                this.date = new Date(
                    this.livraisonToModify.dateLivraison[0],      // Année
                    this.livraisonToModify.dateLivraison[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                    this.livraisonToModify.dateLivraison[2],      // Jour
                    this.livraisonToModify.dateLivraison[3],      // Heure
                    this.livraisonToModify.dateLivraison[4]       // Minute
                );
            }

            // Récupérer les détails du bon de commande et du client
            const bonCommande = await this.bonCommandeService.findOne(recept.boncommandeId!).toPromise();
            // @ts-ignore
            const client = await this.clientService.findOne(bonCommande.payload.clientId!).toPromise();

            // @ts-ignore
            this.client = client.payload;

            // Récupérer les bons de commande par client
            const bonCommandes = await this.bonCommandeService.getBonByClient(this.client.id!).toPromise();
            // @ts-ignore
            //this.bonCommandes = bonCommandes.payload;
            const bon = await this.bonCommandeService.findOne(recept.boncommandeId!).toPromise();
            this.bonCommandes.push(bon?.payload!)
            // @ts-ignore
            this.selectedBon = bon?.payload!;
            // Réinitialiser la liste des commandes
            this.commandes = [];

            // Préparer les promesses pour les commandes
            const promises = this.livraisonToModify.ligneLivraisonClient?.map(async (result) => {
                const commande = await this.commandeService.findOne(result.commandeId!).toPromise();
                // @ts-ignore
                const commandetoModify: any = commande.payload;
                console.log(commandetoModify)
                // @ts-ignore
                commandetoModify.quantiteLivreetowatch = commandetoModify.quantiteLivree - result.quantiteLivree;
                commandetoModify.quantiteLivree = result.quantiteLivree;
                commandetoModify.ligne_qui_puisse_id = result.id
                if (commandetoModify.magasinId != null) {
                    const magasin = await this.magasinService.findOne(commandetoModify.magasinId).toPromise();
                    console.log(magasin)
                    // @ts-ignore
                    commandetoModify.magasin = magasin.payload;
                }
                return commandetoModify;
            });
            if (promises) {
                this.commandes = await Promise.all(promises);
            }
        } else {
            this.selectedBoolean=false;
            this.resetForm();
        }

        this.createOrModify = true;
    }


    loadBonByClient(event: any) {
        if(event.value!=null){
            this.bonCommandeService.getBonByClient(event.value.id).subscribe(value => {
                this.bonCommandes = value.payload;
                this.selectedBon = undefined
            })
        }else{
            this.bonCommandes = []
        }
    }

    isValidForm(): boolean {
        for (const commande of this.commandes) {
            if (!commande.magasin || commande.isInvalid ) {
                return false; // Si au moins une commande n'a pas de magasin sélectionné, retourne false
            }
        }
        return true; // Retourne true si toutes les conditions sont remplies
    }

    retour(bond: BonCommande) {
        this.router.navigate(['gestock/commandeClient'], { queryParams: { idtowatch: bond.id } });
    }

    deleteElement(livraisonToDelete: Livraison) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (livraisonToDelete === null) {
                    return;
                } else {
                    if (livraisonToDelete.id != null) {
                        this.chrgmt = true;
                        this.livraisonService.delete(livraisonToDelete.id).subscribe(
                            () => {
                                this.loadLivraisons().then(()=>{
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.chrgmt = false;
                                    this.isSecondaryActive=false;
                                });
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression !')
                        );
                    }
                }
            }
        });
    }

    protected readonly event = event;

    viewBon(livraison: Livraison) {
        this.router.navigate(['gestock/commandeClient'], { queryParams: { idtowatch: livraison.boncommandeId } });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    close(){
        this.isSecondaryActive = false;
    }
}
