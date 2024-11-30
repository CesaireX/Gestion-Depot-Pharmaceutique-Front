import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MenuItem, Message, MessageService} from "primeng/api";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {FournisseurService} from "../../../store/services/gestock-service/Fournisseur.service";
import {
    Reception,
    Commande,
    Fournisseur,
    Produit,
    Taxe,
    BonCommande,
    LigneReceptionFrs, Magasin, Livraison
} from "../../../store/entities/gestock.entity";
import {NgForm} from "@angular/forms";
import {ReceptionService} from "../../../store/services/gestock-service/Reception.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BonCommandeService} from "../../../store/services/gestock-service/BonCommandeService";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {CommandeService} from "../../../store/services/gestock-service/Commande.service";
import {formatDate} from "@angular/common";
import {Table} from "primeng/table";
import {finalize, map, mergeMap, switchMap, tap} from "rxjs";

@Component({
    selector: 'app-reception-commande',
    templateUrl: './reception-commande.component.html',
    styleUrls: ['./reception-commande.component.scss']
})
export class ReceptionCommandeComponent implements OnInit {
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
    bonCommande: Reception = {};
    chrgmt: boolean = false;
    taxes: { id: number, label: string, value: number }[] = [];

    articles = [{id: null, produitId: 0, quantite: 1, produitPrix: 0, taxe: 0, montant: 0}];
    sousTotal = 0;
    remise = 0;
    ajustement = 0;
    total = 0;
    remiseType : any; // default type
    messages: Message[] | undefined;
    modal = '';
    // Variables pour la gestion du numéro de commande
    commandPrefix: string = 'POA-';
    lastCommandNumber: number = 13;
    errorMessage: string = '';
    createOrModify: boolean = false;

    fournisseurs: Fournisseur[] = [];
    receptions: Reception[] = [];
    bonCommandes: BonCommande[] = [];
    reception: Reception = {};
    receptionToModify: Reception = {};
    commandetoModify: Commande = {};
    commandes: Commande[] = [];
    id: any;
    selectedBon: BonCommande | undefined = {};
    lignereception: LigneReceptionFrs[] = [];
    ligne: LigneReceptionFrs = {};
    magasins: Magasin[] = [];
    idtowatch: any;
    newBonCommandeNumber: any;
    selectedBoolean = false;
    droits: any;

