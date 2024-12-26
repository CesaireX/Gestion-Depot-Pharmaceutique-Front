import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    Client,
    Creance,
    Facture,
    FactureSortie,
    Magasin, PaiementFactureDTO,
    PayerFacturesRequestDTO,
    Recu
} from "../../../store/entities/gestock.entity";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {CreanceService} from "../../../store/services/gestock-service/etats-gest-service/Creance.service";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {RecuService} from "../../../store/services/gestock-service/Recu.service";
import {Mode_paiement} from "../../../store/enum/enums";
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {formatDate} from "@angular/common";
@Component({
    selector: 'app-paiement',
    templateUrl: './paiement.component.html',
    styleUrls: ['./paiement.component.scss']
})
export class PaiementComponent implements OnInit {

    creances: Creance[] = [];
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
    loading: boolean = false;
    creance: Creance = <Creance>{};
    clientSelected: Client = {};
    currentdate: Date = new Date();
    droits: any;
    activepaiementbool: boolean = false;
    creanceSelected: any = {};
    recu: Recu = <Recu>{};
    paiementFactureDTO: PaiementFactureDTO = <PaiementFactureDTO>{};
    clientselected?: Client;
    modifyrecu: Boolean = false;
    montant_a_rajouter: number | undefined = 0;
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    @ViewChild('filter') filter!: ElementRef;
    idfacture: any;
    idcreance: any;
    idrecu: any
    factureSelected: any = {};
    date: Date = new Date();
    confirm: boolean = false;
    paiements: PaiementFactureDTO[] = [];
    newBonCommandeNumber: any;
    idFactures: number[] = [];
    idCreances: number[] = [];
    selectedFacturess : Facture[] = [];
    totalReste: number = 0;
    Paiement: PayerFacturesRequestDTO = <PayerFacturesRequestDTO>{};
    idPaiement: any;
    constructor(
        protected clientService: ClientService,
        protected creanceService: CreanceService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
        protected factureService: FactureService,
        protected aroute: ActivatedRoute,
        protected recuService: RecuService,
    ) {
    }

    ngOnInit(): void {

        this.aroute.queryParams.subscribe((params) => {
            this.idfacture = params['idfacture'];
            this.idcreance = params['idcreance'];
            this.idrecu = params['idrecu'];
            this.idPaiement = params['idpaiement'];

            if (params['idfactures']) {
                this.idFactures = params['idfactures'].split(',').map((id: string) => +id);
                console.log(this.idFactures);
                this.totalReste = 0;
                this.idFactures.forEach(id => {
                    this.factureService.findOne(id).subscribe(facture => {
                        this.selectedFacturess.push(facture.payload);
                        if (facture.payload.reste != null) {
                            this.totalReste += facture.payload.reste;
                        }
                        this.recu.montant = this.totalReste;
                    });
                });
            }

            if(this.idfacture!=null){
                this.factureService.findOne(this.idfacture).subscribe(facture=>{
                    this.factureSelected = facture.payload
                    if (facture.payload.reste != null) {
                        this.recu.montant = facture.payload.reste
                    }
                })
            }
            if(this.idcreance!=null){
                this.creanceService.findOne(this.idcreance).subscribe(creance=>{
                    this.creanceSelected = creance.payload
                    if (creance.payload.montant_restant_a_payer != null) {
                        this.recu.montant = creance.payload.montant_restant_a_payer
                    }
                })
            }
            if(this.idPaiement!=null){
                this.modifyrecu = true;
                this.recuService.getpaiement(this.idPaiement).subscribe(recu=>{
                    this.paiementFactureDTO = recu.payload
                        this.montant_a_rajouter = this.paiementFactureDTO.montant;
                        this.modifyrecu = true;
                        this.activepaiementbool = true;
/*                    this.factureService.findOne(this.paiementFactureDTO.factureId!).subscribe(facture=>{
                        this.factureSelected = facture.payload
                        this.idfacture = this.factureSelected.id;
                        if (facture.payload.reste != null) {
                            this.recu.montant = facture.payload.reste
                        }
                    })*/
                })
            }

            this.recuService.getpaiements(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(paiements=>{
                console.log(paiements.payload)

                this.paiements = paiements.payload

                // Obtenez le dernier numéro de commande
                let lastCommandNumber = '00000';  // valeur par défaut
                if (this.paiements.length > 0 && this.paiements[0].lastNumber != null) {
                    lastCommandNumber = this.paiements[0].lastNumber;
                }
                console.log(lastCommandNumber)

                // Générer le nouveau numéro de bon de commande
                // @ts-ignore
                this.newBonCommandeNumber = this.generateBonCommandeNumber(lastCommandNumber);
            })

        })

        this.droits = this.tokenStorage.getdroits();
    }
    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
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
        const newBonCommandeNumber = `PA${formattedDate}-${this.padNumber(newCommandNumber, commandNumberLength)}`;

        return newBonCommandeNumber;
    }

    padNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }


    async saveRecu(editForm: NgForm) {
        this.recu.date_paiement = this.date;
        this.recu.numero = this.newBonCommandeNumber
        this.confirm = false;
        if (!this.modifyrecu) {
            let montant_limite: number | undefined = 0;

            this.recu.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            if (this.idcreance != null) {
                if (this.creanceSelected.id != null) {
                    this.recu.creanceId = this.creanceSelected.id;
                }
                if (this.creanceSelected.montant_creance != null) {
                    this.recu.montantCreance = this.creanceSelected.montant_creance;
                }
                montant_limite = this.creanceSelected.montant_restant_a_payer;
            }
            if (this.idfacture != null) {
                if (this.factureSelected.id != null) {
                    this.recu.factureId = this.factureSelected.id;
                }
                montant_limite = this.factureSelected.reste;
            }

            // @ts-ignore
            if (this.recu.montant <= montant_limite) {
                this.confirmationService.confirm({
                    header: 'ENREGISTREMENT',
                    message: 'Voulez-vous vraiment enregistrer ce paiement?',
                    accept: async () => {
                        this.loading = true; // Affiche le spinner

                        try {
                            await new Promise((resolve, reject) => {
                                this.recuService.saveNewRecu(this.recu).subscribe(
                                    value => {
                                        this.showMessage('success', 'Enregistrement', 'Paiement effectué avec succès !');
                                        this.confirm = true;
                                        resolve(null);
                                    },
                                    error => {
                                        this.showMessage('error', 'Erreur Paiement', 'Echec lors du paiement !');
                                        reject(error);
                                    }
                                );
                            });
                            editForm.resetForm();
                        } catch (error) {
                            console.error(error);
                        } finally {
                            this.loading = false;

                            if (this.confirm) {
                                if (this.idfacture != null) {
                                    setTimeout(() => {
                                        if(this.factureSelected.clientId!=null){
                                            this.router.navigate(['gestock/factureClient'], { queryParams: { idfacture: this.idfacture } });
                                        }else{
                                            this.router.navigate(['gestock/factureFournisseur'], { queryParams: { idfacture: this.idfacture } });
                                        }
                                    }, 1000); // délai de 2 secondes
                                }
                                if (this.idcreance!=null) {
                                    setTimeout(() => {
                                        this.router.navigate(['gestock/creance'], { queryParams: { idcreance: this.idcreance } });
                                    }, 1000); // délai de 2 secondes
                                }
                            }
                        }
                    }
                });
            } else {
                this.showMessage('error', 'ERREUR', 'Le montant du paiement ne peut excéder celui du reste à payer!');
            }
        } else {
            this.UpdateRecucontent(this.recu, editForm);
        }
    }
    async savePaiement(editForm: NgForm) {
        this.recu.date_paiement = this.date;
        this.recu.numero = this.newBonCommandeNumber
        this.recu.solde_restant = this.recu.montant
        let montant_limite: number | undefined = 0;

        if (this.idcreance != null) {
            if (this.creanceSelected.id != null) {
                this.recu.creanceId = this.creanceSelected.id;
            }
            if (this.creanceSelected.montant_creance != null) {
                this.recu.montantCreance = this.creanceSelected.montant_creance;
            }
            this.idCreances.push(this.idcreance)
            montant_limite = this.creanceSelected.montant_restant_a_payer;
            this.Paiement.creanceIds = this.idCreances;
        }
        if (this.idfacture != null) {
            this.idFactures.push(this.idfacture)
            montant_limite = this.factureSelected.reste;
            this.Paiement.factureIds = this.idFactures;
        }

        this.Paiement.recuDTO = this.recu
        this.confirm = false;
        if (!this.modifyrecu) {

            this.recu.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            if (this.selectedFacturess.length>0) {
                this.selectedFacturess.forEach(fact=>{
                    // @ts-ignore
                    montant_limite = montant_limite + fact.reste!
                    if (fact.id != null) {
                        this.recu.factureId = fact.id
                    }
                })
            }

            // @ts-ignore
            if (this.recu.montant <= montant_limite) {
                this.confirmationService.confirm({
                    header: 'ENREGISTREMENT',
                    message: 'Voulez-vous vraiment enregistrer ce paiement?',
                    accept: async () => {
                        this.loading = true; // Affiche le spinner

                        try {
                            await new Promise((resolve, reject) => {
                                this.recuService.savePaiement(this.Paiement).subscribe(
                                    value => {
                                        this.showMessage('success', 'Enregistrement', 'Paiement effectué avec succès !');
                                        this.confirm = true;
                                        resolve(null);
                                    },
                                    error => {
                                        this.showMessage('error', 'Erreur Paiement', 'Echec lors du paiement !');
                                        reject(error);
                                    }
                                );
                            });
                            editForm.resetForm();
                        } catch (error) {
                            console.error(error);
                        } finally {
                            this.loading = false;

                            if (this.confirm) {
                                if (this.idfacture != null) {
                                    setTimeout(() => {
                                        if(this.factureSelected.clientId!=null){
                                            this.router.navigate(['gestock/factureClient'], { queryParams: { idfacture: this.idfacture } });
                                        }else{
                                            this.router.navigate(['gestock/factureFournisseur'], { queryParams: { idfacture: this.idfacture } });
                                        }
                                    }, 1000); // délai de 2 secondes
                                }
                                if (this.idcreance!=null) {
                                    setTimeout(() => {
                                        this.router.navigate(['gestock/creance'], { queryParams: { idcreance: this.idcreance } });
                                    }, 1000); // délai de 2 secondes
                                }
                            }
                        }
                    }
                });
            } else {
                this.showMessage('error', 'ERREUR', 'Le montant du paiement ne peut excéder celui du reste à payer!');
            }
        } else {
            this.UpdateRecucontent(this.recu, editForm);
        }
    }

    reportrecu(id: number){
        this.recuService.generateReport(id).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }

    UpdateRecucontent(recu: Recu, editForm: NgForm){
        recu.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        // @ts-ignore
        this.confirmationService.confirm({
            header: 'MISE A JOUR DU REÇU',
            message: 'Voulez-vous vraiment modifier ce reçu?',

            accept: () => {
                this.loading = true
                this.recuService.updateRecu(this.recu).subscribe(
                    value => {
                        this.showMessage('success', 'Enregistremenet', 'Paiement effectué avec succès !');
                        this.loading = false;
                        editForm.resetForm();
                        //this.getRecuByCreanceId(recu.creanceId);
                        //this.reportrecu(value.payload.id!);
                    },
                    () => this.showMessage('error', 'Erreur Paiement', 'Echec lors du paiement !')
                );
            }
        });
    }

    getRecuByCreanceId(creanceid: number | undefined) {
        if (creanceid != null) {
            this.recuService.getRecuByCreanceId(creanceid).subscribe(
                (res) => {
                    this.creances.forEach(creanceverif => {
                        if (creanceverif.id === creanceid) {
                            creanceverif.listRecus = res.payload;
                        }
                    })
                }
            );
        }
    }

    modifyRecu(recu: Recu, creance: Creance){
        this.recu = recu;
        this.montant_a_rajouter = this.recu.montant;
        this.creanceSelected = creance;
        this.modifyrecu = true;
        this.activepaiementbool = true;
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

                            this.recuService.deleteRecu(recuToDelete.id).subscribe(
                                () => {
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                    this.getRecuByCreanceId(id);
                                },
                                () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression cardéja utilisé!')
                            );
                        }
                    }
                }
            });
    }

    SaveChoice(editForm: NgForm){
            this.display = true;
            this.saveRecu(editForm);
    }

    actualiseReception(event: any) {
        this.recu.montant = event.value
    }

    retour() {
        if (this.idfacture != null) {
                if(this.factureSelected.clientId!=null){
                    this.router.navigate(['gestock/factureClient'], { queryParams: { idfacture: this.idfacture } });
                }else{
                    this.router.navigate(['gestock/factureFournisseur'], { queryParams: { idfacture: this.idfacture } });
                }
        }
        if (this.idcreance!=null) {
                this.router.navigate(['gestock/creance'], { queryParams: { idcreance: this.idcreance } });
        }
    }
}
