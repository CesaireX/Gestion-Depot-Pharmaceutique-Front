import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    AchatParArticle,
    Categorie, Dates,
    LigneMagasin,
    Magasin,
    Produit,
    Role,
    Taxe,
    UniteMesure, VenteParArticle
} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {Table} from 'primeng/table';
import {ProduitService} from "../../../store/services/gestock-service/Produit.service";
import {CategorieService} from "../../../store/services/gestock-service/Categorie.service";
import {UniteMesureService} from "../../../store/services/gestock-service/UniteMesure.service";
import {TaxeService} from "../../../store/services/gestock-service/Taxe.service";
import {LigneMagasinService} from "../../../store/services/gestock-service/LigneMagasin.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {Droit} from "../../../store/enum/enums";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {VenteArticleService} from "../../../store/services/gestock-service/etats-gest-service/VenteArticle.service";
import {a} from "@fullcalendar/core/internal-common";
import {PdfService} from "../../../store/services/service-partage/Pdf.service";

@Component({
    selector: 'app-produit',
    templateUrl: './produit.component.html',
    styleUrls: ['./produit.component.scss']
})
export class ProduitComponent implements OnInit {

    tabs = [
        { label: 'Informations générales' },
        // { label: 'Transactions' },
       // { label: 'Stock par magasin' }
    ];
    selectedTab: number | null = 0;
    displayForm: boolean = false;
    produits: Produit[] = [];
    error: any;
    success: any;
    page: any;
    reverse: any;
    display?: Boolean;
    role?: Role;
    droit?: Droit | undefined;
    modal = '';
    menuBarBool?: boolean;
    menuitems: any;
    item: any;
    selectedItem: any = null;
    loading: boolean = true;
    chrgmt: boolean = false;
    produit: Produit = {};
    select: boolean = false;
    seuilAlert=0;
    prixventeht=0;
    selectedMagasin?: Magasin;
    selectedCategorie?: Magasin;
    magasins: Magasin[] = [];
    categories: Categorie[] = [];
    uniteMesures: Categorie[] = [];
    total: number | undefined;
    selectedUniteMesure?: UniteMesure;
    selectedTaxe?: Taxe;
    selectedTaxe2?: Taxe;
    taxes: Taxe[] = [];
    droits: any;
    @ViewChild('filter') filter!: ElementRef;

    stockInitialArray: any[] = [];

    ligneMagasin: LigneMagasin = {};
    searchedMagasin: number | undefined;
    nomMagas = '';
    stockInitial = '';
    ligneMagasins: Array<LigneMagasin> = [];
    magasinNotYetSelected = false;
    verifierStockInitial: number | undefined;
    stockInitial2: number | undefined;
    display2?: Boolean;
    isSecondaryActive = false;
    dateDebut: Date = new Date();
    dateFin: Date = new Date();
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    societyId: number = 0;
    ventes: VenteParArticle[] = [];
    achats: AchatParArticle[] = [];
    // @ts-ignore
    choix: { name: string; }[];
    selectedChoice: any | undefined;
    // @ts-ignore
    items: MenuItem[];

    createormodif = false;
    today1: Date=new Date();

    constructor(
        protected produitService: ProduitService,
        protected magasinService: MagasinService,
        protected categorieService: CategorieService,
        protected uniteMesureService: UniteMesureService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected taxeService: TaxeService,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected ligneService: LigneMagasinService,
        private pdfService : PdfService,
        protected authService: AuthService
    ) {
    }

    ngOnInit() : Promise<void>{
        return new Promise<void>((resolve, reject) => {
            // this.roles=this.authService.role;
            this.droits = this.tokenStorage.getdroits();
            this.chrgmt = true; // Début du chargement
            Promise.all([
                this.loadAll(),
                this.loadItems(),
                this.loadMagasin(),
                this.loadCategorie(),
                this.loadUniteMesure(),
                this.loadtaxes()
            ]).then(() => {
                this.chrgmt = false; // Fin du chargement
                this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
                this.items = [
                    {
                        label: 'Importer des articles',
                        icon: 'pi pi-upload',
                        routerLink: ['/fileupload']
                    },
                    {

                        icon: 'pi pi-external-link',
                        label: 'Exporter la fiche'
                    }
                ];
                resolve();
            }).catch((error) => {
                console.error(error);
                this.chrgmt = false; // Fin du chargement en cas d'erreur
                reject(error);
            });
        });
    };

