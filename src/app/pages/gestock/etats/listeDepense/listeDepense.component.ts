import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Dates,
    EtatDepense,
    Produit,
} from "../../../../store/entities/gestock.entity";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {ListeDepenseService} from "../../../../store/services/gestock-service/etats-gest-service/ListeDepense.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './listeDepense.component.html',
    styleUrls: ['./listeDepense.component.scss']
})
export class ListeDepenseComponent implements OnInit {

    listeDepenses: EtatDepense[] = [];
    listeDepense: EtatDepense = {};
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
    today1: Date=new Date();
    today: string | null;

    articleselected: Produit | undefined |null;
    exportColumns!: ExportColumn[];
    @ViewChild('filter') filter!: ElementRef;

    selectedPeriod: Date[]=[];

    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    total : number | undefined;
    societyId: number = 0;
    constructor(
        protected listeDepenseService: ListeDepenseService,
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
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.getlisteDepense();
        this.loadArticle();

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
        };

        this.listeDepenseService.generateReport(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
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

    getlisteDepense(): void {
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
            entityId2:  this.societyId,
        };

        this.listeDepenseService.postlisteDepense(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {

                this.listeDepenses = resp.payload;
                console.log(this.listeDepenses)
                this.loading = false; // Fin du chargement
            },
            error => {
                console.error('Erreur lors de la récupération des Depenses :', error);
                this.loading = false; // Fin du chargement
            }
        );
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.listeDepenses.map((listeDepense) => {
                return {
                    Date: listeDepense.dateDepense,
                    NatureDepense: listeDepense.natureDepense,
                    Beneficaire: listeDepense.nomBeneficiaire,
                    Montant: listeDepense.montant,
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
    calculateTotal(): number {
        // Calculez le total des montants dans listeDepenses
        return this.listeDepenses.reduce((sum, depense) => {
            return sum + (depense.montant ? depense.montant : 0); // Vérifiez si le montant existe
        }, 0);
    }

    formatDate(dateArray: number[]): string {
        const [year, month, day] = dateArray;
        const formattedDay = day.toString().padStart(2, '0');
        const formattedMonth = (month).toString().padStart(2, '0'); // Les mois sont indexés à partir de 0
        return `${formattedDay}/${formattedMonth}/${year}`;
    }

    formatCurrency(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

    exportPDF() {
        const data = this.listeDepenses.map(depense => ({
            // @ts-ignore
            Date: this.formatDate(depense.dateDepense) || '',
            Nature: depense.natureDepense || '',
            Bénéficaire: depense.nomBeneficiaire || '',
            Montant: this.formatCurrency(depense.montant!) || 0
        }));

        const headers = ['Date', 'Nature', 'Bénéficaire', 'Montant'];
        const title = 'Liste des Dépenses';
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
        this.pdfService.exportPDF(data, headers, title, 'liste_depenses',dateInfo, totals);
    }
    exportPdf() {
        const doc = new jsPDF('l', 'mm', 'a4');

        const head = [['Date',
            'NatureDepense','Beneficaire','Montant']];

        autoTable(doc, {
            head: head,
            body: this.toPdfFormat(),
            didDrawCell: (data) => { },
        });
        doc.save('listeDepense.pdf');
    }
    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.listeDepenses.length; i++) {
            // @ts-ignore
            data.push([
                this.listeDepenses[i].dateDepense|| '',
                this.listeDepenses[i].natureDepense|| '',
                this.listeDepenses[i].nomBeneficiaire|| '',
                this.listeDepenses[i].montant|| '',
            ]);
        }
        return data;
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

    onPeriodChange() {
        this.listeDepenses = [];
    }

    onDateChange() {
        this.listeDepenses = [];
    }
}
