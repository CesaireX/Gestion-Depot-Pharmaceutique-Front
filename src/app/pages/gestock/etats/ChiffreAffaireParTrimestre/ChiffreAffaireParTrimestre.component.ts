import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    ChiffreAffaireParTrimestre,
    Client,
    Dates, Facture, FactureSortie,
} from "../../../../store/entities/gestock.entity";
import {ClientService} from "../../../../store/services/gestock-service/Client.service";
import {ChiffreAffaireParTrimestreService} from "../../../../store/services/gestock-service/etats-gest-service/ChiffreAffaireParTrimestre.service";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import {DatePipe, formatDate as ngFormatDate} from '@angular/common';
import {addQuarters} from 'date-fns';
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {last} from "rxjs";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-inventaire',
    templateUrl: './ChiffreAffaireParTrimestre.component.html',
    styleUrls: ['./ChiffreAffaireParTrimestre.component.scss']
})
export class ChiffreAffaireParTrimestreComponent implements OnInit {

    chiffreAffaires: ChiffreAffaireParTrimestre[] = [];
    chiffreAffaire: ChiffreAffaireParTrimestre = {};
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
    //articles: Produit[]=[];
    //articleselected: Produit | undefined |null;
    exportColumns!: ExportColumn[];
    cols: any[] = [];
    @ViewChild('filter') filter!: ElementRef;

    dateDebut: Date = new Date();
    trimestreDebut: Date = new Date();
    dateFin: Date = new Date();
    trimestreFin: Date = new Date();
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    //trimestre = false;

