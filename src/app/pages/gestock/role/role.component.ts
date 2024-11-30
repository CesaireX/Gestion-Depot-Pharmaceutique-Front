import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Role, Magasin} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {RoleService} from "../../../store/services/gestock-service/Role.service";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {Droit} from "../../../store/enum/enums";
import {TokenStorage} from "../../../store/storage/tokenStorage";

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

    roles: Role[] = [];
    error: any;
    success: any;
    page: any;
    reverse: any;
    display?: Boolean;
    modal = '';
    menuBarBool?: boolean;
    menuitems: any
    items: MenuItem[] | undefined;
    item: any;
    selectedItem: any = null;
    loading: boolean = true;
    role: Role = {};
    check = false;
    droitsSelected: Droit[] | undefined = [];
    droits: any;
    isSecondaryActive = false;
    groupedCategories: any[] | undefined;
    numberOfColumns = 3;
    chrgmt: boolean = false;

    @ViewChild('filter') filter!: ElementRef;

    droitsCategorises = {
        Utilisateur: [
            Droit.SUPPRIMER_USER,
            Droit.AJOUTER_USER,
            Droit.MODIFIER_USER,
            Droit.VOIR_UTILISATEUR,
            Droit.VOIR_ROLE,
            Droit.MODIFIER_ROLE,
            Droit.AJOUTER_ROLE,
            Droit.SUPPRIMER_ROLE,
            Droit.MODIFIER_MON_COMPTE,
            Droit.MODIFIER_MON_MOT_DE_PASSE,
        ],
        Magasin: [
            Droit.SUPPRIMER_MAGASIN,
            Droit.AJOUTER_MAGASIN,
            Droit.MODIFIER_MAGASIN,
            Droit.VOIR_MAGASINS,
        ],
        Article: [
            Droit.SUPPRIMER_PRODUIT,
            Droit.AJOUTER_PRODUIT,
            Droit.MODIFIER_PRODUIT,
            Droit.VOIR_ARTICLE,
            Droit.VOIR_ARTICLE_STOCK_MAGASIN,
            Droit.VOIR_ARTICLE_TRANSACTION,
        ],
        Ajout_articles:[
        Droit.AJOUT_ARTICLES_MAGASINS
        ],
        Fournisseur: [
            Droit.AJOUTER_FOURNISSEUR,
            Droit.MODIFIER_FOURNISSEUR,
            Droit.SUPPRIMER_FOURNISSEUR,
            Droit.VOIR_FOURNISSEURS,
            Droit.VOIR_FOURNISSEUR_TRANSACTION,
            Droit.VOIR_FOURNISSEUR_HISTORIQUE,
        ],
        Client: [
            Droit.AJOUTER_CLIENT,
            Droit.MODIFIER_CLIENT,
            Droit.SUPPRIMER_CLIENT,
            Droit.VOIR_CLIENTS,
            Droit.VOIR_CLIENT_TRANSACTION,
            Droit.VOIR_CLIENT_HISTORIQUE,
        ],
        Categorie: [
            Droit.AJOUTER_CATEGORIE,
            Droit.MODIFIER_CATEGORIE,
            Droit.SUPPRIMER_CATEGORIE,
            Droit.VOIR_CATEGORIE,
        ],
        Unite_Mesure: [
            Droit.AJOUTER_UNITE_MESURE,
            Droit.MODIFIER_UNITE_MESURE,
            Droit.SUPPRIMER_UNITE_MESURE,
            Droit.VOIR_UNITE_MESURE,
        ],

        Depense: [
            Droit.AJOUTER_NATURE_DEPENSE,
            Droit.MODIFIER_NATURE_DEPENSE,
            Droit.SUPPRIMER_NATURE_DEPENSE,
            Droit.VOIR_NATURE_DEPENSE,
            Droit.AJOUTER_DEPENSE,
            Droit.MODIFIER_DEPENSE,
            Droit.SUPPRIMER_DEPENSE,
            Droit.VOIR_DEPENSE,

        ],
        Societe: [
            Droit.AJOUTER_SOCIETE,
            Droit.MODIFIER_SOCIETE,
            Droit.SUPPRIMER_SOCIETE,
            Droit.VOIR_SOCIETE,
        ],

        Rapports: [
            Droit.VOIR_CLIENT_DEBITEUR,
            Droit.VOIR_HISTORIQUE_CLIENT,
            Droit.VOIR_VENTE_PAR_CLIENT,
            Droit.VOIR_VENTE_PAR_ARTICLE,
            Droit.VOIR_LISTE_DES_DEPENSE,
            Droit.VOIR_ENCAISSEMENT,
            Droit.VOIR_RAPPORT_ACTIVITE,
            Droit.VOIR_ETAT_STOCK,
            Droit.VOIR_ACHAT_ARTICLE,
            Droit.VOIR_FOURNISSEUR_ACHAT,
            Droit.VOIR_FOURNISSEUR_CREDITEUR,
            Droit.VOIR_HISTORIQUE_FOURNISSEUR,
            Droit.VOIR_CHIFFRE_AFFAIRE_PAR_TRIMESTRE,
            Droit.VOIR_INVENTAIRE,
        ],
        Tableau_Bord: [
            Droit.VOIR_DASHBOARD,
        ],
        Tableau_Bord_Elements: [
            Droit.VOIR_DIV1,
            Droit.VOIR_DIV2,
            Droit.VOIR_DIV3,
            Droit.VOIR_DIV4,
            Droit.VOIR_DIV5,
            Droit.VOIR_DIV6,
        ],
        Taxe:[
            Droit.VOIR_TAXE,
            Droit.VOIR_TAXE_AJOUTER,
            Droit.VOIR_TAXE_MODIFIER,
            Droit.VOIR_TAXE_SUPPRIMER],
        Correction_Stock:[
            Droit.VOIR_CORRECTION_STOCK,
            Droit.VOIR_CORRECTION_STOCK_AJOUTER,
            Droit.VOIR_CORRECTION_STOCK_MODIFIER,
            Droit.VOIR_CORRECTION_STOCK_SUPPRIMER],

        Creance:[
            Droit.VOIR_CREANCE,
            Droit.VOIR_CREANCE_AJOUTER,
            Droit.VOIR_CREANCE_MODIFIER,
            Droit.VOIR_CREANCE_SUPPRIMER,
            Droit.VOIR_CREANCE_PAIEMENT],


        Facture_Client: [
            Droit.AJOUTER_FACTURE_CLIENT,
            Droit.MODIFIER_FACTURE_CLIENT,
            Droit.SUPPRIMER_FACTURE_CLIENT,
            Droit.VOIR_FACTURE_CLIENT,
        ],
        Commande_Client: [
            Droit.AJOUTER_COMMANDE_CLIENT,
            Droit.MODIFIER_COMMANDE_CLIENT,
            Droit.SUPPRIMER_COMMANDE_CLIENT,
            Droit.VOIR_COMMANDE_CLIENT,
        ],
        Facture_Fournisseur: [
            Droit.AJOUTER_FACTURE_FOURNISSEUR,
            Droit.MODIFIER_FACTURE_FOURNISSEUR,
            Droit.SUPPRIMER_FACTURE_FOURNISSEUR,
            Droit.VOIR_FACTURE_FOURNISSEUR,
        ],
        Commande_Fournisseur: [
            Droit.AJOUTER_COMMANDE_FOURNISSEUR,
            Droit.MODIFIER_COMMANDE_FOURNISSEUR,
            Droit.SUPPRIMER_COMMANDE_FOURNISSEUR,
            Droit.VOIR_COMMANDE_FOURNISSEUR,
        ],

        Encaissement: [
            Droit.AJOUTER_ENCAISSEMENT,
            Droit.MODIFIER_ENCAISSEMENT,
            Droit.SUPPRIMER_ENCAISSEMENT,
            Droit.VOIR_ENCAISSEMENT_FACTURE,
        ],

        Versement: [
            Droit.AJOUTER_VERSEMENT,
            Droit.MODIFIER_VERSEMENT,
            Droit.SUPPRIMER_VERSEMENT,
            Droit.VOIR_VERSEMENT,
        ],
        Reception_Achat: [
            Droit.AJOUTER_RECEPTION_ACHAT,
            Droit.MODIFIER_RECEPTION_ACHAT,
            Droit.SUPPRIMER_RECEPTION_ACHAT,
            Droit.VOIR_RECEPTION_ACHAT,
        ],
        Livraison: [
            Droit.AJOUTER_LIVRAISON,
            Droit.MODIFIER_LIVRAISON,
            Droit.SUPPRIMER_LIVRAISON,
            Droit.VOIR_LIVRAISON,
        ],
    Transfert_Stock: [
            Droit.AJOUTER_TRANSFERT_STOCK,
            Droit.MODIFIER_TRANSFERT_STOCK,
            Droit.SUPPRIMER_TRANSFERT_STOCK,
            Droit.VOIR_LISTE_TRANSFERT_STOCK,
        ],
    };


    categories = Object.keys(this.droitsCategorises);
    checkboxList = this.categories.map(category => {
        return {
            label: category,
            // @ts-ignore
            values: this.droitsCategorises[category]
        };
    });


    // this.checkboxList contienne vos catégories actuelles
    groupCategories() {
        // Nombre de colonnes souhaitées
        const grouped = [];
        let currentIndex = 0;

        while (currentIndex < this.checkboxList.length) {
            // @ts-ignore
            grouped.push(this.checkboxList.slice(currentIndex, currentIndex + this.numberOfColumns));
            currentIndex += this.numberOfColumns;
        }
        this.groupedCategories = grouped;
    }




    // la sélection/désélection automatique des éléments de la catégorie
    toggleCategorySelection(event: any, category: any) {
        const isChecked = event.target.checked;
        category.values.forEach((value: any) => {
            if (isChecked && this.droitsSelected!.indexOf(value) === -1) {
                this.droitsSelected!.push(value); // Sélectionner automatiquement les éléments de la catégorie
            } else if (!isChecked && this.droitsSelected!.indexOf(value) !== -1) {
                this.droitsSelected = this.droitsSelected!.filter((selectedValue: any) => selectedValue !== value); // Désélectionner automatiquement les éléments de la catégorie
            }
        });
    }

