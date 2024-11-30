import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {Component, OnInit} from "@angular/core";
import {catchError, forkJoin, map, of} from "rxjs";
import {Facture, Magasin, Produit, TransfertStock} from "../../../store/entities/gestock.entity";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {ClientService} from "../../../store/services/gestock-service/Client.service";
import {TransfertService} from "../../../store/services/gestock-service/Transfert.service";
import {LigneMagasinService} from "../../../store/services/gestock-service/LigneMagasin.service";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../../store/services/gestock-service/Produit.service";
import {NgForm} from "@angular/forms";
import {Table} from "primeng/table";


@Component({
    templateUrl: './transfert_stock.component.html',
    styleUrls: ['./transfert.component.scss']
})
export class Transfert_stockComponent implements OnInit {
    items?: MenuItem[];
    steps?: MenuItem[];
    selectedItem: any = null;
    cols: any[] = [];
    transferts: TransfertStock[] = [];
    magasins: Magasin[] = [];
    magasinSourceSelected?: Magasin|null;
    magasinDestinationSelected?: Magasin|null;
    produits: Produit[] = [];
    currentdate: Date = new Date();
    transfert: TransfertStock = {};
    transfertselected: TransfertStock = {};
    id: number | undefined;
    droits: any;
    articleOptions: Produit[] = [];
    TransfertRequest: {
        sourceId: number,
        produitId: any,
        sourceQ: number,
        destQ: number,
        destinationId: any,
        quantite: number
    }[] = [];
    previousMagasinSource: any = null;
    previousMagasinDestination: any = null;
    errorMessage: any ;
    createOrModify: boolean = false;
    isSecondaryActive = false;
    loading: boolean = true;
    chrgmt: boolean = false;

    constructor(private messageService: MessageService,
                private tokenStorage: TokenStorage,
                private confirmationService: ConfirmationService,
                private clientService: ClientService, private magasinService: MagasinService, private produitService: ProduitService,
                private transfertService: TransfertService,
                private ligneMagasinService:LigneMagasinService,
    ) {
    }

    ngOnInit() {
        this.droits = this.tokenStorage.getdroits();
        this.loadData();
        this.resetForm()
    }
    async loadData() {
        const [allData] = await Promise.all([
            this.loadall().toPromise()
        ]);
        this.transferts = allData!.transferts;
        this.articleOptions = allData!.articleOptions;
        this.magasins = allData!.magasins;
        this.loading = false;
        console.log(this.transferts)
    }

    onRowSelect(transfertStock: TransfertStock) {
        this.transfertselected = transfertStock;
        this.isSecondaryActive = true;
    }

    close(){
        this.isSecondaryActive = false;
    }

