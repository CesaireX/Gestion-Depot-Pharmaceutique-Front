import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    CorrectionStock,
    Magasin,
    Produit
} from "../../../store/entities/gestock.entity";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {CorrectionStockService} from "../../../store/services/gestock-service/CorrectionStock.service";
import {Table} from 'primeng/table';
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {ProduitService} from "../../../store/services/gestock-service/Produit.service";
import {LigneMagasinService} from "../../../store/services/gestock-service/LigneMagasin.service";

@Component({
    selector: 'app-correctionStock',
    templateUrl: './correctionStock.component.html',
    styleUrls: ['./correctionStock.component.scss']
})
export class CorrectionStockComponent implements OnInit {

    correctionStocks: CorrectionStock[] = [];
    error: any;
    success: any;
    page: any;
    reverse: any;
    display?: Boolean;
    modal = '';
    menuBarBool?: boolean;
    menuitems: any;
    item: any;
    selectedItem: any = null;
    loading: boolean = true;
    chrgmt: boolean = false;
    correctionStock: CorrectionStock = {};
    droits: any;
    produits: Produit[] = [];
    produitSelected?: Produit | null;
    magasins: Magasin[] = [];
    magasinSelected?: Magasin | null;
    items: MenuItem[] | undefined;
    isSecondaryActive = false;
    currentdate: Date = new Date();
    @ViewChild('filter') filter!: ElementRef;
     //diff: number=0;
    display2?: boolean;
    type?: string;
    datePeremption: Date = new Date();

    constructor(
        protected correctionStockService: CorrectionStockService,
        protected magasinService: MagasinService,
        protected produitService: ProduitService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
        protected ligneMagasinService : LigneMagasinService,
        protected route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.droits = this.tokenStorage.getdroits();
        this.loadItems()
        this.loadAllMagasin();
        this.route.queryParams.subscribe(params => {
            this.type = params['type']||'CORRECTION';
            if (this.type === 'PERIME') {
                this.loadExpiredProducts();
            }else {
                this.loadAll();
            }
        });
    }


    onDisplayDialog(correctionStocktocheck?: CorrectionStock, isDetail?: boolean) {
        if (this.display) {
            this.display = false;
        } else {
            this.display = true;
            this.correctionStock = {};
        }
    }

    add(correctionStockValue: CorrectionStock) {
        this.display2 = true;
    }


