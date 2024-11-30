import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Client,
    ClientHistorique,
    Dates, Produit,
} from "../../../../store/entities/gestock.entity";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import {ClientService} from "../../../../store/services/gestock-service/Client.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {HistoriquesPdfService} from "../../../../store/services/service-partage/historiquesPdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './clientHistorique.component.html',
    styleUrls: ['./clientHistorique.component.scss']
})
export class ClientHistoriqueComponent implements OnInit {

    clienthistoriques: ClientHistorique[] = [];
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
    clients: Client[]=[];
    clientselected: Client | undefined |null;
    societyId: number = 0;
    exportColumns!: ExportColumn[];
    today1: Date=new Date();
    today: string|null;
    dateselecteddebut: string | null | undefined;
    dateselectedfin: string | null | undefined;
    dateselected: string | null | undefined;
    @ViewChild('filter') filter!: ElementRef;


    constructor(
        protected factureService: FactureService,
        protected router: Router,
        protected messageService: MessageService,
        private tokenStorage: TokenStorage,
        protected confirmationService: ConfirmationService,
        protected clientService:ClientService,
    private pdfService : HistoriquesPdfService,
    protected datePipe: DatePipe
) {
    this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
}

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.loadClient();
        this.checkValue();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        //this.loadClientHistorique();
    }

    loadClient() {
        this.clientService.findclientsbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
            }
        );
    }

    // @ts-ignore
    getSeverity(inventaire: ClientHistorique): string {
        if(inventaire.type?.toLowerCase()== 'facture'.toLowerCase()){
            return 'success';}
        if(inventaire.type?.toLowerCase()== 'reçu'.toLowerCase()){
            return 'warning';
        }
        if(inventaire.type?.toLowerCase()== 'créance'.toLowerCase()){
            return 'warning';
        }
    if(inventaire.type?.toLowerCase()== 'commande client'.toLowerCase()){
            return 'info';
        }
    }

    loadClientHistorique() {
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
            entityId: this.clientselected?.id,
            entityId2: this.societyId,
        };

        console.log(dates);

        this.factureService.getClientHistorique(dates).subscribe(
            (res) => {
                this.clienthistoriques = res.payload;
                this.loading = false; // Fin du chargement
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
        );
    }


 /*   reportTojasper(){

        this.factureService.generateReportofclienthistoriques().subscribe(response => {
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
                this.clienthistoriques.map((ClientHistorique) => {
                return {
                    Date: ClientHistorique.date,
                    Numéro: ClientHistorique.numero,
                    Moyen_Payement: ClientHistorique.moyenPaiement,
                    Fait_Par: ClientHistorique.faitPar,
                    Type: ClientHistorique.type,
                   Montant: ClientHistorique.somme,
                   'Reste à payer': ClientHistorique.reste,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'client_historiques');
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
        doc.save('client_historiques.pdf');
    }
    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.clienthistoriques.length; i++) {
            // @ts-ignore
            data.push([
                this.clienthistoriques[i].date|| '',
                this.clienthistoriques[i].numero|| '',
                this.clienthistoriques[i].somme|| '',
                this.clienthistoriques[i].moyenPaiement|| '',
                this.clienthistoriques[i].faitPar|| '',
                this.clienthistoriques[i].type|| '',
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
        const data = this.clienthistoriques.map(clientHistorique => ({
            // @ts-ignore
            Date: this.formatDate(clientHistorique.date),
            Numéro: clientHistorique.numero,
            Montant: this.formatCurrency(clientHistorique.somme!) || 0,
            'Reste à payer': clientHistorique.reste ? this.formatCurrency(clientHistorique.reste)  : '---',
            Type: clientHistorique.type
        }));

        const headers = ['Date', 'Numéro', 'Montant', 'Reste à payer', 'Type'];
        const title = 'Historique Client';

        const totals = {
            'Total Facture Payée': this.formatCurrency(this.clienthistoriques[0]?.totalFacturePaye!)+ ' FCFA' || '0',
            'Total Créance Payée': this.formatCurrency(this.clienthistoriques[0]?.totalCreancePaye!)+ ' FCFA' || '0',
            'Total Facture Impayée': this.formatCurrency(this.clienthistoriques[0]?.totalFactureImpayee!)+ ' FCFA' || '0',
            'Total Créance Impayée': this.formatCurrency(this.clienthistoriques[0]?.totalCreanceImpayee!)+ ' FCFA' || '0',
            'Total Facture': this.formatCurrency(this.clienthistoriques[0]?.totalFacture!)+ ' FCFA' || '0',
            'Total Créance': this.formatCurrency(this.clienthistoriques[0]?.totalCreance!)+ ' FCFA' || '0',
            'Total Commandé': this.formatCurrency(this.clienthistoriques[0]?.totalCommande!)+ ' FCFA' || '0'
        };

        const clientInfo = {
            'Nom': this.clientselected?.nom || '',
            'Prénom': this.clientselected?.prenom || '',
            'Téléphone': this.clientselected?.telephone || '',
            'Entreprise': this.clientselected?.entreprise || '',
            'Adresse': this.clientselected?.adresse || '',
            'CINB': this.clientselected?.cinb || ''
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

        this.pdfService.exportPDF(data, headers, title, 'historique_client', dateInfo, totals, clientInfo);
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
            entityId:  this.clientselected?.id,
            entityId2:  this.societyId,
        };

        this.factureService.generateReportHistoriqueClient(dates).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }

    onDateChange() {
        this.dateselectedfin = undefined
        this.dateselecteddebut = undefined
        this.dateselected=this.datePipe.transform(this.dateJournee, 'dd/MM/yy');
        this.clienthistoriques = [];
    }

    // Method to clear the list when a period is selected
    dateFin: any;
    dateDebut: any;
    onPeriodChange() {
        this.clienthistoriques = [];
        this.dateselecteddebut=this.datePipe.transform(this.selectedPeriod[0], 'dd/MM/yy');
        this.dateselectedfin=this.datePipe.transform(this.selectedPeriod[1], 'dd/MM/yy');
    }

    changeClient() {
        this.clienthistoriques = [];
    }
}
