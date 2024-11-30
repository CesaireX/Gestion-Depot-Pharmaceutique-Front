import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Fournisseur,
    FrsHistorique,
    Dates, Produit,
} from "../../../../store/entities/gestock.entity";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import {FournisseurService} from "../../../../store/services/gestock-service/Fournisseur.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {HistoriquesPdfService} from "../../../../store/services/service-partage/historiquesPdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './fournisseurHistorique.component.html',
    styleUrls: ['./fournisseurHistorique.component.scss']
})
export class FournisseurHistoriqueComponent implements OnInit {

    fournisseurhistoriques: FrsHistorique[] = [];
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
    loading: boolean = false;
    articles: Produit[]=[];
    articleselected: Produit | undefined |null;

    selectedPeriod: Date[]=[];
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    fournisseurs: Fournisseur[]=[];
    fournisseurselected: Fournisseur | undefined |null;
    societyId: number = 0;
    exportColumns!: ExportColumn[];
    today1: Date=new Date();
    today: string|null;
    @ViewChild('filter') filter!: ElementRef;


    constructor(
        protected factureService: FactureService,
        protected router: Router,
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        protected confirmationService: ConfirmationService,
        protected fournisseurService:FournisseurService,
    protected datePipe: DatePipe,
        private pdfService : HistoriquesPdfService,
) {
    this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
}

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.loadFournisseur();
        this.checkValue();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        //this.loadFournisseurHistorique();
    }

    loadFournisseur() {
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );
    }

    // @ts-ignore
    getSeverity(inventaire: FournisseurHistorique): string {
        if(inventaire.type?.toLowerCase()== 'Facture Fournisseur'.toLowerCase()){
            return 'success';}
        if(inventaire.type?.toLowerCase()== 'Reçu'.toLowerCase()){
            return 'warning';
        }
        if(inventaire.type?.toLowerCase()== 'Bon de commande'.toLowerCase()){
            return 'info';
        }
    }

    loadFournisseurHistorique() {
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
            entityId:  this.fournisseurselected?.id,
            entityId2:  this.societyId,
        };
        this.factureService.getFrsHistorique(dates).subscribe(
            (res) => {
                this.fournisseurhistoriques = res.payload;
                this.loading = false; // Fin du chargement
                console.log(this.fournisseurhistoriques)
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
    }

 /*   reportTojasper(){

        this.factureService.generateReportoffournisseurhistoriques().subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }*/

    checkValue() {
        if (this.check==0){
            this.selectedPeriod = [];
            this.dateJournee = undefined!;
        }else {
            this.dateJournee = undefined!;
            this.selectedPeriod = [];
        }
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.fournisseurhistoriques.map((FournisseurHistorique) => {
                return {
                    Date: FournisseurHistorique.date,
                    Numéro: FournisseurHistorique.numero,
                    Moyen_Payement: FournisseurHistorique.moyenPaiement,
                    Fait_Par: FournisseurHistorique.faitPar,
                    Type: FournisseurHistorique.type,
                   Montant: FournisseurHistorique.somme,
                   'Reste à payer': FournisseurHistorique.reste,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'fournisseur_historiques');
        });
    }

    exportPdf() {
        const doc = new jsPDF('l', 'mm', 'a4');

        const head = [['Nom',
            'Date', 'Numéro', 'Somme', 'Moyen_Payement', 'Fait_Par','Type']];

        autoTable(doc, {
            head: head,
            body: this.toPdfFormat(),
            didDrawCell: (data) => { },
        });
        doc.save('fournisseur_historiques.pdf');
    }
    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.fournisseurhistoriques.length; i++) {
            // @ts-ignore
            data.push([
                this.fournisseurhistoriques[i].date|| '',
                this.fournisseurhistoriques[i].numero|| '',
                this.fournisseurhistoriques[i].somme|| '',
                this.fournisseurhistoriques[i].moyenPaiement|| '',
                this.fournisseurhistoriques[i].faitPar|| '',
                this.fournisseurhistoriques[i].type|| '',
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

    exportPDF() {
        // @ts-ignore
        const data = this.fournisseurhistoriques.map(fournisseurhistorique => ({
            // @ts-ignore
            Date: this.formatDate(fournisseurhistorique.date),
            Numéro: fournisseurhistorique.numero,
            Montant: this.formatCurrency(fournisseurhistorique.somme!) || 0,
            'Reste à payer': fournisseurhistorique.reste ? this.formatCurrency(fournisseurhistorique.reste)  : '---',
            Type: fournisseurhistorique.type
        }));

        const headers = ['Date', 'Numéro', 'Montant', 'Reste à payer', 'Type'];
        const title = 'Historique Fournisseurs';

        const totals = {
            'Total Facture Payée': this.formatCurrency(this.fournisseurhistoriques[0]?.totalFacturePaye!)+ ' FCFA' || '0',
            'Total Facture Impayée': this.formatCurrency(this.fournisseurhistoriques[0]?.totalFactureImpayee!)+ ' FCFA' || '0',
            'Total Facture': this.formatCurrency(this.fournisseurhistoriques[0]?.totalFacture!)+ ' FCFA' || '0',
            'Total Créance': this.formatCurrency(this.fournisseurhistoriques[0]?.totalCreance!)+ ' FCFA' || '0',
            'Total Commandé': this.formatCurrency(this.fournisseurhistoriques[0]?.totalCommande!)+ ' FCFA' || '0'
        };

        const frnsInfo = {
            'Nom': this.fournisseurselected?.nom || '',
            'Prénom': this.fournisseurselected?.prenom || '',
            'Téléphone': this.fournisseurselected?.telephone || '',
            'Entreprise': this.fournisseurselected?.entreprise || '',
            'Adresse': this.fournisseurselected?.adresse || '',
            'CINB': this.fournisseurselected?.cinb || ''
        };

        let dateInfo = {};
        console.log("rrrrrrrrrrrrrrrrrrrr")
        if (this.dateJournee) { // Jourù*
            console.log("ddddddddddddd")
            dateInfo = { day: this.dateJournee };
        } else if (this.selectedPeriod[0]) {
            console.log("ggggggggggggggggggggggg")
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        }else {
            dateInfo = { day: this.today1};
            console.log(this.today1)
        }

        this.pdfService.exportPDF(data, headers, title, 'historique_fournisseurs', dateInfo, totals, frnsInfo);
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
    reportHistoriqueTojasper(){

        const dates: Dates = {
            dateDebut:this.selectedPeriod [0],
            dateFin: this.selectedPeriod [1],
            dateJournee: this.dateJournee,
            entityId:  this.fournisseurselected?.id,
            entityId2:  this.societyId,
        };

       /* this.factureService.generateReportHistoriqueFournisseur(dates).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });*/
    }

    onDateChange() {
        this.fournisseurhistoriques = [];
    }

    // Method to clear the list when a period is selected
    dateFin: any;
    dateDebut: any;
    onPeriodChange() {
        this.fournisseurhistoriques = [];
    }

    changeFournisseur() {
        this.fournisseurhistoriques = [];
    }
}
