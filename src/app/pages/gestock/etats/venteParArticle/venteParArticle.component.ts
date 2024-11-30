import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {Dates, Produit, VenteParArticle} from "../../../../store/entities/gestock.entity";
import {VenteArticleService} from "../../../../store/services/gestock-service/etats-gest-service/VenteArticle.service";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import html2pdf from 'html2pdf.js';
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './venteParArticle.component.html',
    styleUrls: ['./venteParArticle.component.scss']
})
export class VenteParArticleComponent implements OnInit {

    ventes: VenteParArticle[] = [];
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
    today: string|null;    exportColumns!: ExportColumn[];
    @ViewChild('filter') filter!: ElementRef;

    selectedPeriod: Date[]=[];
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    societyId: number = 0;
    chrgmt: boolean = false;
    constructor(
        protected venteArticleService: VenteArticleService,
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
        this.getVenteByArticle();
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

    reportTojasper(){
        this.loading = true;
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
            entityId2:this.societyId,
        };
        this.venteArticleService.generateReport(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });
    }

    startPdf(){
        const element = document.getElementById('sort');

        // Obtient l'heure actuelle
        const now = new Date();
        const date = now.getDate();
        const heures = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const secondes = now.getSeconds().toString().padStart(2, '0');

        // Formate le nom du fichier
        const nomFichierPDF = `VenteArticle N° ${date}- ${heures}-${minutes}-${secondes}.pdf`;

        const options = {
            filename: nomFichierPDF // Utilisez le nom de fichier formaté
        };

        html2pdf()
            .from(element)
            .set(options)
            .save()
            .then(() => {
                this.chrgmt = false; // Cache l'indication de chargement après la sauvegarde
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                this.chrgmt = false; // Cache l'indication de chargement même en cas d'erreur
            });
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


    getVenteByArticle(): void {
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
        this.venteArticleService.venteArticle(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {
                this.ventes = resp.payload;
                this.loading = false; // Fin du chargement
            },
            error => {
                console.error('Erreur lors de la récupération des ventes :', error);
                this.loading = false; // Fin du chargement
            }
        );
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.ventes.map((vente) => {
                return {
                    Désignation: vente.nomProduit,
                    Quantité: vente.quantiteVendue,
                    Unité: vente.unite,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'ventes');
        });
    }


    formatCurrency(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


    calculateTotal() {
        return this.ventes.reduce((total, vente) => total + (vente.montant || 0), 0);
    }

    exportPDF() {
        const data = this.ventes.map(vente => ({
            Désignation: vente.nomProduit || '',
            // @ts-ignore
            Quantité: this.formatCurrency(vente.quantiteVendue!) || 0,
            Unité: vente.unite || '',
            // @ts-ignore
            Montant: this.formatCurrency(vente.montant!)  || 0 // Valeur brute pour le calcul du total
        }));

        const headers = ['Désignation', 'Quantité', 'Unité', 'Montant'];
        const title = 'Ventes par Article';
        const total = this.calculateTotal(); // Calculer le total
        const totals = {
            'Total': this.formatCurrency(total)
        };
        let dateInfo = {};
        if (this.dateJournee) { // Jour
            dateInfo = { day: this.dateJournee };
        } else if (this.selectedPeriod) { // Période
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        }
        this.pdfService.exportPDF(data, headers, title, 'ventes_article',dateInfo, totals);
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
        this.ventes = [];
    }

    onPeriodChange() {
        this.ventes = [];
    }

    onDateChange() {
        this.ventes = [];
    }
}