    constructor(
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        private confirmationService: ConfirmationService,
        private fournisseurService: FournisseurService,
        private magasinService: MagasinService,
        private bonCommandeService: BonCommandeService,
        private commandeService: CommandeService,
        protected router: Router,
        private receptionService: ReceptionService,
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
                this.loadReceptions(),
                this.loadMagasins(),
                this.loadInitialy()
            ]);

        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }
    generateCommandNumber(lastNumber: number): string {
        return this.commandPrefix + String(lastNumber).padStart(5, '0');
    }

    loadFournisseurs(){
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );
    }

    isValidCommandes(): boolean {
        // @ts-ignore
        return this.commandes.every(commande => commande.quantiterecue > 0);
    }


    loadMagasins(){
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );
    }

    loadReceptions(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.receptionService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe({
                next: (res) => {
                    this.receptions = res.payload;
                    this.loading = false;

                    // Obtenez le dernier numéro de commande
                    let lastNumber = '00000';  // valeur par défaut
                    if (this.receptions.length > 0 && this.receptions[0].lastNumber != null) {
                        lastNumber = this.receptions[0].lastNumber;
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


    loadInitialy() {
        this.chrgmt = true; // Commencer le spinner

        this.aroute.queryParams.subscribe((params) => {
            this.id = params['id'];
            this.idtowatch = params['idtowatch'];

            if(this.id==undefined){
                this.createOrModify = false
            }

            if (this.idtowatch) {
                this.receptionService.findOne(this.idtowatch).pipe(
                    tap(value => {
                        this.onRowSelect(value.payload);
                    }),
                    finalize(() => this.chrgmt = false)
                ).subscribe();
            }

            if (this.id != null) {
                this.bonCommandeService.findOne(this.id).pipe(
                    mergeMap(val => this.fournisseurService.findOne(val.payload.fournisseurId!).pipe(
                        map(value1 => ({ bonCommande: val.payload, fournisseur: value1.payload }))
                    )),
                    mergeMap(data => this.bonCommandeService.getBonByFrs(data.fournisseur.id!).pipe(
                        map(v => ({ bonCommandes: v.payload, selectedBon: data.bonCommande, fournisseur: data.fournisseur }))
                    )),
                    tap(data => {
                        this.bonCommandes = data.bonCommandes;
                        this.selectedBon = data.selectedBon;
                        this.fournisseur = data.fournisseur;
                        this.loadCommandesByBonCommande(this.selectedBon?.id!);
                    }),
                    finalize(() => this.chrgmt = false)
                ).subscribe();

                this.createOrModify = true;
            } else {
                this.bonCommandes = [];
                this.loadFournisseurs();
                this.fournisseur = {};
                this.selectedBon = {};
                this.chrgmt = false;
            }
        });
    }

    supprimerLigne(index: number) {
        if (this.commandes.length > 1) {
            this.commandes.splice(index, 1);
        }
    }

    ifExist(): boolean {
        if (this.receptionToModify.id) {
            console.log("hfhhhfhffffh")
            return this.receptions.some(
                value =>
                    value.id !== this.receptionToModify.id &&
                    value.numero === this.receptionToModify.numero);
        } else {
            return this.receptions.some(value => value.numero === this.numeroCommande);
        }
    }

    onSubmit(ngForm: NgForm) {
        this.errorMessage = '';
        this.lignereception = [];
        this.commandes.forEach(commande => {
            this.ligne = {};
            if (commande.ligne_qui_puisse_id != null) {
                this.ligne.id = commande.ligne_qui_puisse_id;
            }
            this.ligne.magasinId = commande.magasin?.id;
            this.ligne.commandeId = commande?.id;
            this.ligne.quantiteRecue = commande.quantiterecue;
            this.ligne.receptionFournisseurId = this.receptionToModify.id;
            this.lignereception.push(this.ligne);
        });
        this.receptionToModify.numero = this.newBonCommandeNumber;
        this.receptionToModify.lastNumber = this.newBonCommandeNumber.split('-').pop()!
        this.receptionToModify.dateReception = this.date;
        this.receptionToModify.ligneReceptionFrs = this.lignereception;
        this.receptionToModify.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.receptionToModify.boncommandeId = this.selectedBon?.id;
        console.log(this.receptionToModify);

        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer cet avis de reception?',
            accept: () => {
                if (this.receptionToModify?.id) {
                    let id = this.receptionToModify.id
                    this.chrgmt = true;
                    this.receptionService.update(this.receptionToModify).subscribe(
                        () => {
                            this.loadReceptions().then(()=>{
                                    this.resetForm();
                                    // @ts-ignore
                                    this.reception = this.receptions.find(f=>f.id == id)
                                    this.showMessage('success', 'Succès', 'La réception a étée enregistré.');
                                    this.onRowSelect(this.reception);
                                    this.chrgmt = false;
                                    this.createOrModify = false;
                            });
                        },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                    );
                } else {
                    console.log(this.receptionToModify);
                    this.chrgmt = true;
                    this.receptionService.save(this.receptionToModify).subscribe(
                        (response) => {
                            this.loadReceptions().then(()=>{
                                this.chrgmt = false;
                                this.isSecondaryActive = false;
                                this.showMessage('success', 'Succès', 'Cet avis de reception a été enregistré.');
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
        this.receptionToModify = {};
        this.fournisseur = undefined;
        this.selectedBon = {};
    }

    onRowSelect(recept: Reception) {
        this.reception = recept;
        console.log(this.reception)
        this.isSecondaryActive = true;
        this.loadCommandesforshow(recept)
    }

    loadCommandesByBonCommande(id: number) {
        console.log(id)
        if(id!=null){
            this.bonCommandeService.getCommandeByBonId(id).subscribe(
                (res) => {
                    this.commandes = res.payload;
                    console.log(this.commandes)
                    // @ts-ignore
                    this.commandes = res.payload.filter(commande => commande.quantiterecue < commande.quantite);
                    this.commandes.forEach(v=>{
                        console.log(v)
                        v.quantiterecuetowatch = v.quantiterecue;
                        // @ts-ignore
                        v.quantiterecue = v.quantite - v.quantiterecuetowatch
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
        const newBonCommandeNumber = `AR${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;

        return newBonCommandeNumber;
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }
    loadCommandesforshow(reception: Reception) {
        if(reception.boncommandeId!=null){
            this.bonCommandeService.getCommandeByBonId(reception.boncommandeId).subscribe(
                (res) => {
                    this.commandes = res.payload;
                    var i =0;

                    this.commandes.forEach(v=>{
                        console.log(reception.ligneReceptionFrs)
                        if(reception.ligneReceptionFrs)
                        if(v.id === reception.ligneReceptionFrs[i].commandeId){
                            reception.ligneReceptionFrs[i].articleName = v.produitNom
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
        console.log(commande.quantiterecue)
        console.log(commande.quantite + (commande.quantiterecuetowatch))
        return commande.quantiterecue <= (commande.quantite - (commande.quantiterecuetowatch || 0));
    }

    onQuantityChange(commande: any, event: any) {
        commande.quantiterecue = event.value
        console.log(commande)
        if (!this.validateQuantity(commande)) {
            commande.isInvalid = true;
            this.showMessage('error', 'Erreur', 'La quantité à receptionnée ne peut pas exceder celle commandée');
            // Reset the invalid quantity
            commande.quantiterecue = (commande.quantite - (commande.quantiterecuetowatch || 0));
        }else{
            commande.isInvalid = false;
        }
    }

    deleteReception(receptionToDelete: Reception) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (receptionToDelete === null) {
                    return;
                } else {
                    /*if (this.hasFacture){
                        this.showMessage('error', 'SUPPRESSION', 'Impossible de supprimé car des factures sont liées !');
                        return;
                    }*/
                    if (receptionToDelete.id != null) {
                        this.chrgmt = true;
                        this.receptionService.delete(receptionToDelete.id).subscribe(
                            () => {
                                this.loadReceptions().then(() => { // utilisez .then() pour attendre que loadInvoices soit terminé
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


    async createModify(recept: Reception) {
        if (recept.id) {
            this.receptionToModify = recept;
            this.selectedBoolean=true;
            if (Array.isArray(this.receptionToModify.dateReception) && this.receptionToModify.dateReception.length >= 5) {
                this.date = new Date(
                    this.receptionToModify.dateReception[0],      // Année
                    this.receptionToModify.dateReception[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                    this.receptionToModify.dateReception[2],      // Jour
                    this.receptionToModify.dateReception[3],      // Heure
                    this.receptionToModify.dateReception[4]       // Minute
                );
            }
            // Récupérer les détails du bon de commande et du fournisseur
            const bonCommande = await this.bonCommandeService.findOne(recept.boncommandeId!).toPromise();
            // @ts-ignore
            const fournisseur = await this.fournisseurService.findOne(bonCommande.payload.fournisseurId!).toPromise();
            // @ts-ignore
            this.fournisseur = fournisseur.payload;
            // @ts-ignore
            // this.bonCommandes = bonCommandes.payload;
            const bon = await this.bonCommandeService.findOne(recept.boncommandeId!).toPromise();
            this.bonCommandes.push(bon?.payload!)
            // @ts-ignore
            this.selectedBon = bon?.payload!;
            // Réinitialiser la liste des commandes
            this.commandes = [];

            // Préparer les promesses pour les commandes
            const promises = this.receptionToModify.ligneReceptionFrs?.map(async (result) => {
                const commande = await this.commandeService.findOne(result.commandeId!).toPromise();
                // @ts-ignore
                const commandetoModify: any = commande.payload;
                console.log(commandetoModify)
                // @ts-ignore
                commandetoModify.quantiterecuetowatch = commandetoModify.quantiterecue - result.quantiteRecue;
                commandetoModify.quantiterecue = result.quantiteRecue;
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


    loadBonByFrs(event: any) {
        if(event.value!=null){
            this.bonCommandeService.getBonByFrs(event.value.id).subscribe(value => {
                this.bonCommandes = value.payload;
                this.selectedBon = undefined
            })
        }else{
            this.bonCommandes = []
        }
    }

    isValidForm(): boolean {
        // Vérifiez ici les conditions nécessaires, par exemple la sélection de magasin pour chaque commande
        for (const commande of this.commandes) {
            if (!commande.magasin || commande.isInvalid ) {
                return false; // Si au moins une commande n'a pas de magasin sélectionné, retourne false
            }
            // Ajoutez d'autres vérifications si nécessaire
        }
        // Ajoutez d'autres validations ici selon vos besoins

        return true; // Retourne true si toutes les conditions sont remplies
    }

    viewBond(reception: Reception) {
        this.router.navigate(['gestock/bonCommande'], { queryParams: { idtowatch: reception.boncommandeId } });
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

    viewBon(reception: Reception) {
        this.router.navigate(['gestock/bonCommande'], { queryParams: { idtowatch: reception.boncommandeId } });
    }

    cancel() {
        if(this.id!=null){
            this.retour(this.selectedBon!)
        }else{
            this.createOrModify = false;
        }
    }

    retour(bond: BonCommande) {
        this.router.navigate(['gestock/bonCommande'], { queryParams: { idtowatch: bond.id } });
    }

    protected readonly event = event;

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    close(){
        this.isSecondaryActive = false;
    }
}
