import {Component, OnInit} from '@angular/core';
import {
    Sortie_stock,
    Client,
    Magasin,
    Produit,
    Entree_stock,
    Recu,
    FactureSortie, Taxe, Facture
} from "../../../../store/entities/gestock.entity";
import {ConfirmationService, ConfirmEventType, MenuItem, MessageService} from "primeng/api";
import {Sortie_stockService} from "../../../../store/services/gestock-service/Sortie_stock.service";
import {ClientService} from "../../../../store/services/gestock-service/Client.service";
import {MagasinService} from "../../../../store/services/gestock-service/Magasin.service";
import {Table} from "primeng/table";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {Mode_paiement, Mouvement} from "../../../../store/enum/enums";
import {Entree_stockService} from "../../../../store/services/gestock-service/Entree_stock.service";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import {ActivatedRoute} from "@angular/router";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {AuthService} from "../../../../store/services/gestock-service/Auth.service";
import {TaxeService} from "../../../../store/services/gestock-service/Taxe.service";

@Component({
    templateUrl: './sortie_stock.component.html'
})
export class Sortie_stockComponent{
 /*   items?: MenuItem[];
    steps?: MenuItem[];
    selectedItem: any = null;
    cols: any[] = [];
    modifyproduit?: boolean;
    sortie_stock: Sortie_stock | null = {};
    recu: Recu = <Recu>{};
    list_sorties_stock: Sortie_stock[] = [];
    list_of_product: Produit [] = [];
    clients: Client[] = [];
    magasins: Magasin[] = [];
    clientselected?: Client;
    magasinselected?: Magasin;
    magasinlivraisonselected?: Magasin;
    magasinSelected?: Magasin;
    produits: Produit[] = [];
    produitselected?: Produit | null;
    total: number = 0;
    dette = 'dette';
    paye = "payé";
    magasinTotalProduit: number = 0;
    taxes: Taxe[] = [];
    facture?: Facture = <Facture>{};
    initialise: number | undefined;
    selectedTaxe?: Taxe  |null;
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    totalverse: number = 0;
    currentdate: Date = new Date();
    check: number = 0;
    // checked?: boolean;
    entree_stock: Entree_stock | null = {};
    list_entrees_stock: Entree_stock[] = [];
    nonPermit: boolean = false;
    totalpayer: number = 0;
    id: number | undefined;
    droits: any;
    totalgeneral: number | undefined = 0;
    displayFacture: boolean = false;
    boolFacture: boolean = false;

    constructor(private messageService: MessageService,
                private aroute: ActivatedRoute,
                private taxeService: TaxeService,
                private tokenStorage: TokenStorage, private confirmationService2: ConfirmationService,
                private confirmationService: ConfirmationService, private sortieStockService: Sortie_stockService,
                private clientService: ClientService, private magasinService: MagasinService, private produitService: ProduitService, private entreeStockService: Entree_stockService,
                private factureService: FactureService, private authService: AuthService,
    ) {
    }

    ngOnInit() {
        this.droits = this.tokenStorage.getdroits();
        this.aroute.queryParams.subscribe((params) => {
            this.id = params['id'];
        });

        this.loadall();
        this.loadItems();
        this.checkValue();

        if (this.id != null) {
            this.factureService.findOne(this.id).subscribe(
                (res) => {
                    this.facture = res.payload;
                    this.totalgeneral = this.facture.montant_total;
                    // @ts-ignore
                    this.list_sorties_stock = res.payload.listSorties;
                    this.OnUpdateorDelete();
                    if (res.payload.createdDate && res.payload.magasinId != null && res.payload.clientId != null) {
                        this.currentdate = new Date(res.payload.createdDate);
                        this.magasinService.findOne(res.payload.magasinId).subscribe((params) => {
                            this.magasinlivraisonselected = params.payload;
                        })
                        this.clientService.findOne(res.payload.clientId).subscribe((params) => {
                            this.clientselected = params.payload;
                        })
                    }
                })
        }

        /!*this.check = false;
        this.checked = false;*!/

    }


    checkValue() {
        if (this.check == 0) {
            this.magasinSelected = undefined;
        } else {
            this.clientselected = undefined;
        }
    }

    /!*checkValue1(event: any) {
        if (event){
            this.checked = false;
            this.magasinSelected = undefined;
        } else {
            this.checked = true;
        }
        console.log(event);
    }*!/

    loadall() {
        this.currentdate = new Date();

        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
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

        this.taxeService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.taxes = res.payload;
                console.log(this.taxes)
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
                    disabled: !this.droits.includes('SUPPRIMER_SORTIE_STOCK'),
                    command: ($event) => {
                        this.DeleteSortie(this.selectedItem);
                    }
                },
                {
                    label: 'Update',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_SORTIE_STOCK'),
                    command: ($event) => {
                        this.SeeSortieDetails(this.selectedItem);
                    }
                }
            ]
        }
        ];
        this.steps = [
            {
                label: 'Facture',
                routerLink: 'facture'
            },
            {
                label: 'Paiement',
                routerLink: 'paiement'
            },
        ];
    };

    actualiseTotal() {
        if (this.sortie_stock)
            if (this.sortie_stock?.produitPrix && this.sortie_stock.quantite) {
                this.total = 0;
                this.totalverse = 0;
                if (this.clientselected !== undefined) {
                    this.total = this.total + (this.sortie_stock.quantite * this.sortie_stock?.produitPrix);

                    if (this.selectedTaxe != null) {
                        if (Object.keys(this.selectedTaxe).length !== 0) {
                            this.total = this.total + ((this.total * this.selectedTaxe.hauteur!) / 100)
                        }
                    }

                    this.totalverse = this.totalverse + this.total;
                } else {
                    this.total = 0;
                    this.totalverse = this.totalverse + this.total;
                }

            }
    }

    actualiseTotal2(event: any) {
        if (this.sortie_stock)
            if (this.sortie_stock?.produitPrix) {
                this.total = 0;
                this.totalverse = 0;
                if (this.clientselected !== undefined) {
                    this.total = this.total + (event.value * this.sortie_stock?.produitPrix);

                    if (this.selectedTaxe != null) {
                        if (Object.keys(this.selectedTaxe).length !== 0) {
                            this.total = this.total + ((this.total * this.selectedTaxe.hauteur!) / 100)
                        }
                    }

                    this.totalverse = this.totalverse + this.total;
                } else {
                    this.total = 0;
                    this.totalverse = this.totalverse + this.total;
                }

            }
    }

    actualiseTotal1(event: any) {
        if (this.sortie_stock)
            if (this.sortie_stock?.produitPrix && this.sortie_stock.quantite) {
                this.total = 0;
                this.totalverse = 0;
                if (this.clientselected !== undefined) {
                    this.total = this.total + (this.sortie_stock.quantite * event.value);

                    if (this.selectedTaxe != null) {
                        if (Object.keys(this.selectedTaxe).length !== 0) {
                            this.total = this.total + ((this.total * this.selectedTaxe.hauteur!) / 100)
                        }
                    }
                    this.totalverse = this.totalverse + this.total;
                } else {
                    this.total = 0;
                    this.totalverse = this.totalverse + this.total;
                }

            }
    }

    addsortie() {
        this.nonPermit = false;
        this.list_sorties_stock.forEach(s => {
            // @ts-ignore
            if (this.sortie_stock)
                if (s.produitNom === this.sortie_stock.produitNom) {
                    // @ts-ignore
                    if (this.sortie_stock.quantite > this.magasinTotalProduit) {
                        this.nonPermit = true;
                    }
                }
        })

        // @ts-ignore
        if(!this.nonPermit && this.sortie_stock?.quantite<=this.magasinTotalProduit){
            this.modifyproduit = false;
            if (this.sortie_stock && this.produitselected && this.magasinselected) {
                this.sortie_stock.societyId = JSON.parse(this.tokenStorage.getsociety()!);
                this.sortie_stock.date_sortie = this.currentdate;
                this.sortie_stock.produitNom = this.produitselected.nom;
                this.sortie_stock.produitId = this.produitselected.id;
                this.sortie_stock.magasinId = this.magasinselected.id;
                this.sortie_stock.magasinNom = this.magasinselected!.nom;
                this.sortie_stock.totalSortie = this.total;
                //this.sortie_stock.paiement = this.totalverse;

                if (this.clientselected !== undefined) {
                    this.sortie_stock.clientId = this.clientselected!.id;
                    this.sortie_stock.clientNom = this.clientselected!.nom;
                }

                if (this.selectedTaxe != null) {
                    if (Object.keys(this.selectedTaxe).length !== 0) {
                        this.sortie_stock.taxeId = this.selectedTaxe!.id;
                        this.sortie_stock.taxehauteur = this.selectedTaxe!.hauteur;
                    }
                } else {
                    // @ts-ignore
                    this.sortie_stock.taxeId = null;
                    // @ts-ignore
                    this.sortie_stock.taxehauteur = null;
                }

                if (this.magasinSelected !== undefined) {
                    this.sortie_stock.magasinDestId = this.magasinSelected!.id;
                    this.sortie_stock.magasinDestNom = this.magasinSelected!.nom;
                }

            }
            this.total = 0;

            this.list_sorties_stock.forEach(s => {
                // @ts-ignore
                if (this.sortie_stock)
                    if (s.produitNom === this.sortie_stock.produitNom) {
                        this.list_sorties_stock = this.list_sorties_stock.filter(find => find.produitNom !== s.produitNom);
                        this.list_sorties_stock.push(this.sortie_stock);
                        this.list_sorties_stock = this.list_sorties_stock.concat();
                        this.sortie_stock = {};
                        this.produitselected = null;
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Success',
                            detail: 'Les références de l\'entrée ont été modifiés dans la liste'
                        });
                        this.modifyproduit = true;
                    }
            });

            if (!this.modifyproduit) {
                if (this.sortie_stock) {
                    this.list_sorties_stock.push(this.sortie_stock);
                    this.list_sorties_stock = this.list_sorties_stock.concat();
                    this.sortie_stock = {};
                    this.produitselected = null;
                    this.list_of_product = [];
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Success',
                        detail: 'L\'entrée de produit à été ajouter a la liste'
                    });
                }
            }

            this.selectedTaxe = null;

            const sommeTotale: number = this.list_sorties_stock.reduce((acc, sortie) => {
                const totalProduit = sortie.totalSortie!;
                return acc + totalProduit;
            }, 0);

            this.totalgeneral = sommeTotale;

        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Rejeter',
                detail: 'la quantité de sortie ne peut exceder le stock actuel!'
            });
        }
    }

    OnUpdateorDelete() {
        this.total = 0;
        this.list_sorties_stock.forEach(s => {
            // @ts-ignore
            let totalsortie = s.produitPrix * s.quantite;
            // @ts-ignore
            this.total = this.total + totalsortie;
            if (s.taxeId != null) {
                // @ts-ignore
                this.total = (this.total + (this.total * s.taxehauteur) / 100)
            }
            this.totalverse = 0;
        })
    }

    OnUpdateorDeleteWhenGetId() {
        this.total = 0;
        this.list_sorties_stock.forEach(s => {
            // @ts-ignore
            this.total = this.total + (s.produitPrix * s.quantite)
            this.totalverse = 0;
        })
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    DeleteSortie(selectedItem: any) {
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment supprimer ces entrées?',
            accept: () => {
                this.list_sorties_stock.forEach(s => {
                    if (s.produitNom === selectedItem.produitNom) {
                        this.list_sorties_stock = this.list_sorties_stock.filter(find => find.produitNom !== s.produitNom);
                    }
                })
                this.OnUpdateorDelete();
                this.messageService.add({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'Opération de suppression effectuée avec success'
                });
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

    UpdateSortiecontent(selectedItem: any) {
        this.sortie_stock = selectedItem;
        this.list_of_product = [];
        this.produits.find(produit => {
            if (produit.nom == this.sortie_stock?.produitNom) {

                // @ts-ignore
                if (this.sortie_stock.taxeId != null) {
                    this.taxes.forEach(t => {
                        if (t.id === this.sortie_stock?.taxeId) {
                            this.selectedTaxe = t;
                            if (this.sortie_stock?.totalSortie) {
                                this.total = this.sortie_stock?.totalSortie;
                            }
                        }
                    })
                }

                this.magasins.forEach(mag => {
                    if (mag.id === this.sortie_stock?.magasinId) {
                        this.magasinselected = mag;
                        this.produitService.getProductOfmagasin(this.magasinselected?.id!, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(value => {
                            // Handle the result here
                            this.produits = value?.payload;
                            this.produitselected = this.produits.find(value1 => value1.id === produit.id);
                            if (this.produitselected) {
                                this.list_of_product.push(this.produitselected);
                            }
                            if (this.produitselected && this.sortie_stock) {
                                // @ts-ignore
                                if (this.produitselected.ligneMagasinDTOS?.length > 0 && this.magasinselected) {
                                    this.produitselected.ligneMagasinDTOS?.forEach(lignes => {
                                        if (lignes.magasinNom === this.magasinselected?.nom) {
                                            // @ts-ignore
                                            this.magasinTotalProduit = lignes.stockActuel;
                                            if(this.sortie_stock?.id!=null){
                                                // @ts-ignore
                                                this.magasinTotalProduit = this.magasinTotalProduit + this.sortie_stock?.quantite
                                            }
                                        }
                                    })
                                }
                            }
                            this.OnUpdateorDelete();
                        });
                    }
                })
            }
        })
    }

    Clearcontent(event: any) {
        if (event.value == null) {
            this.SelectProduct();
        } else {
            this.actualiseProducts();
            if (this.produitselected != null) {
                this.SelectProduct();
            }
        }
    }

    OnchangeMagasin(event: any) {
        this.sortie_stock = {};
        this.produitselected = null;
        this.list_of_product = [];
        this.total = 0;
        if (event.value == null) {
            //this.SelectProduct();
        } else {
            this.actualiseProducts();
        }
    }

    async actualiseProducts() {
        try {
            const result = await this.produitService.getProductOfmagasin(this.magasinselected?.id!, JSON.parse(this.tokenStorage.getsociety()!)).toPromise();
            // Handle the result here
            this.produits = result?.payload;
        } catch (error) {
            // Handle errors here
            console.error(error);
        }
    }

    Clearcontenu() {
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment vider tout votre contenu?',
            accept: () => {
                this.magasinselected = undefined;
                this.magasinSelected = undefined;
                this.clientselected = undefined;
                this.list_sorties_stock = [];
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
        this.sortie_stock = {};
        this.produitselected = null;
    }

    SelectProduct() {
        if (this.produitselected != null) {
            this.list_of_product = [];
            this.total = 0;
            this.totalverse = 0;
            if (this.produitselected.taxeventeId != null) {
                this.selectedTaxe = this.taxes.find(value => value.id === this.produitselected?.taxeventeId)!;
            }
            if (this.produitselected && this.sortie_stock) {
                this.list_of_product.push(this.produitselected);
                // @ts-ignore
                this.sortie_stock.produitPrix = this.produitselected.prixventettc
                this.magasinTotalProduit = 0;
                this.sortie_stock.quantite = 0;
                this.actualiseTotal();
                // @ts-ignore
                if(this.produitselected.ligneMagasinDTOS?.length>0 && this.magasinselected){
                    this.produitselected.ligneMagasinDTOS?.forEach(lignes=>{
                        if(lignes.magasinNom===this.magasinselected?.nom){
                            // @ts-ignore
                            this.magasinTotalProduit = lignes.stockActuel;
                        }
                    })
                }
            }
        } else {
            this.sortie_stock = {};
            this.produitselected = null;
            this.list_of_product = [];
            this.total = 0;
        }
    }

    SeeSortieDetails(selectedItem: any) {
        this.sortie_stock = selectedItem;
    }

    saveAvecEntete(){
        this.boolFacture = true;
        this.saveSorties();
    }

    saveSansEntete(){
        this.boolFacture = false;
        this.saveSorties();
    }

    saveSorties() {
        if(this.totalpayer<=this.totalgeneral){
            // @ts-ignore
            if(this.totalpayer==0 || this.totalpayer==null || (this.totalpayer>0 && this.recu.modePaiement!=null)){

                if(this.totalpayer==0 || this.totalpayer==null){
                    this.totalpayer = 0
                }
                if(this.facture && this.magasinlivraisonselected && this.clientselected){
                    this.facture.societyId = JSON.parse(this.tokenStorage.getsociety()!);
                    this.facture.mouvement = Mouvement.SORTIE;
                    this.facture.listSorties = this.list_sorties_stock;
                    this.facture.factureAvecEntete = true;

                    if (this.magasinlivraisonselected.id != null) {
                        this.facture.magasinId = this.magasinlivraisonselected.id;
                    }
                    if (this.magasinlivraisonselected.nom != null) {
                        this.facture.magasinNom = this.magasinlivraisonselected.nom;
                    }
                    if (this.clientselected.id != null) {
                        this.facture.clientId = this.clientselected.id;
                    }
                    if (this.clientselected.nom != null) {
                        this.facture.clientNom = this.clientselected.nom;
                    }
                    this.facture.montant_total = this.totalgeneral;
                    this.facture.paiement = this.totalpayer;
                    this.facture.modePaiement = this.recu.modePaiement;
                    this.facture.numeroCheque = this.recu.numeroCheque;

                    if(this.initialise!=0){
                        if (this.initialise != null) {
                            this.facture.initialize = this.initialise
                        }
                    } else {
                        // @ts-ignore
                        this.facture.initialize = null
                    }

                    if(this.id!=null){
                        this.facture.id = this.id;
                    }
                    this.facture.createdDate = this.currentdate;

                    this.confirmationService.confirm({
                        header: 'ENREGISTREMENT',
                        message: 'Voulez-vous vraiment enregistrer ces sorties?',
                        accept: () => {
                            if(this.facture){
                                if(this.facture.id){
                                    let totalget = 0;
                                    this.list_sorties_stock.forEach(list=>{
                                        totalget = totalget + (list.quantite! * list.produitPrix!);
                                        if (list.taxeId != null) {
                                            // @ts-ignore
                                            totalget = (totalget + (totalget * list.taxehauteur) / 100)
                                        }
                                    })
                                    this.facture.montant_total = totalget;
                                    this.factureService.Modifierfacture(this.facture).subscribe({
                                        next: value => {
                                            this.total = 0;
                                            this.totalpayer = 0;
                                            this.initialise = undefined;
                                            this.loadall();
                                            this.hideAll();
                                            this.messageService.add({
                                                severity: 'info',
                                                summary: 'Success',
                                                detail: 'Mise à jour reussie avec succès'
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
                                else{

                                    this.factureService.save(this.facture).subscribe({

                                        next: value => {
                                            this.total = 0;
                                            this.totalpayer = 0;
                                            this.initialise = undefined;
                                            this.loadall();
                                            this.hideAll();
                                            this.messageService.add({
                                                severity: 'info',
                                                summary: 'Success',
                                                detail: 'Enregistrement reussit avec succès'
                                            });
                                            this.report(value.payload.id!);
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
                                    this.displayFacture = false;
                                }
                            }
                        },
                    });
                }
            }
            else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejeter',
                    detail: 'Si vous effectuez un paiement vous devez sélectionner un mode de paiement!'
                });
            }
        } else{
            this.messageService.add({
                severity: 'error',
                summary: 'Rejeter',
                detail: 'Le montant à payé ne peut etre supérieur au montant total!'
            });
        }
    }


    report(id: number){
        this.factureService.generateReportforFacture(id, 1).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], {type: 'application/pdf'});
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
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
        this.clientselected = undefined;
        this.list_sorties_stock = [];
        this.list_of_product = [];
        this.Clearproductinformation();
    }

    choixFacture(){
        this.displayFacture = true;
    }*/
}
