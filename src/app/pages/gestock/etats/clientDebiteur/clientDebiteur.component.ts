import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    ClientDebiteur,
    Produit,
} from "../../../../store/entities/gestock.entity";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
import {CustomNumberPipe} from "../../../../store/pipe/custom-number.pipe";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './clientDebiteur.component.html',
    styleUrls: ['./clientDebiteur.component.scss']
})
export class ClientDebiteurComponent implements OnInit {

    clientdebiteurs: ClientDebiteur[] = [];
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
    total: number | undefined;
    exportColumns!: ExportColumn[];
    today1: Date=new Date();
    today: string|null;
    @ViewChild('filter') filter!: ElementRef;


    constructor(
        protected factureService: FactureService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected datePipe: DatePipe,
        private pdfService: PdfService,
    ) {
        this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.loadClientDebiteur();
    }

    loadClientDebiteur() {
        this.loading = true; // Début du chargement
        this.factureService.getClientDebiteur(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clientdebiteurs = res.payload;

                if(this.clientdebiteurs.length == 0){
                    this.total = 0;
                }else{
                    if(this.clientdebiteurs[0].total){
                        this.total = this.clientdebiteurs[0].total;
                    }else{
                        this.total = 0;
                    }
                }
                this.loading = false; // Fin du chargement
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
    }

    reportTojasper(){
        this.loading = true;
        this.factureService.generateReportofclientdebiteurs(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });
    }

    checkValue() {
      /*  if (this.check==0){
            this.dateDebut = undefined!;
            this.dateFin = undefined!;
            this.dateJournee = new Date();
        }else {
            this.dateJournee = undefined!;
            this.dateDebut = new Date();
            this.dateFin = new Date();
        }
        console.log(this.check);*/
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.clientdebiteurs.map((ClientDebiteur) => {
                return {
                    Nom: ClientDebiteur.nomClient,
                    Prénom: ClientDebiteur.prenomClient,
                    Tel: ClientDebiteur.tel,
                    Entreprise: ClientDebiteur.entrepriseNom,
                    Solde: ClientDebiteur.sommeAdebite,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'client_debiteurs');
        });
    }

    formatCurrency(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

    calculateTotal(): number {
        return this.clientdebiteurs.reduce((sum, client) => sum + (client.sommeAdebite || 0), 0);
    }

    exportPDF() {
        const data = this.clientdebiteurs.map(client => ({
            Client: `${client.nomClient || ''} ${client.prenomClient || ''}`,
            Tel: client.tel || '',
            Entreprise: client.entrepriseNom || '',
            Adresse: client.ville || '',
            Solde: this.formatCurrency(client.sommeAdebite!)  || ''
        }));

        const headers = ['Client', 'Tel', 'Entreprise','Adresse', 'Solde'];
        const title = 'Clients Débiteurs';
        this.total = this.calculateTotal(); // Calculate the total
        const totals = {
            'Total': this.formatCurrency(this.total)
        };

        let dateInfo = {};
        dateInfo = { day: this.today1 };

        this.pdfService.exportPDF(data, headers, title, 'client_debiteurs', dateInfo, totals);
    }
    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.clientdebiteurs.length; i++) {
            // @ts-ignore
            data.push([
                this.clientdebiteurs[i].nomClient|| '',
                this.clientdebiteurs[i].prenomClient|| '',
                this.clientdebiteurs[i].tel|| '',
                this.clientdebiteurs[i].entrepriseNom|| '',
                this.clientdebiteurs[i].sommeAdebite|| '',
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
}
