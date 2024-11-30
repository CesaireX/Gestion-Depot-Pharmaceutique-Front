import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
    Dates, Encaissement,
    Produit,
} from "../../../../store/entities/gestock.entity";
import {ProduitService} from "../../../../store/services/gestock-service/Produit.service";
import {EncaissementService} from "../../../../store/services/gestock-service/etats-gest-service/Encaissement.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './encaissement.component.html',
    styleUrls: ['./encaissement.component.scss']
})
export class EncaissementComponent implements OnInit {

    encaissements: Encaissement[] = [];
    encaissement: Encaissement = {};
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
    today: string|null;
    articleselected: Produit | undefined |null;
    exportColumns!: ExportColumn[];
    cols: any[] = [];
    @ViewChild('filter') filter!: ElementRef;

    dateDebut: Date = new Date();
    dateFin: Date = new Date();
    dateJournee: Date = new Date();
    selectedPeriod: Date[]=[];
    currenteDate: Date = new Date();
    check = 0;
    total : number | undefined;
    totalEspece : number | undefined;
    totalOM : number | undefined;
    totalMM : number | undefined;
    totalCH : number | undefined;
    totalVE : number | undefined;
    societyId: number = 0;
    constructor(
        protected encaissementService: EncaissementService,
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
        this.getEncaissement();
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

        this.encaissementService.generateReport(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
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
    onPeriodChange() {
        this.encaissements = [];
    }

    onDateChange() {
        this.encaissements = [];
    }



    getEncaissement(): void {
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

        this.encaissementService.postEncaissement(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {
                this.encaissements = resp.payload;
                console.log(this.encaissements)
                if(this.encaissements.length == 0){
                    this.total = 0;
                    this.totalEspece = 0;
                    this.totalOM = 0;
                    this.totalMM = 0;
                    this.totalVE = 0;
                    this.totalCH = 0;
                }else{
                    if(this.encaissements[0].total){
                        this.total = this.encaissements[0].total;
                    }else{
                        this.total = 0;
                    }
                    if(this.encaissements[0].totalEspece){

                        this.totalEspece = this.encaissements[0].totalEspece;

                    }else{
                        this.totalEspece = 0;
                    }
                    if(this.encaissements[0].totalOrangeMoney){
                        this.totalOM = this.encaissements[0].totalOrangeMoney;
                    }else{
                        this.totalOM = 0;
                    }
                    if(this.encaissements[0].totalMoovMoney){
                        this.totalMM = this.encaissements[0].totalMoovMoney;
                    }else{
                        this.totalMM = 0;
                    }
                    if(this.encaissements[0].totalVersement){
                        this.totalVE = this.encaissements[0].totalVersement;
                    }else{
                        this.totalVE = 0;
                    }

                    if(this.encaissements[0].totalCheque){
                        this.totalCH = this.encaissements[0].totalCheque;
                    }else{
                        this.totalCH = 0;
                    }
                }
                this.loading = false; // Fin du chargement
            },
            error => {
                console.error('Erreur lors de la récupération:', error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
        );
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.encaissements.map((encaissement) => {
                return {
                    Date: encaissement.dateSortie,
                    Nom: encaissement.nomClient,
                    Prenom: encaissement.prenomClient,
                    ModePaiement: encaissement.modePaiement,
                    Paiement: encaissement.paiement,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'encaissement');
        });
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

        const data = this.encaissements.map(encaissement => ({
            // @ts-ignore
            Date: this.formatDate(encaissement.dateSortie),
            Nom: encaissement.nomClient,
            Prénom: encaissement.prenomClient,
            Règlement: this.formatCurrency(encaissement.paiement!) ,
            'Numéro Facture/Créance': encaissement.numero_fact_creance,
            'Facture/Créance': encaissement.type
        }));

        const headers = ['Date', 'Nom', 'Prénom', 'Règlement', 'Numéro Facture/Créance', 'Facture/Créance'];
        const title = 'Historique des encaissements';
        const totals = {
            'Total': this.formatCurrency(this.total!),
            'Total Espèce': this.formatCurrency(this.totalEspece!),
            'Total Orange Money': this.formatCurrency(this.totalOM!),
            'Total Moov Money': this.formatCurrency(this.totalMM!),
            'Total Chèque': this.formatCurrency(this.totalCH!),
            'Total Versement': this.formatCurrency(this.totalVE!)
        };
        let dateInfo = {};
        if (this.dateJournee) { // Jour
            dateInfo = { day: this.dateJournee };
        } else if (this.selectedPeriod) { // Période
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        }
        this.pdfService.exportPDF(data, headers, title, 'historique_encaissements',dateInfo, totals);
    }

    exportPDFjh() {
        const doc = new jsPDF();

        // Centrer le titre
        const title = 'Historique des encaissements';
        const pageWidth = doc.internal.pageSize.getWidth(); // Largeur de la page
        const titleX = (pageWidth - doc.getTextWidth(title)) / 2; // Calcul de la position X pour centrer le texte
        doc.setFontSize(14);
        doc.text(title, titleX, 20); // Positionner le titre centré en haut de la page

        // Ajouter les totaux sous le titre
        doc.setFontSize(12);
        const yPos = 30; // Position initiale en dessous du titre
        doc.text(`Total: ${this.total} FCFA`, 10, yPos);
        doc.text(`Total Espèce: ${this.totalEspece} FCFA`, 10, yPos + 10);
        doc.text(`Total Orange Money: ${this.totalOM} FCFA`, 10, yPos + 20);
        doc.text(`Total Moov Money: ${this.totalMM} FCFA`, 10, yPos + 30);
        doc.text(`Total Chèque: ${this.totalCH} FCFA`, 10, yPos + 40);
        doc.text(`Total Versement: ${this.totalVE} FCFA`, 10, yPos + 50);

        // Ajouter le tableau des encaissements
        const head = [['Date', 'Nom', 'Prénom', 'Règlement', 'Numéro Facture/Créance', 'Facture/Créance']];
        const body = this.encaissements.map(encaissement => [
            encaissement.dateSortie,
            encaissement.nomClient,
            encaissement.prenomClient,
            encaissement.paiement,
            encaissement.numero_fact_creance,
            encaissement.type
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: yPos + 60, // Positionner le tableau juste après les totaux
            margin: { top: 10 },
            didDrawPage: (data) => {
                // Cette section reste vide si vous n'avez rien à ajouter sur chaque page.
            }
        });

        doc.save('historique_encaissements.pdf');
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
    currentdate: any;
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // @ts-ignore
    getSeverity(enc: Encaissement): string {
        if(enc.type?.toLowerCase()== 'Facture'.toLowerCase()){
            return 'success';}
        if(enc.type?.toLowerCase()== 'Créance'.toLowerCase()){
            return 'info';
        }
    }
}