    async onRowSelect(produit: any) {
        this.selectedItem = produit;
        this.isSecondaryActive = true;
        this.select = true;

        // Attendre que loadLignesMagasinByProduit soit terminé
        await this.loadLignesMagasinByProduit(produit.id);

        // Autres opérations
        // @ts-ignore
        this.choix = [
            { name: 'Vente' },
            { name: 'Achat' }
        ];
        this.selectedChoice = this.choix[0];

        // Définir select sur false
        this.select = false;
    }

    onDisplayDialog2(produit: Produit) {
        if (produit.id != null) {
            this.loadLignesMagasinByProduit(produit.id)
        }
        this.display2 = true;
    }

    onDeleteLigne2(ligneMagasin: any) {
        this.ligneMagasins = this.ligneMagasins.filter((elem: any) => elem !== ligneMagasin);
    }

    add(produitValue: any) {
        if (produitValue === null) {
            this.modal = 'ajouter';
            this.ligneMagasins = [];
            this.produit = {}
            this.selectedCategorie = {};
            this.selectedUniteMesure = {};
            this.createormodif=true;
        } else {
            this.prixventeht=produitValue.prixventeht!;
            this.seuilAlert=produitValue.seuil!;
            if (produitValue.id != null) {
                this.loadLignesMagasinByProduit(produitValue.id);
            }
            this.produit = produitValue;
            console.log(this.produit)
            this.modal = 'modifier';
            //this.selectedMagasin = this.magasins.find(magasin => magasin.id === produitValue.magasinId);
            this.selectedCategorie = this.categories.find(categorie => categorie.id === produitValue.categorieId);
            this.selectedUniteMesure = this.uniteMesures.find(unite => unite.id === produitValue.uniteMesureId);
            this.selectedTaxe = this.taxes.find(taxe => taxe.id === produitValue.taxeventeId);
            this.selectedTaxe2 = this.taxes.find(taxe => taxe.id === produitValue.taxeachatId);

            this.caluclTotal();
            this.createormodif=false;
        }
        this.displayForm = true;
    }

    selectTab(index: number) {
        this.selectedTab = index;
    }

