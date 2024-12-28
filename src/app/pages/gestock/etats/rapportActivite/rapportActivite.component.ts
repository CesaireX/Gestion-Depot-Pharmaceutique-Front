import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Dates,
    Produit, RapportActivite,
} from "../../../../store/entities/gestock.entity";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {RapportActiviteService} from "../../../../store/services/gestock-service/etats-gest-service/RapportActivite.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './rapportActivite.component.html',
    styleUrls: ['./rapportActivite.component.scss']
})
export class RapportActiviteComponent implements OnInit {

    rapportActivites: RapportActivite[] = [];
    rapportActivite: RapportActivite = {};
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
    exportColumns!: ExportColumn[];
    cols: any[] = [];
    societyId: number = 0;
    @ViewChild('filter') filter!: ElementRef;

    dateDebut: Date = new Date();
    dateFin: Date = new Date();
   selectedPeriod: Date[]=[];
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    montantDepense : number | undefined;
    montantEncaisse : number | undefined;
    montantVente : number | undefined;
    reste : number | undefined;
    credit : number | undefined;
    totalCredit : number | undefined;
    etat : number | undefined;
    today1: Date=new Date();
    today: string|null;

    selectedType: string = 'rapport';


    constructor(
        protected rapportActiviteService: RapportActiviteService,
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
        this.getRapport();
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
            this.selectedPeriod=[];
            this.dateJournee = new Date();
        }else {
            this.dateJournee = undefined!;
            this.selectedPeriod=[];
        }
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

        this.rapportActiviteService.generateReport(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });
    }

    reportTojasper2(){

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

        this.rapportActiviteService.generateReport2(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }


    formatCurrency(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    exportPDF() {
        const data = [
            {
                "Ventes (FCFA)": this.formatCurrency(this.rapportActivite.montantVente || 0),
                // "Montant Encaissé": this.formatCurrency(this.rapportActivite.montantEncaisse || 0),
                "Dépenses (FCFA)": this.formatCurrency(this.rapportActivite.montantDepense || 0),
                "Reste (FCFA)": this.formatCurrency((this.rapportActivite.montantVente!-this.rapportActivite.montantDepense!) || 0 || 0)
            }
        ];
        let dateInfo = {};
        if (this.dateJournee) { // Jour
            dateInfo = { day: this.dateJournee };
        } else if (this.selectedPeriod) { // Période
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        }
        const headers = ['Ventes (FCFA)', 'Dépenses (FCFA)', 'Reste (FCFA)'];
        const title = 'Rapport Activité';

        if (this.selectedType === 'etat') {
            const dataEtat = [
                {
                    "Total Crédit": this.formatCurrency(this.rapportActivite.totalCredit || 0) + ' FCFA',
                    "Montant des Ventes": this.formatCurrency(this.rapportActivite.montantVente || 0) + ' FCFA',
                    "Montant Encaissé": this.formatCurrency(this.rapportActivite.montantEncaisse || 0) + ' FCFA',
                    "Etat": this.formatCurrency(this.rapportActivite.etat || 0) + ' FCFA'
                }
            ];
            this.pdfService.exportPDF(dataEtat, ['Total Crédit', 'Montant des Ventes', 'Montant Encaissé', 'Etat'], 'Etat Activité', 'etat_activite',dateInfo );
        } else {
            this.pdfService.exportPDF(data, headers, title, 'rapport_activite', dateInfo);
        }
    }

    getRapport(): void {
        this.loading = true; // Début du chargement
        //this.dateJournee.setHours(0, 0, 0, 0); // Fixe l'heure à 00:00:00
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
        console.log( this.dateJournee);
        this.rapportActiviteService.postRapportActivite(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {

                this.rapportActivite = resp.payload;
                console.log(this.rapportActivite)
                this.loading = false; // Fin du chargement
            },
            error => {
                console.error('Erreur lors de la récupération des Rapport activité :', error);
                this.loading = false; // Fin du chargement
            }
        );
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.rapportActivites.map((rapportActivite) => {
                return {
                    MontantDepense: rapportActivite.montantDepense,
                    MontantEncaisse: rapportActivite.montantEncaisse,
                    MontantVente: rapportActivite.montantVente,
                    Reste: rapportActivite.reste,

                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'Rapport');
        });
    }

    exportExcel2() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.rapportActivites.map((rapportActivite) => {
                    return {
                        MontantCredit: rapportActivite.totalCredit,
                        MontantEncaisse: rapportActivite.montantEncaisse,
                        MontantVente: rapportActivite.montantVente,
                        Etat: rapportActivite.etat,

                    };
                })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'Rapport');
        });
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
        this.rapportActivite= {};
    }

    onDateChange() {
        this.onPeriodChange()
    }

}
