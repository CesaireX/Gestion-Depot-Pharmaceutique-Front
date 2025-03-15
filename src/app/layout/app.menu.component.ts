import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import {AuthService} from "../store/services/gestock-service/Auth.service";
import {TokenStorage} from "../store/storage/tokenStorage";

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
     droits: any;
     roles: any;
constructor(private authService:AuthService, private tokenStorage: TokenStorage) {
}
    ngOnInit() {
        this.droits = this.tokenStorage.getdroits();

        this.model = [
            {
                label: 'GESTION DE PHARMACIE', icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Acceuil',
                        icon: 'pi pi-home',
                        routerLink: ['/gestock/dashboards'],
                    },
                    {
                        label: 'Inventaire', icon: 'pi pi-folder',
                        items: [
                            {
                                label: 'Produits',
                                icon: 'pi pi-fw pi-folder-open',
                                routerLink: ['/gestock/produit']
                            },
                             /*{
                                label: 'Ajout Produits dans magasins',
                                icon: 'pi pi-fw pi-folder-open',
                                routerLink: ['/gestock/addProduitMagasin']
                            },*/
                            {
                                label: 'Inventaire par Dépots',
                                icon: 'pi pi-fw pi-chart-bar',
                                routerLink: ['/gestock/inventaire']
                            },
                            {
                                label: 'Correction Stock',
                                icon: 'pi pi-fw pi-pencil',
                                routerLink: ['/gestock/correctionStock'],
                                queryParams: { type: 'CORRECTION' },
                            },
                            {
                                label: 'Sortie de produits périmés',
                                icon: 'pi pi-fw pi-trash',
                                routerLink: ['/gestock/produitsPerimes'],
                                queryParams: { type: 'PERIME' },
                            },
                            /*{
                                label: 'Transfert de stock',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/transfertStock']
                            },*/
                        ]
                    },
                    {
                        label: 'Ventes',
                        icon: 'pi pi-fw pi-plus-circle',
                        routerLink: ['/gestock/factureClient', { mode: 'create' }]
                    },
                    {
                        label: 'Historique des ventes',
                        icon: 'pi pi-fw pi-history',
                        routerLink: ['/gestock/factureClientHistorique', { mode: 'history' }]
                    },
                    {
                        label: 'Clients assurés',
                        icon: 'pi pi-fw pi-users',
                        items: [
                            {
                                label: 'Factures Non Remboursées',
                                icon: 'pi pi-plus-circle',
                                routerLink: ['/gestock/factureClientNonRembourse'],
                                queryParams: { type: 'NON_REMBOURSE' },
                            },
                            {
                                label: 'Factures Remboursées',
                                icon: 'pi pi-plus-circle',
                                routerLink: ['/gestock/factureClientRembourse'],
                                queryParams: { type: 'REMBOURSE' },
                            }
                        ]
                    },

                   /* {
                        label: 'Ventes', icon: 'pi pi-fw pi-shopping-cart',expanded: true,
                        items: [
                            /!*{
                                label: 'Clients',
                                icon: 'pi pi-fw pi-globe',
                                routerLink: ['/gestock/client']
                            },
                            {
                                label: 'Créances clients',
                                icon: 'pi pi-fw pi-wallet',
                                routerLink: ['/gestock/creance']
                            },
                            {
                                label: 'Commande Client',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/commandeClient']
                            },
                            {
                                label: 'Livraisons',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/livraison']
                            },*!/
                            {
                                label: 'Factures',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/factureClient']
                            },
                            /!*{
                                label: 'Encaissements',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/caisse']
                            }*!/
                        ]
                    }*/
                    {
                        label: 'Achats', icon: 'pi pi-database',
                        items: [
                            {
                                label: 'Fournisseurs',
                                icon: 'pi pi-fw pi-car',
                                routerLink: ['/gestock/fournisseur']
                            },
                            {
                                label: 'Dépenses effectuées',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['/gestock/depense']
                            },
                            {
                                label: 'Bon de commande',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/bonCommande']
                            },
                            {
                                label: 'Avis de reception',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/reception']
                            },
                            {
                                label: 'Facture fournisseurs',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/factureFournisseur']
                            },
                            {
                                label: 'Versements',
                                icon: 'pi pi-fw pi-plus-circle',
                                routerLink: ['/gestock/versement']
                            }
                        ]
                    },
                    {
                        label: 'Rapports', icon: 'pi pi-chart-line',
                        items: [
                            /*{
                                label: 'Clients débiteurs',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/clientdebiteur']
                            },
                            {
                                label: 'Fournisseurs crediteurs',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/fournisseurcrediteur']
                            },
                            {
                                label: 'Historique des clients',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/clienthistorique']
                            },*/
                            {
                                label: 'Historique des Fournisseurs',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/fournisseurhistorique']
                            },
                            /*{
                                label: 'Ventes Par Client',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/venteparclient']
                            },*/
                            {
                                label: 'Ventes Par Produits',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/ventepararticle']
                            },
                            {
                                label: 'Achat Par Fournisseur',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/achatparfournisseur']
                            },
                            {
                                label: 'Achat Par Produits',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/achatpararticle']
                            },
                            {
                                label: 'Liste des dépenses',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/etatDepense']
                            },
                            /*{
                                label: 'Encaissement',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/encaissement']
                            },*/
                            {
                                label: 'Rapport Activité',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/rapportActivite']
                            },
                            {
                                label: 'Etat Stock',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/etatstock']
                            },
                            /*{
                                label: 'Chiffre d\'affaire par trimestre',
                                icon: 'pi pi-fw pi-star-fill',
                                routerLink: ['/gestock/chiffreAffaire']
                            }*/
                        ]
                    },
                    {
                        label: 'Paramétrages', icon: 'pi pi-cog',
                        items: [
                            {
                                label: 'Dépots',
                                icon: 'pi pi-fw pi-database',
                                routerLink: ['/gestock/magasin']
                            },
                            {
                                label: 'Formes des produits',
                                icon: 'pi pi-fw pi-box',
                                routerLink: ['/gestock/categorie']
                            },
                            {
                                label: 'Familles des produits',
                                icon: 'pi pi-fw pi-box',
                                routerLink: ['/gestock/famille']
                            },
                            {
                                label: 'Unités de mesure',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['/gestock/uniteMesure']
                            },
                            {
                                label: 'Taxes',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['/gestock/taxe']
                            },
                            {
                                label: 'Assurances',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['/gestock/assurance']
                            },
                            {
                                label: 'Natures des dépenses',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['/gestock/course']
                            }
                        ]
                    },
                    {
                        label: 'Utilisateurs', icon: 'pi pi-user',
                        items: [
                            {
                                label: 'Utilisateurs',
                                icon: 'pi pi-fw pi-user',
                                routerLink: ['/gestock/utilisateur']
                            },
                            {
                                label: 'Rôles',
                                icon: 'pi pi-fw pi-ban',
                                routerLink: ['/gestock/role']
                            },
                            /*{
                                label: 'Société',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/gestock/societe']
                            }*/
                        ]
                    }
                ]
            }
        ];

