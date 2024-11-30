import {Component, OnInit} from '@angular/core';
import {Entree_stock, FactureEntree, Fournisseur, Magasin, Produit} from "../../../../store/entities/gestock.entity";
import {ConfirmationService, ConfirmEventType, MenuItem, MessageService} from "primeng/api";
import {Entree_stockService} from "../../../../store/services/gestock-service/Entree_stock.service";
import {FournisseurService} from "../../../../store/services/gestock-service/Fournisseur.service";
import {MagasinService} from "../../../../store/services/gestock-service/Magasin.service";
import {Table} from "primeng/table";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {Mode_paiement, Mouvement} from "../../../../store/enum/enums";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import { v4 as uuidv4 } from 'uuid';
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {AuthService} from "../../../../store/services/gestock-service/Auth.service";

@Component({
    templateUrl: './entree_stock.component.html'
})
export class Entree_stockComponent implements OnInit {
    items?: MenuItem[];
    selectedItem: any = null;
    cols: any[] = [];
    modifyproduit?: boolean;
    entree_stock: Entree_stock | null = {};
    list_entrees_stock: Entree_stock[] = [];
    list_of_product: Produit [] = [];
    fournisseurs: Fournisseur[] = [];
    magasins: Magasin[] = [];
    fournisseurselected?: Fournisseur;
    magasinselected?: Magasin;
    produits: Produit[] = [];
    produitselected?: Produit | null;
    facture?: FactureEntree = {};
    total: number = 0;
    dette= 'dette';
    paye= "payé";
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    totalverse: number = 0;
    currentdate: Date = new Date();
    magasinTotalProduit: number | undefined = 0;
    droits: any;
    produitsOfVerification: Produit[] = [];
    constructor(private messageService: MessageService,
                private tokenStorage: TokenStorage,
                private confirmationService: ConfirmationService, private entreeStockService: Entree_stockService,
                private fournisseurService: FournisseurService, private magasinService: MagasinService, private produitService: ProduitService,
                protected authService: AuthService,

                private factureService: FactureService) {
    }

    ngOnInit() {
        this.droits = this.tokenStorage.getdroits();
        this.loadall();
        this.loadItems();
    }