    deleteElement(produitToDelete: Produit) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (produitToDelete === null) {
                    return;
                } else {

                    if (produitToDelete.id != null) {
                            this.produitService.delete(produitToDelete.id).subscribe(
                                async () => {
                                    this.loadAll();
                                    this.isSecondaryActive = false
                                    this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                                },
                                () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression, Veuillez verifier si l\'article n\'est pas utilisé dans une opération !')
                            );
                    }
                }
            }
        });
    }

    onDeleteLigne(ligneMagasin: LigneMagasin, id: number) {
        console.log("okkk")
        //this.supLigneMagasin = true;
        this.confirmationService.confirm({
            header: 'SUPPRESSION',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (ligneMagasin.id != null) {
                    this.ligneService.delete(ligneMagasin.id).subscribe(value => {
                        this.loadLignesMagasinByProduit(id);
                        this.messageService.add({
                            severity: "success",
                            summary: "",
                            detail: "Besoin supprimer avec succès",
                            life: 5000
                        });
                    });
                }
            }
        });
    }

    loadAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
        this.loading = true; // Début du chargement
        this.produitService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.produits = res.payload;
                this.loading = false; // Fin du chargement
                resolve(); // résoudre la promesse une fois les factures chargées

            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
        );
        });
    }



    loadMagasin() {
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
                if (this.magasins && this.magasins.length > 0) {
                    this.selectedMagasin = this.magasins[0];
                    this.onMagasinChange({ value: this.selectedMagasin });
                }
            }
        );
    }


    loadLignesMagasinByProduit(id: number) {
        this.ligneService.findAllByBesoin(id).subscribe(
            resp => {
                console.log(resp.payload)
                this.ligneMagasins = resp.payload;
            }
        )
    }

    loadCategorie() {
        this.categorieService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.categories = res.payload;
            }
        );
    }

    loadUniteMesure() {
        this.uniteMesureService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.uniteMesures = res.payload;
            }
        );
    }

    loadtaxes() {
        this.taxeService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.taxes = res.payload;
            }
        );
    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    exportProduitsListPDF() {
        const data = this.produits.map(produit => ({
            'Catégorie': produit.categorieLibelle || '',
            Désignation: produit.nom || '',
            'Seuil': this.formatCurrency(produit.seuil!) || '',
            'Unité': produit.uniteMesureLibelle || '',
            'Prix': this.formatCurrency(produit.prixventettc!) + ' FCFA' || '',
        }));

        const headers = ['Catégorie', 'Désignation', 'Seuil', 'Unité', 'Prix'];
        const title = 'Liste des Produits';

        let dateInfo = {};
        dateInfo = { day: this.today1 };

        this.pdfService.exportPDF(data, headers, title, 'liste_des_produits', dateInfo);
    }

    formatCurrency(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    private performSaveOperation(saveFunction: () => Promise<void>): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    await saveFunction();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 1000); // Délai de 1 seconde avant de résoudre la promesse
        });
    }

    SaveChoice(editForm: NgForm, choix: string){
        if(choix === 'continuer'){
            this.display = true;
            this.save(editForm);
        }else{
            this.display = false;
            this.save(editForm);
        }
    }

    async save(editForm: NgForm) {
        this.produit.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        if (!this.ifExist()) {
            this.produit.categorieId = this.selectedCategorie?.id;
            this.produit.uniteMesureId = this.selectedUniteMesure?.id;
            this.produit.ligneMagasinDTOS = this.ligneMagasins;
            this.produit.prixachatht = this.prixventeht;
            this.produit.prixventeht=this.prixventeht;
            this.produit.prixachatttc = this.prixventeht;
            this.produit.prixventettc=this.prixventeht;
            this.produit.seuil=this.seuilAlert;
            console.log(this.produit);

            try {
                this.chrgmt = true;  // Affiche le spinner

                if (this.produit?.id) {
                    const id = this.produit?.id;
                    await this.performSaveOperation(async () => {
                        await new Promise((resolve, reject) => {
                            this.produitService.update(this.produit).subscribe(
                                async (value) => {
                                    this.loadAll().then(() => {
                                        // @ts-ignore
                                        this.produit = this.produits.find(p=>p.id == id)
                                        this.onRowSelect(this.produit)
                                        this.chrgmt = false;
                                        this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                        // @ts-ignore
                                        if (this.produit?.listeLigneMagasin) {
                                            // @ts-ignore
                                            this.produit.listeLigneMagasin.forEach(element1 => {
                                                this.ligneService.update(element1).subscribe(Value1 => {
                                                    console.log(Value1);
                                                });
                                            });
                                        }
                                    });

                                    resolve(null);
                                },
                                () => {
                                    this.showMessage('error', 'Modification', 'Article modifié!');
                                    reject(new Error('Echec de Modification'));
                                }
                            );
                        });
                    });
                    editForm.resetForm();
                } else {
                    await this.performSaveOperation(async () => {
                        await new Promise((resolve, reject) => {
                            this.produitService.save(this.produit).subscribe(
                                async () => {
                                    await this.loadAll();
                                    this.isSecondaryActive = false
                                    this.showMessage('success', 'Enregistrement', 'Article ajouté!');
                                    editForm.resetForm();
                                    this.ligneMagasins = []
                                    resolve(null);
                                },
                                () => {
                                    this.showMessage('error', 'Ajout', 'Echec Ajout !');
                                    reject(new Error('Echec Ajout'));
                                }
                            );
                        });
                    });
                }
            } catch (error) {
                console.error(error);
            }finally {
                this.chrgmt = false;

                if(this.display){
                    this.display = false
                }else{
                    this.display = false
                    this.displayForm = false;
                }
            }
        } else {
            this.showMessage('error', 'ENREGISTREMENT', 'Un produit portant le même nom existe déjà !');
        }
    }

    ifExist(): boolean {
        if (this.produit.id) {
            return this.produits.some(
                value =>
                    value.id !== this.produit.id &&
                    value.nom === this.produit.nom);
        } else {
            return this.produits.some(value => value.nom === this.produit.nom);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Detail',
                    icon: 'pi pi-eye',
                    command: ($event: any) => {
                        this.onDisplayDialog2(this.selectedItem);
                    }
                },
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('SUPPRIMER_PRODUIT'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_PRODUIT'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };


    ajouterLigneBesoin(): void {
        this.checkLigneMagasin();
        this.searchedMagasin = 0;
        this.stockInitial = '';
        this.nomMagas = '';
        this.selectedMagasin = {};
        this.loadMagasin();
    }
    changeStockInitial2(event: any, ligneMagasin: any) {
        const newValue = event.value;
        if (ligneMagasin != null) {
            // @ts-ignore
            this.ligneMagasins.forEach((element2: { magasinId: number, stockInitial: number }) => {
                if (ligneMagasin.magasinId === element2.magasinId) {
                    element2.stockInitial = newValue; // Mettre à jour la valeur dans le tableau.
                }
            });
        }
    }

    onMagasinChange(event: any) {
        this.verifierStockInitial=0;
        // @ts-ignore
        this.searchedMagasin = this.selectedMagasin.id;
        // @ts-ignore
        this.nomMagas = this.selectedMagasin.nom ? this.selectedMagasin.nom : '';
    }

    verifierInitialStock(event : any) {
        this.verifierStockInitial = event.value;
    }

    private checkLigneMagasin(): void {
        const ligneMagasinExist = this.ligneMagasins.find(lig => lig.magasinNom === this.nomMagas);
        if (ligneMagasinExist) {
            this.ligneMagasins.forEach(lig => {
                if (lig && lig.magasinNom === this.nomMagas) {
                    if (lig.stockInitial) {
                        lig.stockInitial = lig.stockInitial + +this.stockInitial;
                    }
                }
            });
        } else {
            const ligne: LigneMagasin = {
                magasinId: this.searchedMagasin,
                magasinNom: this.nomMagas,
                stockInitial: +this.stockInitial,
            };
            this.ligneMagasins.push(ligne);
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    caluclTotal() {

        // const prix  = this.produit.prixttc  ;
        // //const quantite  = this.produit.quantite ;
        // if(prix != null && quantite!= null){
        //     const total  = prix * quantite ;
        //     this.total = total;
        // }
        //
        // console.log("prix", prix);
        // console.log("quantite", quantite);
        // console.log("total", this.total);
    }
    apply_ttc(event: any, statut: string) {
        const prix = event.value;

        if(statut==='vente'){
            if (this.selectedTaxe) {
                const taxe = this.selectedTaxe.hauteur;
                if (prix != null && taxe) {
                    this.produit.prixventettc = Math.ceil((prix) + (prix * (taxe / 100)));
                }
            } else {
                this.produit.prixventettc = event.value;
            }
        }else{
            if (this.selectedTaxe2) {
                const taxe = this.selectedTaxe2.hauteur;
                if (prix != null && taxe) {
                    this.produit.prixachatttc = Math.ceil((prix) + (prix * (taxe / 100)));
                }
            } else {
                this.produit.prixachatttc = event.value;
            }
        }
    }

    closeSection(editForm:any) {
        this.displayForm =  false;
    }

    close(){
        this.isSecondaryActive = false;
    }
}