// Apply permissions to filter menu items
        if (this.droits != null) {
            // GESTION DE STOCK
            this.model = this.model.map(section => {
                if (section.label === 'GESTION DE PHARMACIE') {
                    section.items = section.items?.filter(item => {
                        if (!item.items) {
                            // Si l'élément n'a pas de sous-éléments, on le garde si l'utilisateur a les droits
                            if (item.label === 'Acceuil' && !this.droits.includes('VOIR_DASHBOARD')) {
                                return false;
                            }
                            // Ajoutez les autres vérifications pour les éléments sans sous-éléments ici
                            return true;
                        } else {
                            // Si l'élément a des sous-éléments
                            item.items = item.items.filter(subItem => {
                                if (item.label === 'Inventaire') {
                                    if (subItem.label === 'Articles' && !this.droits.includes('VOIR_ARTICLE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Ajout Articles dans magasins' && !this.droits.includes('AJOUT_ARTICLES_MAGASINS')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Inventaire par Dépots' && !this.droits.includes('VOIR_INVENTAIRE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Correction Stock' && !this.droits.includes('VOIR_CORRECTION_STOCK')) {
                                        return false;
                                    }
                                     if (subItem.label === 'Sortie de produits périmés' && !this.droits.includes('VOIR_CORRECTION_STOCK')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Transfert de stock' && !this.droits.includes('VOIR_LISTE_TRANSFERT_STOCK')) {
                                        return false;
                                    }
                                }
                                if (item.label === 'Ventes') {
                                    if (subItem.label === 'Clients' && !this.droits.includes('VOIR_CLIENTS')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Créances clients' && !this.droits.includes('VOIR_CREANCE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Commande Client' && !this.droits.includes('VOIR_COMMANDE_CLIENT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Livraisons' && !this.droits.includes('VOIR_LIVRAISON')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Factures' && !this.droits.includes('VOIR_FACTURE_CLIENT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Encaissements' && !this.droits.includes('VOIR_ENCAISSEMENT_FACTURE')) {
                                        return false;
                                    }
                                }
                                if (item.label === 'Achats') {
                                    if (subItem.label === 'Fournisseurs' && !this.droits.includes('VOIR_FOURNISSEURS')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Dépenses effectuées' && !this.droits.includes('VOIR_DEPENSE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Bon de commande' && !this.droits.includes('VOIR_COMMANDE_FOURNISSEUR')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Avis de reception' && !this.droits.includes('VOIR_RECEPTION_ACHAT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Facture fournisseurs' && !this.droits.includes('VOIR_FACTURE_FOURNISSEUR')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Versements' && !this.droits.includes('VOIR_VERSEMENT')) {
                                        return false;
                                    }
                                }
                                if (item.label === 'Rapports') {
                                    if (subItem.label === 'Clients débiteurs' && !this.droits.includes('VOIR_CLIENT_DEBITEUR')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Fournisseurs crediteurs' && !this.droits.includes('VOIR_FOURNISSEUR_CREDITEUR')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Historique des clients' && !this.droits.includes('VOIR_HISTORIQUE_CLIENT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Historique des Fournisseurs' && !this.droits.includes('VOIR_HISTORIQUE_FOURNISSEUR')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Ventes Par Client' && !this.droits.includes('VOIR_VENTE_PAR_CLIENT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Ventes Par Produits' && !this.droits.includes('VOIR_VENTE_PAR_ARTICLE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Achat Par Fournisseur' && !this.droits.includes('VOIR_FOURNISSEUR_ACHAT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Achat Par Produits' && !this.droits.includes('VOIR_ACHAT_ARTICLE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Liste des dépenses' && !this.droits.includes('VOIR_LISTE_DES_DEPENSE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Encaissement' && !this.droits.includes('VOIR_ENCAISSEMENT')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Rapport Activité' && !this.droits.includes('VOIR_RAPPORT_ACTIVITE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Etat Stock' && !this.droits.includes('VOIR_ETAT_STOCK')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Chiffre d\'affaire par trimestre' && !this.droits.includes('VOIR_CHIFFRE_AFFAIRE_PAR_TRIMESTRE')) {
                                        return false;
                                    }
                                }
                                if (item.label === 'Paramétrages') {
                                    if (subItem.label === 'Dépots' && !this.droits.includes('VOIR_MAGASINS')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Assurances' && !this.droits.includes('VOIR_MAGASINS')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Formes des produits' && !this.droits.includes('VOIR_CATEGORIE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Familles des produits' && !this.droits.includes('VOIR_CATEGORIE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Unités de mesure' && !this.droits.includes('VOIR_UNITE_MESURE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Taxes' && !this.droits.includes('VOIR_TAXE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Natures des dépenses' && !this.droits.includes('VOIR_NATURE_DEPENSE')) {
                                        return false;
                                    }
                                }
                                if (item.label === 'Utilisateurs') {
                                    if (subItem.label === 'Utilisateurs' && !this.droits.includes('VOIR_UTILISATEUR')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Rôles' && !this.droits.includes('VOIR_ROLE')) {
                                        return false;
                                    }
                                    if (subItem.label === 'Société' && !this.droits.includes('VOIR_SOCIETE')) {
                                        return false;
                                    }
                                }
                                return true;
                            });
                            return item.items.length > 0; // Assurez-vous que item.items est défini
                        }
                    }).filter(item => item !== undefined);
                }
                return section;
            });
        }
    }



}