    loadall() {
        this.currentdate = new Date();

        this.facture = {};
        this.facture.numero = uuidv4();

        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );

        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );

        this.produitService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.produits = res.payload;
            }
        );
    }

    loadItems() {
        this.items = [{
            label: 'Options',
            items: [
                {
                    label: 'Delete',
                    icon: 'pi pi-times',
                    command: ($event) => {
                        this.DeleteEntree(this.selectedItem);
                    }
                },
                {
                    label: 'Update',
                    icon: 'pi pi-pencil',
                    command: ($event) => {
                        this.SeeEntreeDetails(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    actualiseTotal() {
        if (this.entree_stock)
            if (this.entree_stock?.produitPrix && this.entree_stock.quantite) {
                this.total = 0;
                this.totalverse = 0;
                this.total = this.total + (this.entree_stock.quantite * this.entree_stock?.produitPrix);
                this.totalverse = this.totalverse + this.total;
            }
    }
 actualiseTotal1(event:any) {
        if (this.entree_stock)
            if (this.entree_stock?.produitPrix ) {
                this.total = 0;
                this.totalverse = 0;
                this.total = this.total + (event.value * this.entree_stock?.produitPrix);
                this.totalverse = this.totalverse + this.total;
            }
    }
actualiseTotal2(event:any) {
        if (this.entree_stock)
            if (this.entree_stock?.quantite ) {
                this.total = 0;
                this.totalverse = 0;
                this.total = this.total + (event.value * this.entree_stock?.quantite);
                this.totalverse = this.totalverse + this.total;
            }
    }

    async actualiseProducts(produitSelect: Produit) {
        try {
            let prod;
            const result = await this.produitService.getProductOfmagasin(this.magasinselected?.id!, JSON.parse(this.tokenStorage.getsociety()!)).toPromise();
            // Handle the result here
            this.produitsOfVerification = result?.payload;
            prod = this.produitsOfVerification.find(prod =>prod.id === produitSelect.id)
            if(prod!=undefined && this.produitselected!=null){
                this.produitselected.ligneMagasinDTOS = prod.ligneMagasinDTOS
                    this.produitselected.ligneMagasinDTOS?.forEach(lignes=>{
                        if(lignes.magasinNom===this.magasinselected?.nom){
                            this.magasinTotalProduit = lignes.stockActuel;
                        }
                    })
            }else{
                this.magasinTotalProduit = 0;
            }
        } catch (error) {
            // Handle errors here
            console.error(error);
        }
    }

    addentree() {

        if(this.totalverse<=this.total){
            this.modifyproduit = false;

            if (this.entree_stock && this.produitselected && this.magasinselected && this.fournisseurselected && this.facture) {
                this.entree_stock.date_entree = this.currentdate;
                this.entree_stock.produitNom = this.produitselected.nom;
                this.entree_stock.produitId = this.produitselected.id;
                this.entree_stock.fournisseurNom = this.fournisseurselected.nom
                this.entree_stock.fournisseurId = this.fournisseurselected.id
                this.entree_stock.magasinNom = this.magasinselected.nom
                this.entree_stock.magasinId = this.magasinselected.id;
                //this.entree_stock.numerofacture = this.facture.numero;
                //this.entree_stock.produitPrix = this.produitselected.prix;
                this.entree_stock.totalentree = this.total;
              //  this.entree_stock.paiement = this.totalverse;
            }

            this.list_entrees_stock.forEach(s => {
                if (this.entree_stock)
                    if (s.produitNom === this.entree_stock.produitNom && s.fournisseurNom === this.entree_stock.fournisseurNom && s.magasinNom === this.entree_stock.magasinNom ) {
                        this.list_entrees_stock = this.list_entrees_stock.filter(find => find.produitNom !== s.produitNom);
                        this.list_entrees_stock.push(this.entree_stock);
                        this.list_entrees_stock = this.list_entrees_stock.concat();
                        this.entree_stock = {};
                        this.produitselected = undefined;
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Success',
                            detail: 'Les références de l\'entrée ont été modifiés dans la liste'
                        });
                        this.modifyproduit = true;
                    }
            })

            if (!this.modifyproduit) {
                if (this.entree_stock) {
                    this.list_entrees_stock.push(this.entree_stock);
                    this.list_entrees_stock = this.list_entrees_stock.concat();
                    this.entree_stock = {};
                    this.produitselected = undefined;
                    this.list_of_product = [];
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Success',
                        detail: 'L\'entrée de produit à été ajouter a la liste'
                    });
                }
            }
        } else{
            this.messageService.add({
                severity: 'warn',
                summary: 'Annuler',
                detail: 'Le montant versé doit etre inferieur au total général'
            });
        }

    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    DeleteEntree(selectedItem: any) {
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment supprimer ces entrées?',
            accept: () => {
                this.list_entrees_stock.forEach(s => {
                    if (s.produitNom === selectedItem.produitNom) {
                        this.list_entrees_stock = this.list_entrees_stock.filter(find => find.produitNom !== s.produitNom);
                    }
                })
                this.messageService.add({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'Opération de suppression effectuée avec success'
                });
            },
        });
    }

    UpdateEntreecontent(selectedItem: any) {
        this.entree_stock = selectedItem;
        this.produits.find(produit => {
            if (produit.nom == this.entree_stock?.produitNom) {
                this.produitselected = produit;
                this.list_of_product.push(this.produitselected);
            }
        })
    }

    Clearcontent(event: any) {
        if (event.value == null) {
            //console.log("null")
        } else {
            if(this.produitselected!=null){
                this.SelectProduct();
            }
        }
    }

    Clearcontenu() {
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment vider tout votre contenu?',
            accept: () => {
                this.magasinselected = undefined;
                this.fournisseurselected = undefined;
                this.list_entrees_stock = [];
                this.list_of_product = [];
                this.Clearproductinformation();
            },
            reject: (type: any) => {
                switch (type) {
                    case ConfirmEventType.REJECT:
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Rejeter',
                            detail: 'Vous avez rejeter l\'operation'
                        });
                        break;
                    case ConfirmEventType.CANCEL:
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Annuler',
                            detail: 'Vous avez annuler l\'opération'
                        });
                        break;
                }
            }
        });
    }

    Clearproductinformation() {
        this.entree_stock = {};
        this.produitselected = undefined;
    }

    SelectProduct() {
        this.list_of_product = [];
        this.total = 0;
        this.totalverse = 0;
        if (this.produitselected && this.entree_stock) {
            this.list_of_product.push(this.produitselected);
            // @ts-ignore
            this.entree_stock.produitPrix = this.produitselected.prixttc
            this.magasinTotalProduit = 0;
            this.entree_stock.quantite = 0;
            this.actualiseProducts(this.produitselected);
            this.actualiseTotal();
            // @ts-ignore
        }
    }

    SeeEntreeDetails(selectedItem: any) {
        this.entree_stock = selectedItem;
    }

    saveEntrees() {
        if(this.magasinselected && this.fournisseurselected){

            this.list_entrees_stock.forEach(list=>{
                // @ts-ignore
                //list.magasinId = this.magasinselected.id;
                list.societyId =JSON.parse(this.tokenStorage.getsociety()!);
                // @ts-ignore
                //list.magasinNom = this.magasinselected.nom;
                // @ts-ignore
                //list.fournisseurId = this.fournisseurselected.id;
                // @ts-ignore
                //list.fournisseurNom = this.fournisseurselected.nom;
            });


            /*this.facture.mouvement = Mouvement.ENTREE;
            this.facture.listEntrees = this.list_entrees_stock;
            this.facture.magasinId = this.magasinselected.id;
            this.facture.magasinNom = this.magasinselected.nom;
            this.facture.fournisseurId = this.fournisseurselected.id;
            this.facture.fournisseurNom = this.fournisseurselected.nom;*/
            this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer ces entrées?',
            accept: () => {
                if(this.entree_stock){
                    this.entreeStockService.saveListofEntrees(this.list_entrees_stock).subscribe({
                        next: value => {
                            this.loadall();
                            this.hideAll();
                            this.messageService.add({
                                severity: 'info',
                                summary: 'Success',
                                detail: 'Enregistrement reussit avec succès'
                            });
                        },
                        error: err => {
                            if (err.status == 500) {
                                this.loadall();
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Rejeter',
                                    detail: 'Echec de connexion au serveur, veuillez reesayer ultérieurement'
                                });
                            } else {
                                this.loadall();
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Echec',
                                    detail: 'Veuillez contacter votre administrateur'
                                });
                            }
                        }
                    });
                }
            },
        });
        }
    }

    // @ts-ignore
    getSeverity(status: string): string {
        switch (status) {
            case 'dette':
                return 'danger';

            case 'payé':
                return 'success';
        }
    }

    hideAll() {
        this.magasinselected = undefined;
        this.fournisseurselected = undefined;
        this.list_entrees_stock = [];
        this.list_of_product = [];
        this.Clearproductinformation();
    }
}
