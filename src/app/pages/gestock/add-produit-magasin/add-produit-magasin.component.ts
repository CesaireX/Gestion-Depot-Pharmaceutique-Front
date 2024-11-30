import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LigneMagasin, Magasin, Produit} from "../../../store/entities/gestock.entity";
import {ConfirmationService, MessageService} from "primeng/api";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {ProduitService} from "../../../store/services/gestock-service/Produit.service";
import {LigneMagasinService} from "../../../store/services/gestock-service/LigneMagasin.service";
import {Table} from "primeng/table";

@Component({
  selector: 'app-add-produit-magasin',
  templateUrl: './add-produit-magasin.component.html',
  styleUrls: ['./add-produit-magasin.component.scss']
})
export class AddProduitMagasinComponent implements OnInit{

    magasins: Magasin[] = [];
    magasinselected: Magasin | undefined | null;
    produitSelected: Produit| undefined | null;
    produits: Produit[] = [];
    societyId: number = 0;
    ligneMagasinId: number = 0;
    ligneMagasin: LigneMagasin = {};
    clonedProducts: { [s: string]: Produit } = {};
    articles: Produit[] = []; // Liste des articles disponibles pour sélection
    selectedArticle: Produit | null = null; // Article sélectionné
    initialStock: number | null = 1; // Stock initial saisi
    verifierStockInitial: number | undefined;
    @ViewChild('filter') filter!: ElementRef;
    metaKey: boolean = true;
    constructor(
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected magasinService: MagasinService,
        protected produitService: ProduitService,
        protected ligneMagasinService: LigneMagasinService,
        private tokenStorage: TokenStorage,
    ) {
    }
    ngOnInit(): void {
        this.loadMagasin();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.loadArticles();
    }
    loadMagasin() {
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
            }
        );
    }



    loadProductByMagasin() {
        this.produitSelected = null;

        if (this.magasinselected) {
            this.produitService.getProductOfmagasin(this.magasinselected.id!, this.societyId).subscribe((res) => {
                this.produits = res.payload.map((produit: any) => {
                    // Assurez-vous que la réponse inclut stockInitial
                    return {
                        ...produit,
                        stockInitial: produit.stockInitial || 0 // Remplacez 0 par la valeur par défaut souhaitée
                    };
                });
            });
        }
    }


    loadArticles() {
        // Remplacez cette partie par l'appel réel à votre service pour charger les articles disponibles
        this.produitService.findbysociety(this.societyId).subscribe((res) => {
            this.articles = res.payload;
        });
    }
    addProduct() {
        if (this.selectedArticle && this.initialStock != null) {
            // Vérifier si le produit est déjà dans la liste
            const existingProduct = this.produits.find(p => p.id === this.selectedArticle!.id);

            if (existingProduct) {
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Produit déjà dans la liste' });
            } else {
                const newProduct = { ...this.selectedArticle, stockInitial: this.initialStock };
                this.produits.unshift(newProduct);

                // Sauvegarder dans la base de données
                const ligneMagasin: LigneMagasin = {
                    stockInitial: this.initialStock,
                    stock_physique_dispo: this.initialStock,
                    stock_physique_dispo_vente: this.initialStock,
                    stock_physique_engage: 0.0,
                    magasinId: this.magasinselected?.id!,
                    produitId: this.selectedArticle.id!,
                    societyId:  this.societyId // Remplacez par l'interface réelle si disponible
                };
                this.ligneMagasinService.save(ligneMagasin).subscribe(
                    (res) => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Produit ajouté à la liste' });
                    },
                    (error) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Erreur lors de l\'ajout du produit' });
                    }
                );

                this.selectedArticle = null;
                this.initialStock = null;
            }
        }
    }

    verifierInitialStock(event : any) {
        this.verifierStockInitial = event.value;
    }

    onRowEditInit(product: Produit) {

        // @ts-ignore
        this.clonedProducts[product.id as string] = { ...product };
        this.ligneMagasinService.findByProductAndMagasin(product.id!, this.magasinselected?.id!).subscribe(
            response => {
                // @ts-ignore
                this.ligneMagasin  = response.payload
            },
            error => {
                console.error('Erreur lors de la récupération des lignes de magasin:', error);
            }
        );
    }
    onRowEditSave(produit: Produit) {
        if (produit.stockInitial! > 0) {
            // @ts-ignore
            delete this.clonedProducts[produit.id as string];
            // Mettre à jour dans la base de données

            this.ligneMagasin.stock_physique_dispo=this.ligneMagasin.stock_physique_dispo! - this.ligneMagasin.stockInitial! + produit.stockInitial!;
            this.ligneMagasin.stock_physique_dispo_vente=this.ligneMagasin.stock_physique_dispo_vente! - this.ligneMagasin.stockInitial! + produit.stockInitial!;
            this.ligneMagasin.stockInitial=produit.stockInitial;
            console.log(this.ligneMagasin)
            this.ligneMagasinService.update(this.ligneMagasin).subscribe(
                (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Produit mis à jour' });
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Erreur lors de la mise à jour du produit' });
                }
            );

        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Quantité de stock invalide' });
        }
    }

    deleteProduct(idLigne: number, idProduit) {
        this.ligneMagasinService.delete(idLigne).subscribe(
            () => {
                this.produits = this.produits.filter(p => p.id !== idProduit);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Produit supprimé' });
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Erreur lors de la suppression du produit, le produit est déja utilisé' });
            }
        );
    }

    confirmDeleteProduct(id: number) {
        this.ligneMagasinService.findByProductAndMagasin(id!, this.magasinselected?.id!).subscribe(
            response => {
                // @ts-ignore
                this.ligneMagasinId  = response.payload.id;
            },
            error => {
                console.error('Erreur lors de la récupération des lignes de magasin:', error);
            }
        );
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer ce produit?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteProduct(this.ligneMagasinId, id);
            }
        });
    }

    onRowEditCancel(product: Produit, index: number) {
        // @ts-ignore
        this.produits[index] = this.clonedProducts[product.id as string];

        // @ts-ignore
        delete this.clonedProducts[product.id as string];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

}