//  vérifier si tous les éléments de la catégorie sont sélectionnés
    isCategorySelected(category: any) {
        return category.values.every((value: any) => this.droitsSelected!.includes(value));
    }

// sélection/désélection d'un élément individuel
    toggleDroitSelection(event: any) {
        const selectedValue = event.target.value;
        if (event.target.checked && this.droitsSelected!.indexOf(selectedValue) === -1) {
            this.droitsSelected!.push(selectedValue); // Sélectionner l'élément individuel
        } else if (!event.target.checked && this.droitsSelected!.indexOf(selectedValue) !== -1) {
            this.droitsSelected = this.droitsSelected!.filter((value: any) => value !== selectedValue); // Désélectionner l'élément individuel
        }
    }

// vérifier si un élément individuel est sélectionné
    isDroitSelected(value: any) {
        return this.droitsSelected!.includes(value);
    }

    onRowSelect(role: any) {
        this.numberOfColumns=2;
        this.role = role;
        this.isSecondaryActive = true;
        this.droitsSelected = role.droits;
        this.groupCategories();
    }

    constructor(
        protected roleService: RoleService,
        protected router: Router,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        private tokenStorage: TokenStorage,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.display = false;
            this.menuBarBool = false;
            this.droits = this.tokenStorage.getdroits();

            await Promise.all([
                this.loadAll(),
                this.loadItems(),
                this.groupCategories()
            ]);

            this.items = [
                /*{
                    label: 'Importer des articles',
                    icon: 'pi pi-upload',
                    routerLink: ['/fileupload']
                },*/
                {
                    icon: 'pi pi-external-link',
                    label: 'Exporter la fiche'
                }
            ];
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }

    onDisplayDialog() {
        if (this.display) {
            this.display = false;
        } else {
            this.display = true;
            this.role = {};
        }
    }

    add(roleValue: Role) {
        this.numberOfColumns=3;
        console.log(roleValue)
        this.droitsSelected = roleValue.droits;
        console.log(this.droitsSelected);
        if (roleValue === null) {
            this.modal = 'ajouter';
            this.droitsSelected = [];
        } else {
            this.role = roleValue;
            this.modal = 'modifier';
            this.groupCategories();
        }
        this.display = true;
    }

    deleteElement(roleToDelete: Magasin) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (roleToDelete === null) {
                    return;
                } else {

                    if (roleToDelete.id != null) {
                        this.chrgmt = true;
                        this.roleService.delete(roleToDelete.id).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
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


    loadAll() : Promise<void>{
        return new Promise<void>((resolve, reject) => {
        this.loading = true; // Début du chargement
        this.roleService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.roles = res.payload;
                this.loading = false; // Fin du chargement
                resolve(); // résoudre la promesse une fois les paiements chargés
            },
            (error) => {
                this.loading = false; // Fin du chargement en cas d'erreur
                reject(error); // rejeter la promesse en cas d'erreur
            }
            );
        });
    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    annuler() {
        this.display = false;
    }

    closeSection(editform: NgForm) {
        this.display =  false
        this.isSecondaryActive = false
        editform.resetForm()
    }

    save(editForm: NgForm) {
            this.role.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.role.droits = this.droitsSelected;
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer une nouvelle role?',

                accept: () => {

                    this.chrgmt = true;

                    if (this.role?.id) {
                        this.roleService.update(this.role).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                    this.display = false;
                                    this.chrgmt = false;
                                });
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                        editForm.resetForm();
                        this.display = false;
                    } else {
                        this.roleService.save(this.role).subscribe(
                            () => {
                                this.loadAll().then(()=>{
                                    this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                    this.display = false;
                                    this.chrgmt = false;
                                });
                            },
                            () => this.showMessage('error', 'Ajout', 'Echec Ajout !')
                        );
                        editForm.resetForm();
                    }

                }
            });
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };
}
