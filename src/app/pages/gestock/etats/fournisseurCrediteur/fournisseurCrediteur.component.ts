import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    FournisseurCrediteur,
    Produit,
} from "../../../../store/entities/gestock.entity";
import {FactureService} from "../../../../store/services/gestock-service/Facture.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './fournisseurCrediteur.component.html',
    styleUrls: ['./fournisseurCrediteur.component.scss']
})
export class FournisseurCrediteurComponent implements OnInit {

    fournisseurcrediteurs: FournisseurCrediteur[] = [];
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
        private pdfService: PdfService
    ) {
        this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.loadFournisseurCrediteur();
    }

    loadFournisseurCrediteur() {
        this.loading = true; // Début du chargement
        this.factureService.getFournisseurCrediteur(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurcrediteurs = res.payload;

                if(this.fournisseurcrediteurs.length == 0){
                    this.total = 0;
                }else{
                    if(this.fournisseurcrediteurs[0].total){
                        this.total = this.fournisseurcrediteurs[0].total;
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
     /*   this.factureService.generateReportoffournisseurcrediteurs(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });*/
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
                this.fournisseurcrediteurs.map((FournisseurCrediteur) => {
                return {
                    Nom: FournisseurCrediteur.nomFournisseur,
                    Prénom: FournisseurCrediteur.prenomFournisseur,
                    Tel: FournisseurCrediteur.tel,
                    Entreprise: FournisseurCrediteur.entrepriseNomF,
                    Solde: FournisseurCrediteur.sommeACredite,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'fournisseur_crediteurs');
        });
    }

    formatCurrency(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    calculateTotal() {
        return this.fournisseurcrediteurs.reduce((total, fournisseur) => total + (fournisseur.sommeACredite || 0), 0);
    }

    exportPDF() {
        const data = this.fournisseurcrediteurs.map(fournisseur => ({
            Fournisseur: `${fournisseur.nomFournisseur || ''} ${fournisseur.prenomFournisseur || ''}`,
            Téléphone: fournisseur.tel || '',
            Entreprise: fournisseur.entrepriseNomF || '',
            Adresse: fournisseur.ville || '',
            'Solde Compte': this.formatCurrency(fournisseur.sommeACredite!) || ''
        }));

        const headers = ['Fournisseur', 'Téléphone', 'Entreprise', 'Adresse', 'Solde Compte'];
        const title = 'Fournisseurs Créanciers';
        this.total = this.calculateTotal(); // Calculer le total
        const totals = {
            'Total': this.formatCurrency(this.total)
        };

        this.pdfService.exportPDF(data, headers, title, 'fournisseurs_crediteurs', null, totals);
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
