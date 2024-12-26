import {Component, OnInit} from '@angular/core';
import {ConfirmationService, Message, MessageService} from "primeng/api";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {FournisseurService} from "../../../store/services/gestock-service/Fournisseur.service";
import {
    Fournisseur,
    Creance,
    Facture,
    PaiementFactureDTO,
    PayerFacturesRequestDTO, PaymentRequest,
    Recu, Societe
} from "../../../store/entities/gestock.entity";
import {ActivatedRoute, Router} from "@angular/router";
import {formatDate} from "@angular/common";
import {FactureService} from "../../../store/services/gestock-service/Facture.service";
import {Mode_paiement, Type_caisse} from "../../../store/enum/enums";
import {RecuService} from "../../../store/services/gestock-service/Recu.service";
import {CreanceService} from "../../../store/services/gestock-service/etats-gest-service/Creance.service";
import {switchMap} from "rxjs";
import {PaiementService} from "../../../store/services/gestock-service/Paiement.service";
import {SocieteService} from "../../../store/services/gestock-service/Societe.service";
import {Table} from "primeng/table";

@Component({
    selector: 'app-versements-facture',
    templateUrl: './versements-facture.component.html',
    styleUrls: ['./versements-facture.component.scss']
})
export class VersementsFactureComponent implements OnInit {
    fournisseur?: Fournisseur;

    errorMessage: string = '';
    createOrModify: boolean = false;

    fournisseurs: Fournisseur[] = [];
    factures: Facture[] = [];
    creances: Creance[] = [];
    selectedCreance: any = {};
    paiement: any = {};
    id: any;
    newBonCommandeNumber: any;
    factureSelected: any = {};
    confirm: boolean = false;
    paiements: PaiementFactureDTO[] = [];
    paiementsfiltered: PaiementFactureDTO[] = [];
    Paiement: PayerFacturesRequestDTO = <PayerFacturesRequestDTO>{};
    recu: Recu = <Recu>{};
    droits: any;
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    type_encaissement = Object.keys(Type_caisse)
        .map(key => {
            // @ts-ignore
            return ({label: Type_caisse[key], value: Type_caisse[key]});
        });
    date: Date = new Date();
    messages: Message[] | undefined;
    loading: boolean = false;
    inaccesible: boolean = true;
    fournisseurselection: boolean = false;
    isSecondaryActive = false;
    facturetoWach: Facture = <Facture>{};
    facturestoWach: Facture[] = [];
    creancestoWach: Creance[] = [];
    creancetoWach: Creance = <Creance>{};
    updateboolean: boolean = false;
    idFacture: any;
    idCreance: any;
    chrgmt: boolean = false;
    selectedInvoices: { [id: number]: number } = {};
    selectedCreances: { [id: number]: number } = {};
    totalAmount: number = 0;
    totalAmountCreance: number = 0;
    paymentType: string = 'facture';
    totalReste: number = 0;
    errors: { [invoiceId: number]: string } = {};
    montantTotal: number = 0;
    societyId: any;
    societegetted: Societe = {};
    modifypaiement: boolean = false;
    paiementSelected: any = {};

    constructor(
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        private confirmationService: ConfirmationService,
        private fournisseurService: FournisseurService,
        private factureService: FactureService,
        private paymentService: PaiementService,
        protected router: Router,
        protected societeService: SocieteService,
        protected recuService: RecuService,
        private creanceService: CreanceService,
        private aroute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.droits = this.tokenStorage.getdroits();
            this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.loadFournisseurs();
            this.loadVersements();

            const societePromise = this.societeService.findOne(this.societyId).toPromise();

            this.aroute.queryParams.pipe(
                switchMap(async (params) => {
                    if (params['idfacture'] != null) {
                        await this.loadFacture(params['idfacture']);
                    }

                    if(params['idfacture']==undefined){
                        this.createOrModify = false
                    }
                })
            ).subscribe();

            const societe = await societePromise;
            console.log(societe);
            this.societegetted = societe!.payload;

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }

