import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {Dates, Produit, AchatParArticle} from "../../../../store/entities/gestock.entity";
import {AchatArticleService} from "../../../../store/services/gestock-service/etats-gest-service/AchatArticle.service";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './achatParArticle.component.html',
    styleUrls: ['./achatParArticle.component.scss']
})
export class AchatParArticleComponent implements OnInit {

    achats: AchatParArticle[] = [];
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
    articles: Produit[]=[];
    articleselected: Produit | undefined |null;
    today1: Date=new Date();
    today: string|null;
    exportColumns!: ExportColumn[];
    @ViewChild('filter') filter!: ElementRef;

    selectedPeriod: Date[]=[];
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    societyId: number = 0;
     total: number=0;

    constructor(
        protected achatArticleService: AchatArticleService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected articleService:ProduitService,
        protected datePipe: DatePipe,
        private pdfService: PdfService
    ) {
        this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.checkValue();
        this.getAchatByArticle();
        this.loadArticle();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
    }

    loadArticle() {
        this.articleService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.articles = res.payload;
            }
        );
    }



    checkValue() {
        if (this.check==0){
            this.selectedPeriod = [];
            this.dateJournee = new Date();
        }else {
            this.dateJournee = undefined!;
            this.selectedPeriod = [];
        }
    }


    getAchatByArticle(): void {
        this.loading = true; // Début du chargement
                // Ajuster la date de fin à 23h59m59s si une période est sélectionnée
        let adjustedDateFin = this.selectedPeriod[1];
        if (adjustedDateFin) {
            adjustedDateFin = new Date(adjustedDateFin);
            adjustedDateFin.setHours(23, 59, 59, 999); // Mettre l'heure à 23:59:59
        }

        const dates: Dates = {
            dateDebut: this.selectedPeriod[0],
            dateFin: adjustedDateFin,
            dateJournee: this.dateJournee,
            entityId:  this.articleselected?.id,
            //societyId:this.societyId,
        };
        this.achatArticleService.achatArticle(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {
                this.achats = resp.payload;
                this.loading = false; // Fin du chargement
            },
            error => {
                console.error('Erreur lors de la récupération des achats :', error);
                this.loading = false; // Fin du chargement
            }
        );
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.achats.map((achat) => {
                return {
                    Désignation: achat.nomProduit,
                    Quantité: achat.quantiteAchetee,
                    Unité: achat.unite,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'achats');
        });
    }

    formatCurrency(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    calculateTotal() {
        return this.achats.reduce((total, achat) => total + (achat.montant || 0), 0);
    }

    exportPDF() {
        const data = this.achats.map(achat => ({
            Désignation: achat.nomProduit || '',
            // @ts-ignore
            Quantité: this.formatCurrency(achat.quantiteAchetee) || 0,
            Unité: achat.unite || '',
            Montant: this.formatCurrency(achat.montant!) || 0
        }));

        const headers = ['Désignation', 'Quantité', 'Unité', 'Montant'];
        const title = 'Achats par Article';
        this.total = this.calculateTotal(); // Calculer le total
        const totals = {
            'Total': this.formatCurrency(this.total)
        };
        let dateInfo = {};
        if (this.dateJournee) { // Jour
            dateInfo = { day: this.dateJournee };
        } else if (this.selectedPeriod) { // Période
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        }

        this.pdfService.exportPDF(data, headers, title, 'achats_par_article',dateInfo, totals);
    }


saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
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



    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    currentdate: any;
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    changeProduct() {
        this.achats = [];
    }

    onPeriodChange() {
        this.achats = [];
    }

    onDateChange() {
        this.achats = [];
    }
}
