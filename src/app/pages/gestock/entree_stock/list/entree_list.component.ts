import {Component, OnInit} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, ConfirmEventType, MenuItem, MessageService} from "primeng/api";
import {Entree_stock, Fournisseur, Magasin, Produit} from "../../../../store/entities/gestock.entity";
import {Entree_stockService} from "../../../../store/services/gestock-service/Entree_stock.service";
import {Mode_paiement} from "../../../../store/enum/enums";
import {FournisseurService} from "../../../../store/services/gestock-service/Fournisseur.service";
import {MagasinService} from "../../../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {Router} from "@angular/router";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {AuthService} from "../../../../store/services/gestock-service/Auth.service";

@Component({
    templateUrl: './entree_list.component.html'
})
export class Entree_listComponent implements OnInit {
    items?: MenuItem[];
    selectedItem: any = null;
    cols: any[] = [];
    entree_stock: Entree_stock | null = {};
    list_entrees_stock: Entree_stock[] = [];
    list_of_product: Produit [] = [];
    produits: Produit[] = [];
    produitselected?: Produit | null;
    fournisseurs: Fournisseur[] = [];
    magasins: Magasin[] = [];
    fournisseurselected?: Fournisseur;
    magasinselected?: Magasin;
    total: number = 0;
    dette= 'dette';
    paye= "payé";
    loading: boolean = true;
    currentdate: Date = new Date();
    today: Date = new Date();
    totalverse: number | undefined = 0;
    display?: Boolean;
    mag?: Boolean = false;
    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    magasinTotalProduit: number | undefined = 0;
    droits: any;
    produitsOfVerification: Produit[]=[];
    constructor(private messageService: MessageService,
                private tokenStorage: TokenStorage,
                private confirmationService: ConfirmationService, private entreeStockService: Entree_stockService,
                private authService:AuthService,
    private fournisseurService: FournisseurService, private magasinService: MagasinService, private router: Router, private produitService: ProduitService) {
    }

    ngOnInit() {
        this.droits = this.tokenStorage.getdroits();
        this.loadall();
        this.loadallfournisseurs();
        this.loadallmagasins();
        this.loadallproduits();
        this.loadItems();
        console.log(this.produitselected)
    }

    addentree() {
        this.router.navigate(['/gestock/entreestock'])
    }
    addentransfert() {
        this.router.navigate(['/gestock/transfertStock'])
    }
    loadall(){
        this.loading = true; // Début du chargement
        this.entreeStockService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.list_entrees_stock = res.payload.filter(item => item.fournisseurId != null);
                this.loading = false; // Fin du chargement
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
        );
    }
    loadallfournisseurs(){
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );
    }
    loadallmagasins(){
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );
    }
    loadallproduits(){
        this.produitService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.produits = res.payload;
            }
        );
    }

    Clearcontent(event: any) {
        if (event.value == null) {
            //console.log("null")
        } else {
                this.SelectProduct()
        }
    }

    actualiseTotal() {
        if (this.entree_stock)
            if (this.entree_stock?.produitPrix && this.entree_stock.quantite) {
                this.total = 0;
                this.totalverse = 0;
                this.total = this.total + (this.entree_stock.quantite * this.entree_stock?.produitPrix);
                this.totalverse = this.totalverse + this.total;
            }
    }


    actualiseTotal2(event:any) {
        if (this.entree_stock)
            if (this.entree_stock?.produitPrix) {
                this.total = 0;
                this.totalverse = 0;
                this.total = this.total + (event.value * this.entree_stock?.produitPrix);
                this.totalverse = this.totalverse + this.total;
            }
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
            this.actualiseTotal();
            this.actualiseProducts(this.produitselected);
            // @ts-ignore
            if(this.produitselected.ligneMagasinDTOS?.length>0 && this.magasinselected){
                this.produitselected.ligneMagasinDTOS?.forEach(lignes=>{
                    if(lignes.magasinNom===this.magasinselected?.nom){
                        this.magasinTotalProduit = lignes.stockActuel;
                    }
                })
            }
        }
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    DeleteEntree(selectedItem: any) {
        this.entree_stock = selectedItem;
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment supprimer cette entrée de stock?',
            accept: () => {
                if (this.entree_stock?.id) {
                    this.entreeStockService.delete(this.entree_stock.id).subscribe({
                        next: value => {
                            this.loadall();
                            this.hideAll();
                            this.display = false;
                            this.messageService.add({
                                severity: 'info',
                                summary: 'Success',
                                detail: 'Suppression effectuée avec succès'
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

    updateEntree() {

        // @ts-ignore
        if(this.totalverse<=this.total){

            if (this.entree_stock && this.produitselected && this.magasinselected && this.fournisseurselected) {
                this.entree_stock.date_entree = this.currentdate;
                this.entree_stock.produitNom = this.produitselected.nom;
                this.entree_stock.produitId = this.produitselected.id;
                //this.entree_stock.produitPrix = this.produitselected.prix;
                this.entree_stock.magasinId = this.magasinselected.id;
                this.entree_stock.magasinNom = this.magasinselected.nom;
                this.entree_stock.fournisseurId = this.fournisseurselected.id;
                this.entree_stock.fournisseurNom = this.fournisseurselected.nom;
                this.entree_stock.totalentree = this.total;
                this.entree_stock.paiement = this.totalverse;
            }
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment modifier cette entrée?',
                accept: () => {
                    if (this.entree_stock) {
                        this.entreeStockService.update(this.entree_stock).subscribe({
                            next: value => {
                                this.loadall();
                                this.hideAll();
                                this.display = false;
                                this.messageService.add({
                                    severity: 'info',
                                    summary: 'Success',
                                    detail: 'Modification effectuée avec succès'
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
        else{
            this.messageService.add({
                severity: 'warn',
                summary: 'Annuler',
                detail: 'Le montant versé doit etre inferieur au total général'
            });
        }
    }

    UpdateEntreecontent(selectedItem: any) {
        this.mag = true;
        this.list_of_product = [];
        this.entree_stock = selectedItem;
        this.produits.find(produit => {
            if (produit.nom == this.entree_stock?.produitNom) {
                this.produitselected = produit;
                this.list_of_product.push(this.produitselected);
                // @ts-ignore
            }
        });

        this.fournisseurs.forEach(fournisseur=>{
            if(fournisseur.id == this.entree_stock?.fournisseurId){
                this.fournisseurselected = fournisseur;
            }
        });

        this.magasins.forEach(magasin=>{
            if(magasin.id == this.entree_stock?.magasinId){
                this.magasinselected = magasin;
            }
        });

        if(this.entree_stock?.produitPrix && this.entree_stock.quantite && this.entree_stock.date_entree){
            this.currentdate = new Date();
            const dateString = this.entree_stock.date_entree;
            this.currentdate = new Date(dateString);
            this.totalverse = this.entree_stock.paiement;
            this.total = this.entree_stock.produitPrix * this.entree_stock.quantite;
        }

        // @ts-ignore
        if(this.magasinselected && this.produitselected){
            this.actualiseProducts(this.produitselected);
        }
        this.display = true;
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
        this.display = true;
    }

    SeeEntreeDetails(selectedItem: any) {
        this.entree_stock = selectedItem;
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
        this.list_of_product = [];
        this.Clearproductinformation();
    }

    annuler(){
        this.display=false;
}

    Clearproductinformation() {
        this.entree_stock = {};
        this.produitselected = undefined;
    }

}