    loadall() {
        const society = JSON.parse(this.tokenStorage.getsociety()!);
        const clients$ = this.clientService.findbysociety(society);
        const transferts$ = this.transfertService.findbysociety(society);
        const articleOptions$ = this.produitService.findbysociety(society);
        const magasins$ = this.magasinService.findbysociety(society);

        return forkJoin({
            transferts: transferts$,
            articleOptions: articleOptions$,
            magasins: magasins$
        }).pipe(
            map((results: any) => ({
                articleOptions: results.articleOptions.payload,
                transferts: results.transferts.payload,
                magasins: results.magasins.payload
            }))
        );
    }
    onArticleChange(event: any, index: number) {
        const selectedArticle = this.TransfertRequest[index].produitId;
        const duplicateIndex = this.TransfertRequest.findIndex((item, i) => item.produitId === selectedArticle && i !== index);

        if (duplicateIndex !== -1) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Vous ne pouvez pas sélectionner le même article sur plusieurs lignes.'
            });
            this.TransfertRequest[index].produitId = null; // Reset the selected article
        }else{
            const selectedArticle = this.articleOptions.find(article => article.id === event.value);
            this.loadStockDetails(selectedArticle?.id!, index)
        }
    }

    resetForm() {
        this.transfert = {};
        this.magasinSourceSelected = undefined;
        this.magasinDestinationSelected = undefined;
        this.currentdate = new Date();
        this.TransfertRequest = [{produitId: null, quantite: 1, destQ: 0, sourceQ: 0, sourceId: 0, destinationId: 0 }];
    }

    loadStockDetails(produitId: number, index: number) {
        this.TransfertRequest[index].sourceQ = 0;
        this.TransfertRequest[index].destQ = 0;
        this.TransfertRequest[index].sourceId = this.magasinSourceSelected?.id!;
        this.TransfertRequest[index].destinationId = this.magasinDestinationSelected?.id!;
        this.ligneMagasinService.findByProductAndMagasin(produitId, this.magasinSourceSelected?.id!).pipe(
            catchError(error => {
                // Gestion de l'erreur, retour d'une réponse vide
                console.error('Erreur lors de la récupération du stock source:', error);
                return of({ payload: { stock_physique_dispo: 0 } }); // ou une autre valeur par défaut
            })
        ).subscribe(res => {
            if (res.payload.stock_physique_dispo != null) {
                this.TransfertRequest[index].sourceQ = res.payload.stock_physique_dispo;
            }
        });

        this.ligneMagasinService.findByProductAndMagasin(produitId, this.magasinDestinationSelected?.id!).pipe(
            catchError(error => {
                // Gestion de l'erreur, retour d'une réponse vide
                console.error('Erreur lors de la récupération du stock destination:', error);
                return of({ payload: { stock_physique_dispo: 0 } }); // ou une autre valeur par défaut
            })
        ).subscribe(res => {
            if (res.payload.stock_physique_dispo != null) {
                this.TransfertRequest[index].destQ = res.payload.stock_physique_dispo;
            } else {
                this.TransfertRequest[index].destQ = 0;
            }
            console.log(this.TransfertRequest);
        });
    }

    retour() {
        this.createOrModify = false;
    }
    deleteElement(transfertStock: TransfertStock) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler le transfert ?',
            accept: () => {
                if (transfertStock === null) {
                    return;
                } else {
                    if (transfertStock.id != null) {
                        this.chrgmt = true;
                        this.transfertService.delete(transfertStock.id).subscribe(
                            () => {
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                this.loadData().then(() => {
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

    getProduitNoms(transfert: TransfertStock): string {
        if (!transfert.transferts || transfert.transferts.length === 0) {
            return '';
        }
        return transfert.transferts.map(t => t.produitNom).join(', ');
    }

    async createModify(transfertStock: TransfertStock) {
        this.chrgmt = true;
        console.log(transfertStock)
        console.log(this.magasins)
        try {
            if (transfertStock.id) {

                this.transfert = transfertStock;
                // @ts-ignore
                this.magasinSourceSelected = this.magasins.find(mag=>mag.nom === this.transfert.transferts[0].sourceNom);
                // @ts-ignore
                this.magasinDestinationSelected = this.magasins.find(mag=>mag.nom === this.transfert.transferts[0].destinationNom);
                this.previousMagasinSource = this.magasinSourceSelected
                this.previousMagasinDestination = this.magasinDestinationSelected
                let count = 0;
                this.transfert.transferts?.forEach(val=>{
                    this.TransfertRequest[count].produitId = val.produitId;
                    if (val.quantite != null) {
                        this.TransfertRequest[count].quantite = val.quantite;
                    }
                    const selectedArticle = this.articleOptions.find(article => article.id === val.produitId);
                    this.loadStockDetails(selectedArticle?.id!, count)
                    count ++;

                })

                // Convertir bon.date_commande en Date
                if (Array.isArray(transfertStock.dateTransfert) && transfertStock.dateTransfert.length >= 5) {
                    this.currentdate = new Date(
                        transfertStock.dateTransfert[0],      // Année
                        transfertStock.dateTransfert[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                        transfertStock.dateTransfert[2],      // Jour
                        transfertStock.dateTransfert[3],      // Heure
                        transfertStock.dateTransfert[4]       // Minute
                    );
                }

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

    ajouterLigne() {
        this.TransfertRequest.push({produitId: 0, quantite: 1, destQ: 0, sourceQ: 0, sourceId: 0, destinationId: 0 });
    }
    onSubmit(form: NgForm) {
        if (this.isFormInvalid()) {
            // Ajoutez un message ou une notification pour indiquer que le formulaire est invalide
            return;
        }

        this.transfert.transferts = this.TransfertRequest;
        this.transfert.dateTransfert = this.currentdate;
        this.transfert.societyId = JSON.parse(this.tokenStorage.getsociety()!);

        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer un nouveau transfert de stock ?',
            accept: () => {
                if (this.transfert?.id) {
                    let id = this.transfert.id;
                    this.chrgmt = true;
                    this.transfertService.update(this.transfert).subscribe(
                        () => {
                            this.loadData().then(() => {
                                this.resetForm();
                                // @ts-ignore
                                this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                            });
                        },
                        () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                    );
                } else {
                    this.chrgmt = true;
                    this.transfertService.save(this.transfert).subscribe(
                        () => {
                            this.loadData().then(() => {
                                // @ts-ignore
                                this.chrgmt = false;
                                this.showMessage('success', 'Succès', 'Le transfert a été enregistré.');
                                this.createOrModify = false;
                                this.isSecondaryActive = false;
                                this.showMessage('success', 'Succès', 'Le transfert a été enregistré.');
                                this.resetForm();
                            });
                        },
                        (error) => {
                            console.error('Erreur lors de l\'enregistrement du transfert :', error);
                            this.showMessage('error', 'Erreur', 'Erreur lors de l\'enregistrement du transfert.');
                        }
                    );
                }
            }
        });
    }

    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({
            severity: severity,
            summary: summary,
            detail: detail
        });
    }

    isFormInvalid(): boolean {
        // Vérifier si les magasins source et destination sont sélectionnés
        if (!this.magasinSourceSelected || !this.magasinDestinationSelected) {
            return true;
        }

        // Vérifier que chaque ligne a un article sélectionné et une quantité valide
        for (let transfert of this.TransfertRequest) {
            if (!transfert.produitId || transfert.quantite <= 0 || transfert.quantite > transfert.sourceQ) {
                return true;
            }
        }

        return false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    actualiseQuantity(event: any, i: number) {
        this.TransfertRequest[i].quantite = event.value;
    }

    checkReset(type: string, event: any) {
        const hasFilledLines = this.TransfertRequest.some(item => item.produitId && item.quantite > 0);

        if (type === 'source') {
            if (this.magasinSourceSelected && this.magasinSourceSelected === this.magasinDestinationSelected) {
                this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Le magasin source et le magasin de destination ne peuvent pas être les mêmes.'});
                this.magasinSourceSelected = this.previousMagasinSource;
                return;
            }
        } else if (type === 'destination') {
            if (this.magasinDestinationSelected && this.magasinDestinationSelected === this.magasinSourceSelected) {
                this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Le magasin de destination et le magasin source ne peuvent pas être les mêmes.'});
                this.magasinDestinationSelected = this.previousMagasinDestination;
                return;
            }
        }

        if (hasFilledLines) {
            this.confirmationService.confirm({
                message: 'Changer le magasin va réinitialiser les lignes. Voulez-vous continuer?',
                accept: () => {
                    if (type === 'source') {
                        this.previousMagasinSource = this.magasinSourceSelected;
                    } else if (type === 'destination') {
                        this.previousMagasinDestination = this.magasinDestinationSelected;
                    }
                    this.resetForm() // Reset the lines
                },
                reject: () => {
                    if (type === 'source') {
                        this.magasinSourceSelected = this.previousMagasinSource;
                    } else if (type === 'destination') {
                        this.magasinDestinationSelected = this.previousMagasinDestination;
                    }
                }
            });
        } else {
            if (type === 'source') {
                this.previousMagasinSource = this.magasinSourceSelected;
            } else if (type === 'destination') {
                this.previousMagasinDestination = this.magasinDestinationSelected;
            }
        }
    }
    supprimerLigne(index: number) {
        if (this.TransfertRequest.length > 1) {
            this.TransfertRequest.splice(index, 1);
        }
    }

}