    clients: Client[]=[];
    clientSelected: Client | undefined |null;
    factures: Facture[]= [];
    factureSelected: FactureSortie|undefined;
     totauxParMois: { [p: string]: number }={};
     totaux: number=0;
    today1: Date=new Date();
    today: string|null;
    selectedPeriod: Date[]=[];
    constructor(
        //protected encaissementService: EncaissementService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected factureService:FactureService,
        protected clientService:ClientService,
        protected chiffreAffaireService:ChiffreAffaireParTrimestreService,
    protected datePipe: DatePipe,
        private pdfService: PdfService
) {
    this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
}

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.checkValue();
        this.getCA();
       // this.loadClient();
        //this.loadFacture();

    }

    loadClient() {
        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
                //console.log(this.clients)
            }
        );
    }
    loadFacture() {
        this.factureService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.factures = res.payload;
                //console.log(this.clients)
            }
        );
    }


    // Function to format date to string


    // Function to generate array of months for the trimester


    // Function to prepare data and call PdfService
    printCA() {
        let headers: string[] = ['Nom', 'Prénom' , 'Type', 'Montant'];
        let data: any[] = [];
        let totals = {};

        if (this.check == 0) { // CA by day
            data = this.chiffreAffaires.map(value =>({
                Nom : value.nomClient,
                Prénom : value.prenomClient,
                Type : value.type,
                Montant : this.formatCurrency(value.montant!)
            }) );
            totals = { Total: this.formatCurrency(this.calculerTotaux2(this.chiffreAffaires)) };
        } else if (this.check == 1) { // CA by period
            data = this.chiffreAffaires.map(value =>({
                Nom : value.nomClient,
                Prénom : value.prenomClient,
                Type : value.type,
                Montant : this.formatCurrency(value.montant!) || 0
            }) );
            totals = { Total: this.formatCurrency(this.calculerTotaux2(this.chiffreAffaires)) };
        } else if (this.check == 2) { // CA by trimester
            headers = ['Nom', 'Prénom', 'Type', ...this.generateMonthsArray(this.trimestreDebut).map(date => this.formatDate(date))];
            data = this.chiffreAffaires.map(ca => {
                const row = { Nom: ca.nomClient, Prénom: ca.prenomClient, Type: ca.type };
                this.generateMonthsArray(this.trimestreDebut).forEach(date => {
                    row[this.formatDate(date)] = ca.trimestre === this.formatDate(date) ? this.formatCurrency(ca.montant!) : '---';
                });
                return row;
            });
            this.generateMonthsArray(this.trimestreDebut).forEach(date => {
                totals[this.formatDate(date)] = this.formatCurrency(this.totauxParMois[this.formatDate(date)]) || 0;
            });
        }
        let title = 'Chiffre d\'Affaires';
        let dateInfo = {};

        if (this.check == 0) { // Jour
            dateInfo = { day: this.dateJournee };
        } else if (this.check == 1) { // Période
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        } else if (this.check == 2) { // Trimestre
            title = 'Chiffre d\'Affaires trimestrielle';
            const endTrimester = this.addTwoMonths(this.trimestreDebut); // Helper function to calculate the end of the trimester
            dateInfo = { trimester: { start: this.trimestreDebut, end: endTrimester } };
        }
        this.pdfService.exportPDF(data, headers, title, 'Chiffre_Affaires',dateInfo, totals);
    }

    formatCurrency(value: number): string {
        if(value){
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }else
            return ' '
    }
    // Dummy function for calculating totals
    calculerTotaux2(data: any[]): number {
        return data.reduce((acc, item) => acc + (item.montant || 0), 0);
    }

    // Helper function to calculate the end of the trimester
    addTwoMonths1(date: string): string {
        const [month, year] = date.split('/').map(Number);
        const endMonth = month + 2;
        const endYear = endMonth > 12 ? year + 1 : year;
        const formattedEndMonth = endMonth > 12 ? endMonth - 12 : endMonth;
        return `${('0' + formattedEndMonth).slice(-2)}/${endYear}`;
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
            trimestre: this.trimestreDebut
        };
        this.chiffreAffaireService.generateReport(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });
    }

    checkValue() {

        if(this.check==0){
            this.selectedPeriod = [];
            this.trimestreDebut = undefined!;
            this.dateJournee =  new Date();
            this.chiffreAffaires=[];
        }

        if(this.check==1){
            //this.trimestre = false;
            this.dateJournee = undefined!;
            this.selectedPeriod = [];
            this.chiffreAffaires=[];
        }
        if(this.check==2){
            this.selectedPeriod = [];
            console.log("ffffffffff")
            this.dateJournee = undefined!;
            this.trimestreDebut = new Date();
            this.chiffreAffaires=[];
        }
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
            trimestre: this.trimestreDebut
        };
    }
    change(){
        //this.trimestre = true;
        this.trimestreFin = new Date(this.trimestreDebut);
        this.chiffreAffaires=[];
        this.trimestreFin.setMonth(this.trimestreDebut.getMonth() + 2);
    }

    calculateTotalForMonth(month: Date): number {
        console.log(this.chiffreAffaires)
        const filteredByMonth = this.chiffreAffaires.filter(item => {
            return (item.trimestre ==this.formatDate(month));
        });

        const total = filteredByMonth.reduce((acc, curr) => acc + curr.montant!, 0);
        return total;
    }

    generateMonthsArray(date: Date): Date[] {
        const monthsArray: Date[] = [];
        const firstMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        for (let i = 0; i < 3; i++) {
            const newMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
            monthsArray.push(newMonth);
        }
        return monthsArray;
    }

    formatDate(date: Date): string {
        return ngFormatDate(date, 'MM/yyyy', 'en-US');
    }
    addMonths(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
    addTwoMonths(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth() + 2, date.getDate());
    }

     calculerTotauxParMois(chiffresAffaires: ChiffreAffaireParTrimestre[]): { [mois: string]: number } {
        const totauxParMois: { [mois: string]: number } = {};
        // Calcul du total pour chaque mois
        chiffresAffaires.forEach(c => {
            if (totauxParMois[c.trimestre]) {
                // Si le mois existe déjà dans les totaux, ajouter le chiffre d'affaires
                totauxParMois[c.trimestre] += c.montant!;
            } else {
                // Si le mois n'existe pas, initialise le total pour ce mois
                totauxParMois[c.trimestre] = c.montant!;
            }
        });
        return totauxParMois;
    }
     calculerTotaux(chiffresAffaires: ChiffreAffaireParTrimestre[]):  number {
        let totaux= 0;
        // Calcul du total pour chaque mois
        chiffresAffaires.forEach(c => {
                totaux += c.montant!;
        });
        return totaux;
    }

    getCA(): void {
        this.loading = true; // Début du chargement
        this.chiffreAffaires=[];
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
            trimestre: this.trimestreDebut
        };
        this.chiffreAffaireService.postChiffreAffaire(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {
                this.chiffreAffaires = resp.payload;
                console.log(this.chiffreAffaires);
                this.totauxParMois = this.calculerTotauxParMois(this.chiffreAffaires);
                this.totaux = this.calculerTotaux(this.chiffreAffaires);
                this.loading = false; // Fin du chargement
            },
                error => {
                    console.error('Erreur lors de la récupération :', error);
                    this.loading = false; // Fin du chargement
                }
            );
    }


    exportExcelTrimestre() {
        import('xlsx').then((xlsx) => {
            const formattedData = this.chiffreAffaires.map((ca) => {
                const row = { 'Nom': ca.nomClient, 'Prénom':ca.prenomClient };

                this.generateMonthsArray(this.trimestreDebut).forEach((month) => {
                    if (this.formatDate(month) === ca.trimestre) {
                        // @ts-ignore
                        row[`${this.formatDate(month)}`] = ca.montant; // Ajouter le montant pour le mois correspondant
                    } else {
                        // @ts-ignore
                        row[`${this.formatDate(month)}`] = '';
                    }
                });

                return row;
            });
            const totauxParMois = this.calculerTotauxParMois(this.chiffreAffaires);

            // Ajout de la ligne Total
            const totalRow = {
                'Nom': 'Total',
                'Prénom': '',
            };

            this.generateMonthsArray(this.trimestreDebut).forEach((month) => {
                // @ts-ignore
                totalRow[`${this.formatDate(month)}`] = totauxParMois[this.formatDate(month)] || '';
            });

            formattedData.push(totalRow); // Ajout de la ligne Total au tableau
            const worksheet = xlsx.utils.json_to_sheet(formattedData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'chiffre_affaires_trimestre');
        });
    }

    exportExcel() {
        import('xlsx').then((xlsx) => {
            const dataForExcel = this.chiffreAffaires.map((ca) => {
                return {
                    Nom: ca.nomClient,
                    Prenom: ca.prenomClient,
                    Montant: ca.montant,
                };
            });
            // Ajout de la ligne de total
            const totalRow = {
                Nom: 'Total',
                Prenom: '',
                Montant: this.calculerTotaux(this.chiffreAffaires),
            };

            // Ajout de la ligne de total aux données pour Excel
            dataForExcel.push(totalRow);

            const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'chiffreAffaires');
        });
    }

    exportPdf() {
        const doc = new jsPDF('l', 'mm', 'a4');
        const head = [['Date',
            'Nom','Prenom','Montant']];
        autoTable(doc, {
            head: head,
            body: this.toPdfFormat(),
            didDrawCell: (data) => { },
        });
        doc.save('chiffreAffaireParTrimestre.pdf');
    }
    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.chiffreAffaires.length; i++) {
            // @ts-ignore
            data.push([
                this.chiffreAffaires[i].nomClient|| '',
                this.chiffreAffaires[i].prenomClient|| '',
                this.chiffreAffaires[i].montant|| '',
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

    protected readonly last = last;

    onPeriodChange() {
        this.chiffreAffaires=[];
    }

    onDateChange() {
        this.chiffreAffaires=[];
    }

}
