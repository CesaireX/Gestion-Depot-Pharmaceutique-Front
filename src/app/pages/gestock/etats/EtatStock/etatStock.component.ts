import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import {Dates, EtatStock} from "../../../../store/entities/gestock.entity";
import {InventaireService} from "../../../../store/services/gestock-service/Inventaire.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";

interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './etatStock.component.html',
    styleUrls: ['./etatStock.component.scss']
})
export class EtatStockComponent implements OnInit {

    etatStocks: EtatStock[] = [];
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
    selectedStockType: string = 'stock_physique_dispo'; // Default selected stock type
    today1: Date=new Date();
    today: string|null;
    exportColumns!: ExportColumn[];
    etatStock: EtatStock = {};
    selectedPeriod: Date[]=[];
    check = 0;
    dateJournee: Date = new Date();
    @ViewChild('filter') filter!: ElementRef;

    constructor(
        protected inventaireService: InventaireService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected datePipe: DatePipe,
        private pdfService: PdfService
    ) {
        this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
    }


    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.getEtatStock();
        this.checkValue();
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
    onPeriodChange() {
        this.etatStocks = [];
    }

    onDateChange() {
        this.etatStocks = [];
    }

    getEtatStock(){
        let adjustedDateFin = this.selectedPeriod[1];
        if (adjustedDateFin) {
            adjustedDateFin = new Date(adjustedDateFin);
            adjustedDateFin.setHours(23, 59, 59, 999); // Mettre l'heure à 23:59:59
        }

        const dates: Dates = {
            dateDebut: this.selectedPeriod[0],
            dateFin: adjustedDateFin,
            //dateJournee: this.dateJournee,
            dateJournee: undefined,
        };

        this.loading = true; // Début du chargement
        this.inventaireService.getEtatStock(JSON.parse(this.tokenStorage.getsociety()!), dates).subscribe(
            (resp: { payload: EtatStock[]; }) => {
                this.etatStocks = resp.payload;
                console.log(this.etatStocks)
                this.loading = false; // Fin du chargement
                // console.log(this.etatStocks)
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
    }

    getMagasinNoms(): string[] {
        const magasinNoms: string[] = [];

        this.etatStocks.forEach((produit: any) => {
            produit.magasinStockList.forEach((magasin: any) => {
                if (!magasinNoms.includes(magasin.magasinNom)) {
                    magasinNoms.push(magasin.magasinNom);
                }
            });
        });

        return magasinNoms;
    }

    reportTojasper(){
        this.loading = true;
        this.inventaireService.generateReport(this.etatStocks, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });
    }

    // Méthode pour obtenir la quantité du produit par rapport à un magasin donné
    getQuantiteByMagasin(produit: any, magasin: string, stockType: string): number {
        const magasinData = produit.magasinStockList.find((m: any) => m.magasinNom === magasin);
        if (!magasinData) {
            return 0;
        }
        switch (stockType) {
            case 'stock_physique_dispo':
                return magasinData.stock_physique_dispo;
            case 'stock_physique_dispo_vente':
                return magasinData.stock_physique_dispo_vente;
            case 'stock_physique_engage':
                return magasinData.stock_physique_engage;
            default:
                return 0;
        }
    }

    exportExcel() {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.etatStocks.map(etatstock => {
            return {
                'Désignation': etatstock.produitNom,
                ...this.getMagasinNoms().reduce((acc, magasin) => {
                    acc[magasin] = this.getQuantiteByMagasin(etatstock, magasin, this.selectedStockType);
                    return acc;
                }, {}),
                'Total': this.getStockTotal(etatstock),
                'Unité': etatstock.unite
            };
        }));

        // Récupérer la date actuelle et la formater
        const today = new Date();
        const formattedDate = today.toLocaleDateString('fr-FR');

        // Ajouter une ligne avec la date au début de la feuille
        XLSX.utils.sheet_add_aoa(ws, [[`Etat du stock le ${formattedDate}`]], { origin: 'A1' });

        // Ajuster la position des données existantes pour décaler après la date
        XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 }); // Insertion d'une ligne vide après la date

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Etat_Stock');

        XLSX.writeFile(wb, `etat_stock_${formattedDate}.xlsx`);
    }


    // Méthode pour obtenir le titre en fonction de selectedStockType
    getTitle() {
        switch (this.selectedStockType) {
            case 'stock_physique_dispo':
                return 'Etat du Stock Physique Disponible';
            case 'stock_physique_dispo_vente':
                return 'Etat du Stock Physique Disponible à la Vente';
            case 'stock_physique_engage':
                return 'Etat du Stock Physique Engagée';
            default:
                return 'Etat du Stock';
        }
    }

    formatCurrency(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


    exportPDF() {
        const data = this.etatStocks.map((etatstock) => ({
            Désignation: etatstock.produitNom,
            ...this.getMagasinNoms().reduce((acc, magasin) => {
                acc[magasin] = this.formatCurrency(this.getQuantiteByMagasin(etatstock, magasin, this.selectedStockType));
                return acc;
            }, {}),
            Total: this.formatCurrency(this.getStockTotal(etatstock)),
            Unité: etatstock.unite
        }));

        const headers = ['Désignation', ...this.getMagasinNoms(), 'Total', 'Unité'];
        const title = this.getTitle();
        let dateInfo = {};
        dateInfo = { day: this.today1 };
        this.pdfService.exportPDF(data, headers, title, 'etat_stock',dateInfo);
    }

    exportPDFju() {
        const doc = new jsPDF();

        // Récupérer la date actuelle et la formater
        const today = new Date();
        const formattedDate = today.toLocaleDateString('fr-FR');

        const head = [['Désignation', ...this.getMagasinNoms(), 'Total', 'Unité']];
        const body = this.etatStocks.map((etatstock) => [
            etatstock.produitNom,
            ...this.getMagasinNoms().map(magasin => this.getQuantiteByMagasin(etatstock, magasin, this.selectedStockType)),
            this.getStockTotal(etatstock),
            etatstock.unite
        ]);
        const title = this.getTitle();
        doc.autoTable({
            head: head,
            body: body,
            margin: { top: 30 }, // Ajuster la marge pour faire de la place pour le titre
            didDrawPage: (data) => {
                // Centrer et souligner le titre
                doc.setFont('helvetica', 'bold'); // Utilisez 'bold' ou 'normal' en fonction de votre besoin
                const pageWidth = doc.internal.pageSize.getWidth();
                const titleText = `${title} du ${formattedDate}`;
                const textWidth = doc.getTextWidth(titleText);
                const textX = (pageWidth - textWidth) / 2;

                doc.text(titleText, textX, 20);
                doc.setLineWidth(0.5); // épaisseur de la ligne
                doc.line(textX, 22, textX + textWidth, 22); // dessiner la ligne sous le texte
            }
        });

        doc.save('etat_stock.pdf');
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




    // Fonction pour obtenir le stock total en fonction du type sélectionné
    getStockTotal(etatstock: any): number {
        switch (this.selectedStockType) {
            case 'stock_physique_dispo':
                return etatstock.stock_dispo_total;
            case 'stock_physique_dispo_vente':
                return etatstock.stock_dispo_vente_total;
            case 'stock_physique_engage':
                return etatstock.stock_dispo_engage_total;
            default:
                return 0;
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







    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