    async loadFacture(idfacture: string): Promise<void> {
        try {
            const facture = await this.factureService.findOne(Number(idfacture)).toPromise();
            this.factureSelected = facture!.payload;
            this.paymentType = "facture";
            this.onFactureSelected();
            this.fournisseur = this.fournisseurs.find(frs => frs.id == this.factureSelected.fournisseurId);
            this.updateboolean = true;
            this.modifypaiement = true;
            this.selectedCreance = undefined
            this.idFacture = idfacture;
            this.fournisseurselection = true;
            this.createOrModify = true;
            if (facture!.payload.reste != null) {
                this.recu.montant = facture!.payload.reste;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de la facture :", error);
        }
    }

    loadFournisseurs(){
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );
    }

    customizeBonCommandeNumber() {
        const customNumber = prompt('Initialiser le numéro à :');
        if (customNumber) {
            const prefix = this.newBonCommandeNumber.substring(0, this.newBonCommandeNumber.lastIndexOf('-') + 1);
            this.newBonCommandeNumber = `${prefix}${customNumber}`;
        }
    }
    onAmountChange(factureId: number, event: any): void {
        const inputAmount = event.value;
        const facture = this.factures.find(f => f.id === factureId);
        if (facture) {
            if (inputAmount > facture.reste!) {
                // Si le montant saisi dépasse le reste, afficher un message d'erreur
                this.errors[factureId] = 'Le montant saisi dépasse le reste de la facture.';
                this.selectedInvoices[factureId] = facture.reste!;
            } else {
                // Sinon, effacer le message d'erreur
                delete this.errors[factureId];
                this.selectedInvoices[factureId] = inputAmount;
            }
            this.calculateTotalAmount();
        }
    }

    onAmountChangeCreance(creanceId: number, event: any): void {
        const inputAmount = event.value;
        const creance = this.creances.find(f => f.id === creanceId);
        if (creance) {
            if (inputAmount > creance.montant_restant_a_payer!) {
                // Si le montant saisi dépasse le reste, afficher un message d'erreur
                this.errors[creanceId] = 'Le montant saisi dépasse le reste de la creance.';
                this.selectedCreances[creanceId] = creance.montant_restant_a_payer!;
            } else {
                // Sinon, effacer le message d'erreur
                delete this.errors[creanceId];
                this.selectedCreances[creanceId] = inputAmount;
            }
            this.calculateTotalAmountCreance();
        }
    }

    payRemaining(facture: Facture): void {
        this.selectedInvoices[facture.id!] = facture.reste!;
        this.calculateTotalAmount();
    }

    payRemainingCreance(creance: Creance): void {
        this.selectedCreances[creance.id!] = creance.montant_restant_a_payer!;
        this.calculateTotalAmountCreance();
    }

    calculateTotalAmount(): void {
        this.totalAmount = Object.values(this.selectedInvoices).reduce((a, b) => a + b, 0);
    }

