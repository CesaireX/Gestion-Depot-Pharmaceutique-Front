import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    Client,
    Creance, Facture,
    FactureSortie,
    Magasin,
    PaiementFactureDTO,
    Recu, Societe
} from "../../../store/entities/gestock.entity";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {CreanceService} from "../../../store/services/gestock-service/etats-gest-service/Creance.service";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {RecuService} from "../../../store/services/gestock-service/Recu.service";
import {Mode_paiement} from "../../../store/enum/enums";
import {formatDate} from "@angular/common";
import {SocieteService} from "../../../store/services/gestock-service/Societe.service";
@Component({
    selector: 'app-creance',
    templateUrl: './creance.component.html',
    styleUrls: ['./creance.component.scss']
})
export class CreanceComponent implements OnInit {

    creances: Creance[] = [];
    clients: Client[] = [];
    display?: Boolean;
    selectedItem: Creance = <Creance>{};
    loading: boolean = true;
    chrgmt: boolean = false;
    creance: Creance = <Creance>{};
    clientSelected: Client = {};
    currentdate: Date = new Date();
    droits: any;
    recu: Recu = <Recu>{};
    clientselected?: Client;
    isSecondaryActive = false;
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    @ViewChild('filter') filter!: ElementRef;
    date: Date = new Date();
    displayForm: boolean = false;
    recuState: boolean = false;
    recuToWatch: Recu = <Recu>{};
    idcreance: any;
    newBonCommandeNumber: any;
    detailCreance: boolean=true;
    paiementtowatch: PaiementFactureDTO = <PaiementFactureDTO>{};
    creancetoWach: Creance = <Creance>{};
    creancestoWach: Creance[] = [];
    societyId: any;
    societegetted: Societe = {};
    constructor(
        protected clientService: ClientService,
        protected creanceService: CreanceService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
        protected activatedRoute: ActivatedRoute,
        protected societeService: SocieteService,
        protected recuService: RecuService,
    ) {
    }

    ngOnInit(): void {
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.droits = this.tokenStorage.getdroits();
        this.display = false;
        this.chrgmt = true; // Cacher le spinner après le chargement de toutes les données

        this.loadInitialData().then(() => {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données
        }).catch((error) => {
            console.error(error);
            this.chrgmt = false; // Cacher le spinner en cas d'erreur
        });
    }