    deleteElement(correctionStockToDelete: CorrectionStock) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir annuler cette correction de Stock ?',
            accept: () => {
                if (correctionStockToDelete === null) {
                    return;
                } else {

                    if (correctionStockToDelete.id != null) {
                        this.correctionStockService.update(correctionStockToDelete).subscribe(
                            () => {
                                if (this.type === 'PERIME') {
                                    this.loadExpiredProducts();
                                }else {
                                    this.loadAll();
                                }
                                this.isSecondaryActive=false;
                                this.showMessage('success', 'ANNULATION', 'Annulation effectuée avec succès !');
                            },
                            () => this.showMessage('error', 'ANNULATION', 'Echec de l\'Annulation car la correction !')
                        );
                    }
                }
            }
        });
    }


    loadAll() {
        this.loading = true;
        this.correctionStockService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.correctionStocks = res.payload;
                this.loading = false; // Début du chargement
            },
            (error) => {
                console.error(error);
                this.loading = false;
            }
            );
    }

    loadExpiredProducts(){
        this.loading = true;
        this.correctionStockService.getExpiredProducts(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.correctionStocks = res.payload;
                this.loading = false;
            },
            (error) => {
                console.error(error);
                this.loading = false;
            }
        );
    }


    loadAllMagasin() {
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
                if (this.magasins && this.magasins.length > 0) {
                    this.magasinSelected = this.magasins[0];
                    this.loadProductByMagasin();
                }
            }
        );
    }
   loadProductByMagasin() {
        this.produitSelected=null;
       this.correctionStock.diff=0;

       this.correctionStock.stockTheorique=0;
       this.correctionStock.stockPhysique=0;
       if (this.magasinSelected){
           this.produitService.getProductOfmagasin(this.magasinSelected?.id!, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
               (res) => {
                   this.produits = res.payload;
               }
           );
       }
    }

    closeSection(editform: NgForm) {
        this.display =  false
        editform.resetForm()
    }

    onRowSelect(corro: any) {
        console.log(corro);
        this.selectedItem = corro;
        this.isSecondaryActive=true;
    }

    stokckTheorique(){
        // @ts-ignore
        this.correctionStock.diff=null;
        // @ts-ignore
        this.correctionStock.stockPhysique=null;
        // @ts-ignore
        this.correctionStock.stockTheorique=null;
        this.produitSelected?.ligneMagasinDTOS?.forEach(value => {
            if(value.magasinId==this.magasinSelected?.id && value.produitId==this.produitSelected?.id){
                // @ts-ignore
                this.correctionStock.stockTheorique += value.stock_physique_dispo;
            }
        })
        //this.calculDif()
    }

    stockTheorique() {
        if (this.produitSelected && this.magasinSelected) {
            const productId = this.produitSelected.id!;
            const magasinId = this.magasinSelected.id!;

            this.ligneMagasinService.findByProductAndMagasin(productId, magasinId).subscribe(
                response => {
                    this.correctionStock.stockTheorique = 0; // Reset stockTheorique
                    // @ts-ignore
                       const ligne = response.payload
                        this.correctionStock.stockTheorique! += ligne.stock_physique_dispo!;

                    // Vous pouvez également appeler this.calculDif() ici si nécessaire
                },
                error => {
                    console.error('Erreur lors de la récupération des lignes de magasin:', error);
                }
            );
        }
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

    save(editForm: NgForm) {
        this.correctionStock.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.correctionStock.magasinId = this.magasinSelected?.id;
        this.correctionStock.produitId = this.produitSelected?.id;
        if (this.type === 'PERIME') {
            this.correctionStock.productExpired=true;
        }else {
            this.correctionStock.productExpired=false;
        }
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer un nouvel correctionStock?',

                accept: () => {
                    this.chrgmt = true;
                        this.correctionStockService.save(this.correctionStock).subscribe(
                            () => {
                                if (this.type === 'PERIME') {
                                    this.loadExpiredProducts();
                                }else {
                                    this.loadAll();
                                }
                                this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                this.display = false;
                                this.chrgmt = false;
                                editForm.resetForm();
                            },

                            () => this.showMessage('error', 'Ajout', 'Echec Ajout !')
                        );
                }
            });
    }

    ifExist(): boolean {
        if (this.correctionStock.id) {
            return this.correctionStocks.some(
                value =>
                    value.id !== this.correctionStock.id
            );
        } else {
            return this.correctionStocks.some(value => value.id === this.correctionStock.id);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'ANNULER',
                    icon: 'pi pi-times',
                    disabled:!this.droits.includes('VOIR_CORRECTION_STOCK_SUPPRIMER'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Detail',
                    icon: 'pi pi-eye',
                    disabled:!this.droits.includes('VOIR_CORRECTION_STOCK_MODIFIER'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };


    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    calculDif(event:any) {
        this.correctionStock.diff=0;
        if (this.type === 'PERIME'){
            // @ts-ignore
            this.correctionStock.diff = this.correctionStock.stockTheorique - event.value;

        }else {
            if (this.produitSelected){
                // @ts-ignore
                this.correctionStock.diff = event.value - this.correctionStock.stockTheorique;
            }
        }

    }
    calculDif1() {
        this.correctionStock.diff=0;
        if (this.type === 'PERIME'){
            // @ts-ignore
            this.correctionStock.diff = this.correctionStock.stockTheorique - this.correctionStock.qtePerime;
        }else{
            if (this.produitSelected){
                // @ts-ignore
                this.correctionStock.diff = this.correctionStock.stockPhysique - this.correctionStock.stockTheorique;
            }
        }
    }
    getSeverity(correctionStock:CorrectionStock): string {
        // @ts-ignore
        if(correctionStock?.diff<0){
            return 'danger';
            // @ts-ignore
        }else if (correctionStock?.qtePerime>0){
            return 'danger';
        }
        else{
            return 'success';
        }
    }

    clearDropdown() {
        if (!this.produitSelected){

        }
    }
}
