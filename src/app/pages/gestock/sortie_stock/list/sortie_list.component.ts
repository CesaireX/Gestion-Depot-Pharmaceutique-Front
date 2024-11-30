import {Component, OnInit} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, ConfirmEventType, MenuItem, MessageService} from "primeng/api";
import {Sortie_stock, Client, Magasin, Produit, LigneMagasin} from "../../../../store/entities/gestock.entity";
import {Sortie_stockService} from "../../../../store/services/gestock-service/Sortie_stock.service";
import {Mode_paiement} from "../../../../store/enum/enums";
import {ClientService} from "../../../../store/services/gestock-service/Client.service";
import {MagasinService} from "../../../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {Router} from "@angular/router";
import {LigneMagasinService} from "../../../../store/services/gestock-service/LigneMagasin.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {AuthService} from "../../../../store/services/gestock-service/Auth.service";

@Component({
    templateUrl: './sortie_list.component.html'
})
export class Sortie_listComponent implements OnInit {
    menuitems?: any;
    items?: any;
    selectedItem: any = null;
    cols: any[] = [];
    sortie_stock: Sortie_stock | null = {};
    list_sorties: Sortie_stock[] = [];
    list_ventes: Sortie_stock[] = [];
    list_of_product: Produit [] = [];
    produits: Produit[] = [];
    produitselected?: Produit | null;
    clients: Client[] = [];
    magasins: Magasin[] = [];
    clientselected?: Client;
    magasinselected?: Magasin;
    magasinSelected?: Magasin;
    loading: boolean = true;
    total: number = 0;
    dette = 'dette';
    paye = "payé";
    currentdate: Date = new Date();
    today: Date = new Date();
    totalverse: number | undefined = 0;
    display?: Boolean;
    displayiew?: Boolean;
    displayViewM?: Boolean;

    mode_paiements = Object.keys(Mode_paiement)
        .map(key => {
            // @ts-ignore
            return ({label: Mode_paiement[key], value: Mode_paiement[key]});
        });
    ligneMagasin: LigneMagasin | undefined;
    qttRest: number | undefined;
    droits: any;

    constructor(private messageService: MessageService,
                private confirmationService: ConfirmationService,
                private sortieStockService: Sortie_stockService,
                private tokenStorage: TokenStorage,
                private clientService: ClientService,
                private magasinService: MagasinService,
                private router: Router,
                private produitService: ProduitService,
                protected ligneMagasinService: LigneMagasinService,
    ) {
    }

    ngOnInit() {
        this.droits = this.tokenStorage.getdroits();
        this.loadall();
        this.loadallclients();
        this.loadallmagasins();
        this.loadallproduits();
        this.loadItems();
    }

    addsortie() {
        this.router.navigate(['/gestock/sortieStock'])
    }

    loadall(){
        this.loading = true; // Début du chargement
        this.sortieStockService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.list_ventes = res.payload.filter(item => item.clientId !== null);
                this.list_sorties = res.payload.filter(item => item.magasinDestId !== null);
                this.loading = false; // Fin du chargement
            },
            (error) => {
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
    }
    loadallclients(){
        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
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
    }

    actualiseTotal() {
        if (this.sortie_stock)
            if (this.sortie_stock?.produitPrix && this.sortie_stock.quantite) {
                this.total = 0;
                this.totalverse = 0;
                if (this.clientselected !== undefined) {
                    this.total = this.total + (this.sortie_stock.quantite * this.sortie_stock?.produitPrix);
                    this.totalverse = this.totalverse + this.total;
                } else {
                    this.total = 0;
                    this.totalverse = this.totalverse + this.total;
                }
            }
    }

    SelectProduct() {
        this.list_of_product = [];
        this.total = 0;
        this.totalverse = 0;
        if (this.produitselected && this.sortie_stock) {
            this.list_of_product.push(this.produitselected);
            // @ts-ignore
            this.sortie_stock.produitPrix = this.produitselected.prix
            this.sortie_stock.quantite = 0;
            this.actualiseTotal();
        }
    }

