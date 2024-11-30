import {Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {Dates, Inventaire, Magasin} from "../../../store/entities/gestock.entity";
import {InventaireService} from "../../../store/services/gestock-service/Inventaire.service";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {MagasinService} from "../../../store/services/gestock-service/Magasin.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {PdfService} from "../../../store/services/service-partage/Pdf.service";
import {DatePipe} from "@angular/common";

interface ExportColumn {
    title: string;
    dataKey: string;
}

interface Product {
    name: string;
    sku: string;
    orderedQuantity: number;
    inQuantity: number;
    outQuantity: number;
    availableStock: number;
    engagedStock: number;
    availableForSale: number;
}

@Component({
    selector: 'app-inventaire',
    templateUrl: './inventaire.component.html',
    styleUrls: ['./inventaire.component.scss']
})
export class InventaireComponent implements OnInit {

    inventaires: Inventaire[] = [];
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

    magasins: Magasin[] = [];
    magasinselected: Magasin | undefined | null;
    inventaire: Inventaire = {};
    @ViewChild('filter') filter!: ElementRef;
    societyId: number = 0;
    today: string | null | undefined;
    today1: Date=new Date();
    selectedPeriod: Date[]=[];
    selectedDate?: Date=new Date() ;
    dateJournee: Date = new Date();
    check = 0;

    filterType: string = 'single';
    constructor(
        protected inventaireService: InventaireService,
        protected router: Router,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected magasinService: MagasinService,
        private tokenStorage: TokenStorage,
        private pdfService : PdfService,
        protected datePipe: DatePipe,
    ) {
    }

        ngOnInit(): void {
            this.display = false;
            this.menuBarBool = false;
            this.loadMagasin();
            this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
            this.checkValue();
            this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
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
    loadMagasin() {
        this.magasinService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.magasins = res.payload;
               // this.magasinselected=this.magasins[0];
            }
        );
    }

    onFilterTypeChange() {
        // Reset date fields when filter type changes
        this.selectedDate = undefined;
        this.selectedPeriod = [];
    }


    getinventaireByMagasin(id: number | undefined, idsociete: number) {
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
        if (id != null) {
            this.loading = true;
            this.inventaireService.getinventaireByMagasin(id, idsociete, dates).subscribe(
                resp => {
                    this.inventaires = resp.payload;
                    this.loading = false;
                },
                (error) => {
                    console.error(error);
                    this.loading = false;
                }
            );
        } else {
            this.inventaires = [];
        }
    }




    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.inventaires.map((inventaire) => {
                    return {
                        //Réference: inventaire.produitReference,
                        Désignation: inventaire.produitNom,
                        //Catégorie: inventaire.categorie,
                        Unité: inventaire.unite,
                        'Seuil de l\'inventaire': inventaire.produitSeuil,
                        'Stock Initial': inventaire.stockInitial,
                        Entrées: inventaire.entreeQuantite,
                        Sorties: inventaire.sortieQuantite,
                        'Stock Final': inventaire.stockFinal,
                        //'Prix U': inventaire.produitPrix,
                        //Valeur: inventaire.produitValeur,
                        Statut: inventaire.statut,
                    };
                })
            );
            const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'inventaires');
        });
    }


    exportPdf() {
        const data = this.inventaires.map(inventaire => ({
            Désignation: inventaire.produitNom || '',
            Unité: inventaire.unite || '',
            'Seuil d\'alerte': this.formatCurrency(inventaire.produitSeuil!) || '',
            'Stock Initial': this.formatCurrency(inventaire.stockInitial!) || '',
            Entrées: this.formatCurrency(inventaire.entreeQuantite!) || '',
            Sorties: this.formatCurrency(inventaire.sortieQuantite!) || '',
            'Stock Disponible': this.formatCurrency(inventaire.stock_physique_dispo!) || '',
            'Stock engagé': this.formatCurrency(inventaire.stock_physique_engage!) || '',
            'Stock disponible à la vente': this.formatCurrency(inventaire.stock_physique_dispo_vente!) || '',
            Statut: inventaire.statut || ''
        }));

        const headers = [
            'Désignation', 'Unité', 'Seuil d\'alerte', 'Stock Initial', 'Entrées',
            'Sorties', 'Stock Disponible', 'Stock engagé', 'Stock disponible à la vente', 'Statut'
        ];
        const magasinNom = this.magasinselected?.nom;
        const title = `Résumé de l'Inventaire du magasin : ${magasinNom}`;

        let dateInfo = {};
            dateInfo = { day: this.today1 };
        this.pdfService.exportPDF(data, headers, title, 'inventaire', dateInfo);
    }
    formatCurrency(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }


    exportPdffff() {
        const doc = new jsPDF('l', 'mm', 'a4');

        const head = [['Réference', 'Désignation', 'Catégorie',
            'Unité', 'Seuil de l\'inventaire', 'Stock Initial', 'Entrées',
            'Sorties', 'Stock Final', 'Prix U', 'Valeur', 'Statut']];

        autoTable(doc, {
            head: head,
            body: this.toPdfFormat(),
            didDrawCell: (data) => {
            },
        });
        doc.save('inventaire.pdf');
    }

    reportTojasper(){
        this.inventaireService.generateReportInventaire(this.magasinselected!.id!,JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        });
    }

    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.inventaires.length; i++) {
            // @ts-ignore
            data.push([
                //this.inventaires[i].produitReference || '',
                this.inventaires[i].produitNom || '',
                //this.inventaires[i].categorie || '',
                this.inventaires[i].unite || '',
                this.inventaires[i].produitSeuil || 0,
                this.inventaires[i].stockInitial || 0,
                this.inventaires[i].entreeQuantite || 0,
                this.inventaires[i].sortieQuantite || 0,
                this.inventaires[i].stockFinal || 0,
                //this.inventaires[i].produitPrix || 0,
                //this.inventaires[i].produitValeur || 0,
                this.inventaires[i].statut || ''
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

    // @ts-ignore
    getSeverity(inventaire: Inventaire): string {
        if (inventaire.statut == 'INDISPONIBLE') {
            return 'danger';
        } else if (inventaire.statut == 'FAIBLE') {
            return 'warning';
        } else {
            return 'success';
        }
    }


    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }



    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    changeMagasin() {
        this.inventaires=[];
    }
    onDateChange() {
        this.inventaires = [];
    }

    // Method to clear the list when a period is selected
    onPeriodChange() {
        this.inventaires = [];
    }
}