    async loadInitialData(): Promise<void> {
        try {
            const societePromise = this.societeService.findOne(this.societyId).toPromise();
            const loadAllPromise = this.loadAll();
            const loadClientsPromise = this.loadClients();

            await Promise.all([societePromise, loadAllPromise, loadClientsPromise]);

            this.societeService.findOne(this.societyId).subscribe(societe => {
                this.societegetted = societe.payload;
            });

            this.activatedRoute.queryParams.subscribe(async (params) => {
                this.idcreance = params['idcreance'];
                if (this.idcreance != null) {
                    const creance = await this.creanceService.findOne(this.idcreance).toPromise();
                    this.onRowSelect(creance!.payload);
                    this.isSecondaryActive = true;
                }
            });
        } catch (error) {
            console.error(error);
            throw error; // Rejeter la promesse pour attraper l'erreur dans ngOnInit
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
        const newBonCommandeNumber = `CR/C/${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;

        return newBonCommandeNumber;
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }

    add(creanceValue: any) {
        this.clientSelected = {};
        if (creanceValue === null) {
            // @ts-ignore
            this.creance={};
            // @ts-ignore
            this.clientSelected = undefined
        } else {
            // @ts-ignore
            this.creance = creanceValue;
            this.newBonCommandeNumber = this.creance.numero

            if (Array.isArray(creanceValue.date_creance) && creanceValue.date_creance.length >= 5) {
                this.date = new Date(
                    creanceValue.date_creance[0],      // Année
                    creanceValue.date_creance[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                    creanceValue.date_creance[2],      // Jour
                    creanceValue.date_creance[3],      // Heure
                    creanceValue.date_creance[4]       // Minute
                );
            }

            // @ts-ignore
            this.clientSelected = this.clients.find(value => value.id===this.creance.clientId)
        }
        this.displayForm = true
    }

    closeSection(editform: NgForm) {
        this.displayForm =  false
        //editform.resetForm()
    }

    deleteElement(creanceToDelete: Creance) {
        if(creanceToDelete.montant_restant_a_payer!= creanceToDelete.montant_creance){
            this.showMessage('error', 'Ajout', 'Impossible de Supprimer une créance dont vous avez commencer le règlement!')
        }else{
            this.confirmationService.confirm({
                header: 'Confirmation',
                message: 'Etes-vous sûr de vouloir supprimer la créance du client?',
                accept: () => {
                    if (creanceToDelete === null) {
                        return;
                    } else {

                        if (creanceToDelete.id != null) {
                            this.chrgmt = true;
                            this.creanceService.delete(creanceToDelete.id).subscribe(
                                () => {
                                    this.loadAll().then(()=>{
                                        this.isSecondaryActive = false
                                        this.chrgmt = false;
                                        this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                        this.displayForm = false;
                                    });
                                },
                                () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car catégorie est déja utilisé!')
                            );
                        }
                    }
                }
            });
        }
    }


    loadAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.loading = true; // Début du chargement
            this.creanceService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (res) => {
                    this.creances = res.payload;
                    this.loading = false; // Fin du chargement

                    // Obtenez le dernier numéro de commande
                    let lastCommandNumber = '00000';  // valeur par défaut
                    if (this.creances.length > 0 && this.creances[0].lastNumber != null) {
                        lastCommandNumber = this.creances[0].lastNumber;
                    }

                    // @ts-ignore
                    this.newBonCommandeNumber = this.generateBonCommandeNumber(lastCommandNumber);

                    resolve(); // résoudre la promesse une fois les créances chargées
                },
                (error) => {
                    console.error(error);
                    this.loading = false; // Fin du chargement en cas d'erreur
                    reject(error); // rejeter la promesse en cas d'erreur
                }
            );
        });
    }

    loadClients(){
        this.clientService.findclientsbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
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
    save(editForm: NgForm) {
            this.creance.lastNumber = this.newBonCommandeNumber.split('-').pop()!
            this.creance.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.creance.date_creance = new Date(this.date.getTime());
            this.creance.numeroCheque = this.recu.numeroCheque;
            this.creance.numero = this.newBonCommandeNumber
            this.creance.listPaiements = [];
            if (this.clientSelected.id != null) {
                this.creance.clientId = this.clientSelected.id;
            }
            if (this.clientSelected.nom != null) {
                this.creance.clientNom = this.clientSelected.nom;
            }
            if (this.clientSelected.prenom != null) {
                this.creance.clientPrenom = this.clientSelected.prenom;
            }
        console.log(this.creance)
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer cette creance?',
                accept: () => {

                    if (this.creance?.id) {
                        // @ts-ignore
                        if (this.selectedItem.listPaiements?.length>0) {
                            this.showMessage('error', 'Ajout', 'Impossible de modifier une créance dont vous avez commencer le règlement!')
                        } else {
                            this.chrgmt = true;
                            this.creanceService.update(this.creance).subscribe(
                                () => {
                                    this.loadAll().then(()=>{
                                        this.chrgmt = false;
                                        this.isSecondaryActive = false
                                        // @ts-ignore
                                        this.creance={};
                                        this.clientselected = {}
                                        this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                        this.displayForm = false;
                                    });
                                },

                                () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                            );
                        }
                    }
                    else {
                        this.chrgmt = true;
                        this.creanceService.save(this.creance).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.chrgmt = false;
                                    this.isSecondaryActive = false
                                    this.clientselected = {}
                                    // @ts-ignore
                                    this.creance={};
                                    this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                    this.displayForm = false;
                                });
                            },

                            () => this.showMessage('error', 'Ajout', 'Echec Ajout !')
                        );
                    }
                }
            });

    }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    getRecuByCreanceId(creanceid: number) {
        this.recuService.getRecuByCreanceId(creanceid).subscribe(
            (res) => {
                this.selectedItem.listRecus = res.payload
            }
        );
    }

    onAccordionOpen() {
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

    actualiseMontant(event: any) {
        this.creance.montant_creance = event.value
    }

    onRowSelect(creance: any) {
        this.getRecuByCreanceId(creance.id)
        this.selectedItem = creance;
        this.isSecondaryActive = true;
        this.getPaiementsByCreanceId(creance.id!)
        console.log(this.creances)
    }

    private getPaiementsByCreanceId(creanceId: number) {
        this.recuService.getPaiementByCreanceId(creanceId).subscribe(
            (res) => {
                console.log(res)
                this.creances.forEach(creanceverif => {
                    if (creanceverif.id === creanceId) {
                        creanceverif.listPaiements = res.payload;
                        this.selectedItem.listPaiements = res.payload
                        console.log(this.selectedItem)
                    }
                })
            }
        );
    }

    viewRecu(recu: any) {
        console.log(recu)
        this.recuState = true;
        this.creancestoWach = []
        this.paiementtowatch = recu
        console.log(this.paiementtowatch)
        for (const factureId in this.paiementtowatch.invoicePayments) {
            if (this.paiementtowatch.invoicePayments.hasOwnProperty(factureId)) {
                const amount = this.paiementtowatch.invoicePayments[factureId];

                this.creanceService.findOne(Number(factureId)).subscribe(facture=>{
                    console.log(`Facture ID: ${factureId}, Amount: ${amount}`);
                    this.creancetoWach = facture.payload
                    this.creancestoWach.push(this.creancetoWach)
                    console.log(this.creancestoWach)
                })
            }
        }
    }

    effectuer_paiement(idcreance: number){
        this.router.navigate(['gestock/caisse'], { queryParams: { idcreance: idcreance } });
    }

    deleteRecu(recuToDelete: Recu) {
        let id = recuToDelete.creanceId;
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler le paiement?',
            accept: () => {
                if (recuToDelete === null) {
                    return;
                } else {

                    if (recuToDelete.id != null) {
                        this.chrgmt = true;
                        this.recuService.deleteRecu(recuToDelete.id).subscribe(
                            () => {
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                this.recuState = false;
                                this.loadAll().then(()=>{
                                    this.isSecondaryActive = false
                                    this.chrgmt = false;
                                })
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car catégorie est déja utilisé!')
                        );
                    }
                }
            }
        });
    }

    close(){
        this.isSecondaryActive = false;
    }
}