    quantiteRestante() {
        this.ligneMagasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe((res) => {
            this.ligneMagasin = res.payload.find(item => item.produitId === this.produitselected?.id && item.magasinId === this.magasinselected?.id);
            this.qttRest = this.ligneMagasin?.stockActuel;
        })
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Détails',
                    icon: 'pi pi-eye',
                    disabled: !this.droits.includes('VOIR_LISTE_SORTIE_STOCK'),
                    command: ($event: any) => {
                        this.details(this.selectedItem);
                    }
                },

                /*   {
                       label: 'Modifier',
                       icon: 'pi pi-pencil',
                       disabled:!this.droits.includes('MODIFIER_SORTIE_STOCK'),
                       command: ($event:any) => {
                           this.addsortie();
                       }
                   },*/

                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('SUPPRIMER_SORTIE_STOCK'),
                    command: ($event: any) => {
                        this.DeleteSortie(this.selectedItem);
                    }
                },
            ]
        }
        ]
    };

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    DeleteSortie(selectedItem: any) {
        this.sortie_stock = selectedItem;
        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment supprimer cette sortie de stock?',
            accept: () => {
                if (this.sortie_stock?.id) {
                    this.sortieStockService.delete(this.sortie_stock.id).subscribe({
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

    updateSortie() {
        // @ts-ignore
        if (this.totalverse <= this.total) {

            if (this.sortie_stock && this.produitselected && this.magasinselected) {
                this.sortie_stock.date_sortie = this.currentdate;
                this.sortie_stock.produitNom = this.produitselected.nom;
                this.sortie_stock.produitId = this.produitselected.id;
                //this.sortie_stock.produitPrix = this.produitselected.prix;
                this.sortie_stock.magasinId = this.magasinselected.id;
                this.sortie_stock.magasinNom = this.magasinselected.nom;

                if (this.clientselected) {
                    this.sortie_stock.clientId = this.clientselected.id;
                    this.sortie_stock.clientNom = this.clientselected.nom;
                }
                if (this.magasinSelected) {
                    this.sortie_stock.magasinDestId = this.magasinSelected.id;
                    this.sortie_stock.magasinDestNom = this.magasinSelected.nom;
                }

                this.sortie_stock.totalSortie = this.total;
                //this.sortie_stock.paiement = this.totalverse;
            }

            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment modifier cette sortie?',
                accept: () => {
                    if (this.sortie_stock) {
                        this.sortieStockService.update(this.sortie_stock).subscribe({
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
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Annuler',
                detail: 'Le montant versé doit etre inferieur au total général'
            });
        }
    }

    UpdateSortiecontent(selectedItem: any) {
        this.list_of_product = [];
        this.sortie_stock = selectedItem;
        this.produits.find(produit => {
            if (produit.nom == this.sortie_stock?.produitNom) {
                this.produitselected = produit;
                this.list_of_product.push(this.produitselected);
            }
        });

        this.clients.forEach(client => {
            if (client.id == this.sortie_stock?.clientId) {
                this.clientselected = client;
            }
        });

        this.magasins.forEach(magasin => {
            if (magasin.id == this.sortie_stock?.magasinId) {
                this.magasinselected = magasin;
            }
        });

        this.magasins.forEach(magasin => {
            if (magasin.id == this.sortie_stock?.magasinDestId) {
                this.magasinSelected = magasin;
            }
        });

        if (this.sortie_stock?.produitPrix && this.sortie_stock.quantite && this.sortie_stock.date_sortie) {
            this.currentdate = new Date();
            const dateString = this.sortie_stock.date_sortie;
            this.currentdate = new Date(dateString);
            //this.totalverse = this.sortie_stock.paiement;
            this.total = this.sortie_stock.produitPrix * this.sortie_stock.quantite;
        }
        this.display = true;
    }

    SeeSortieDetails(selectedItem: any) {
        this.sortie_stock = selectedItem;
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
        this.list_of_product = [];
        this.Clearproductinformation();
    }

    Clearproductinformation() {
        this.sortie_stock = {};
        this.produitselected = undefined;
    }

    details(selectedItem: any) {
        this.sortie_stock = selectedItem;
        this.displayiew = true;
    }

    detailsMagasin(selectedItem: any) {
        this.sortie_stock = selectedItem;
        this.displayViewM = true;
    }

}