    calculateTotalAmountCreance(): void {
        this.totalAmountCreance = Object.values(this.selectedCreances).reduce((a, b) => a + b, 0);
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

    cleanSelectedInvoices(): void {
        this.selectedInvoices = Object.fromEntries(
            Object.entries(this.selectedInvoices).filter(([key, value]) => value > 0)
        );
    }

    makePayment(): void {
        this.cleanSelectedInvoices();

        const paymentRequest: PaymentRequest = {
            invoicePayments: this.paymentType === 'facture' ? this.selectedInvoices : this.selectedCreances,
            totalAmount: this.paymentType === 'facture' ? this.totalAmount : this.totalAmountCreance,
            type: this.paymentType + 'fournisseur',
            modePaiement: this.paiement.modePaiement,
            numeroPaiement: this.newBonCommandeNumber,
            lastNumber: this.newBonCommandeNumber.split('-').pop()!,
            societeid: JSON.parse(this.tokenStorage.getsociety()!),
            chequevalue: this.paiement.numeroCheque
        };
        console.log(paymentRequest)
        console.log(this.paiement)

        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer ce paiement?',
            accept: () => {
                this.chrgmt = true; // Affiche le spinner
                let id = this.paiement.id;
                if (this.paiement.id) {
                    // @ts-ignore
                    this.paymentService.updatePayment(this.paiement.id, paymentRequest).subscribe(
                        (payment) => {
                            console.log(payment)
                            this.loadVersements().then(()=>{
                                this.paiementSelected = this.paiements.find(paiement=>paiement.id == id)
                                this.showMessage('success', 'Enregistrement', 'Paiement modifié avec succès !');
                                this.createOrModify = false;
                                this.fournisseur = undefined
                                this.paiement = {}
                                this.chrgmt = false;
                            });
                            // Gérer la réponse de succès
                        },
                        (error) => {
                            // Gérer l'erreur
                        }
                    );
                } else {
                    // @ts-ignore
                    this.paymentService.createPayment(paymentRequest).subscribe(
                        (payment) => {
                            // Gérer la réponse de succès
                            console.log(payment)
                            this.loadVersements().then(()=>{
                                this.showMessage('success', 'Enregistrement', 'Paiement effectué avec succès !');
                                this.createOrModify = false;
                                this.isSecondaryActive = false
                                this.fournisseur = undefined
                                this.paiement = {}
                                this.chrgmt = false;
                            });
                        },
                        (error) => {
                            // Gérer l'erreur
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

    private loadVersements(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.recuService.getversements(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
                (paiements) => {
                    console.log(paiements.payload);

                    this.paiements = paiements.payload;
                    this.paiementsfiltered = this.paiements;

                    // Obtenez le dernier numéro de paiement
                    let lastCommandNumber = '00000';  // valeur par défaut
                    if (this.paiements.length > 0 && this.paiements[0].lastNumber != null) {
                        lastCommandNumber = this.paiements[0].lastNumber;
                    }
                    console.log(lastCommandNumber);

                    // Générer le nouveau numéro de bon de commande
                    // @ts-ignore
                    this.newBonCommandeNumber = this.generateBonCommandeNumber(lastCommandNumber);

                    resolve(); // résoudre la promesse une fois les paiements chargés
                },
                (error) => {
                    reject(error); // rejeter la promesse en cas d'erreur
                }
            );
        });
    }


    onRowSelect(paiement: PaiementFactureDTO) {
        // @ts-ignore
        this.facturetoWach = undefined
        // @ts-ignore
        this.creancetoWach = undefined
        this.paiementSelected = paiement
        this.isSecondaryActive = true;
        this.facturestoWach = [];
        this.creancestoWach = [];
        this.montantTotal = 0;
        if(this.paiementSelected.type === 'facturefournisseur'){

            for (const factureId in paiement.invoicePayments) {
                if (paiement.invoicePayments.hasOwnProperty(factureId)) {
                    const amount = paiement.invoicePayments[factureId];

                    this.factureService.findOne(Number(factureId)).subscribe(facture=>{
                        console.log(`Facture ID: ${factureId}, Amount: ${amount}`);
                        this.facturetoWach = facture.payload
                        this.facturestoWach.push(this.facturetoWach)
                        this.montantTotal = this.facturestoWach.reduce((total, facture) => total + facture.montant_total!, 0);
                        console.log(this.facturestoWach)
                    })
                }
            }

        }
    }

    deleteRecu(paiementFactureDTO: PaiementFactureDTO) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler le paiement?',
            accept: () => {
                if (paiementFactureDTO === null) {
                    return;
                } else {

                    if (paiementFactureDTO.id != null) {
                        this.chrgmt = true;
                        this.paymentService.deletePayment(this.paiement.id!, this.paiement.type).subscribe(
                            () => {
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                this.isSecondaryActive = false;
                                this.loadVersements();
                                this.chrgmt = false;
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression car déja utilisé!')
                        );
                    }
                }
            }
        });
    }

    createModify(value: any) {
        if (value!=null){
            this.paiement = value;

            if(this.paiement.type == "facturefournisseur"){
                this.paymentType = "facture"
                this.fournisseur = this.fournisseurs.find(cli=>cli.id == this.facturestoWach[0].fournisseurId)
                console.log(this.fournisseur)
                this.selectedInvoices = this.paiement.invoicePayments
                this.modifypaiement = true;
                this.onFactureSelectedModify()
            }
        }else{
            this.fournisseur = undefined
            this.createOrModify = false;
            this.fournisseurselection = false;
            this.updateboolean = false;
            this.selectedInvoices = {};
            this.selectedCreances = {};
        }
        this.createOrModify = true;
    }

    retour() {
        if (this.idFacture!=null){
            this.router.navigate(['gestock/factureFournisseur'], { queryParams: { idfacture: this.factureSelected?.id } });
        }

        if(this.idFacture == null){
            this.paiement = {}
            this.fournisseur = undefined
            this.createOrModify = false;
            this.fournisseurselection = false;
            this.inaccesible = true;
        }
    }

    viewFacture(id: number) {
        this.router.navigate(['gestock/factureFournisseur'], { queryParams: { idtowatch:id } });
    }

    onFactureSelected() {
        this.chrgmt = true;
        console.log(this.fournisseur)
        setTimeout(() => {
            this.factureService.findbyfrs(this.fournisseur?.id!).subscribe(value => {
                this.factures = value.payload;
                this.totalReste = this.factures.reduce((total, facture) => {
                    return total + (facture.reste || 0);
                }, 0);
                this.calculateTotalAmount()
                this.fournisseurselection = true
            })
            this.chrgmt = false;
        }, 650);
    }

    onFactureSelectedModify() {
        this.chrgmt = true;
        setTimeout(() => {
            this.factureService.findbyfrs(this.fournisseur?.id!).subscribe(value => {
                this.factures = value.payload;
                console.log(this.factures)
                console.log(this.facturestoWach)

                if(this.factures.length===0){
                    this.facturestoWach.forEach(fact=>{
                        fact.reste! += this.selectedInvoices[fact.id!] || 0;
                        this.factures.push(fact)
                    })
                }
                else{
                    // Mettre à jour les factures
                    this.factures.forEach(facture => {
                        // Trouver la facture correspondante dans facturestoWach
                        let factureToWatch = this.facturestoWach.find(f => f.id === facture.id);

                        // Si une facture correspondante est trouvée, mettre à jour la propriété 'reste'
                        if (factureToWatch!=null) {
                            facture.reste! += this.selectedInvoices[facture.id!] || 0;
                        }
                    });
                }
                // Mettre à jour les factures
                this.facturestoWach.forEach(facture => {
                    // Trouver la facture correspondante dans facturestoWach
                    let factureToWatch = this.factures.find(f => f.id === facture.id);

                    // Si une facture correspondante est trouvée, mettre à jour la propriété 'reste'
                    if (factureToWatch==null) {
                        facture.reste! += this.selectedInvoices[facture.id!] || 0;
                        this.factures.push(facture)
                    }
                });

                // Si nécessaire, vous pouvez afficher ou utiliser les factures mises à jour ici
                console.log("Factures mises à jour : ", this.factures);

                this.totalReste = this.factures.reduce((total, facture) => {
                    return total + (facture.reste || 0);
                }, 0);
                this.calculateTotalAmount()
                this.factureSelected = undefined
                this.fournisseurselection = true
            })
            this.chrgmt = false;
        }, 650);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    close(){
        this.isSecondaryActive = false;
    }
}
