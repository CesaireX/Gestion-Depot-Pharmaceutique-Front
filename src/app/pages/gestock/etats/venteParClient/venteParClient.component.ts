import {Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {VenteClientService} from "../../../../store/services/gestock-service/etats-gest-service/VenteClient.service";
import {Client, Dates, VenteParClient} from "../../../../store/entities/gestock.entity";
import {ClientService} from "../../../../store/services/gestock-service/Client.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-inventaire',
    templateUrl: './venteParClient.component.html',
    styleUrls: ['./venteParClient.component.scss']
})
export class VenteParClientComponent implements OnInit {

    ventes: VenteParClient[] = [];
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
    clients: Client[] = [];
    clientselected: Client | undefined | null;
    @ViewChild('filter') filter!: ElementRef;
    selectedPeriod: Date[] = [];
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    societyId: number = 0;
    today1: Date = new Date();
    today: string | null;

    constructor(
        protected venteClientService: VenteClientService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected clientService: ClientService,
        protected datePipe: DatePipe,
        private pdfService: PdfService
    ) {
        this.today = this.datePipe.transform(this.today1, 'dd/MM/yy');
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.checkValue();
        this.getVenteByClient();
        this.loadClient();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
    }

    loadClient() {
        this.clientService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.clients = res.payload;
            }
        );
    }

    reportTojasper() {
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
            entityId: this.clientselected?.id,
        };

        this.venteClientService.generateReport(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(response => {
            // @ts-ignore
            const blob = new Blob([response.body], {type: 'application/pdf'});
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            this.loading = false;
        });
    }

    checkValue() {
        if (this.check == 0) {
            this.selectedPeriod = [];
            this.dateJournee = new Date();
        } else {
            this.dateJournee = undefined!;
            this.selectedPeriod = [];
        }
    }


    getVenteByClient(): void {
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

        this.venteClientService.venteClient(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {
                this.ventes = resp.payload;
                this.loading = false; // Fin du chargement
            },
            error => {
                console.error('Erreur lors de la récupération :', error);
                this.loading = false; // Fin du chargement
            }
        );
    }


    exportExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(
                this.ventes.map((vente) => {
                    return {
                        Client: vente.nomClient + " " + " " + vente.prenomClient,
                        Date: vente.dateSortie,
                        Désignation: vente.nomProduit,
                        Quantité: vente.quantiteVendue,
                        Unité: vente.unite,
                    };
                })
            );
            const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'ventes');
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


    calculateTotal() {
        return this.ventes.reduce((total, vente) => total + (vente.montant || 0), 0);
    }

    exportPDF() {
        const data = this.ventes.map(vente => ({
            // @ts-ignore
            Date: this.formatDate(vente.dateSortie!) || '',
            Client: `${vente.nomClient || ''} ${vente.prenomClient || ''}`,
            Désignation: vente.nomProduit || '',
            // @ts-ignore
            Quantité: this.formatCurrency(vente.quantiteVendue) || '',
            Unité: vente.unite || '',
            Montant: this.formatCurrency(vente.montant!) || 0 // Valeur brute pour le calcul du total
        }));

        const headers = ['Date', 'Client', 'Désignation', 'Quantité', 'Unité', 'Montant'];
        const title = 'Ventes par Client';
        const total = this.calculateTotal(); // Calculer le total
        const totals = {
            'Total': this.formatCurrency(total)
        };

        let dateInfo = {};
        if (this.dateJournee) { // Jour
            dateInfo = { day: this.dateJournee };
        } else if (this.selectedPeriod) { // Période
            dateInfo = { period: { start: this.selectedPeriod[0], end: this.selectedPeriod[1] } };
        }

        this.pdfService.exportPDF(data, headers, title, 'ventes', dateInfo, totals);
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


    /* onDisplayDialog(inventairetocheck?: Inventaire, isDetail?: boolean) {
         if (this.display) {
             this.display = false;
         } else {
             this.display = true;
             this.inventaire = {};
         }
     }*/

    /* add(inventaireValue: Inventaire) {
         if (inventaireValue === null) {
             this.modal = 'ajouter';
         } else {
             this.inventaire = inventaireValue;
             this.modal = 'modifier';
         }
         this.display = true;
     }*/


    /* loadAll() {
         this.inventaireService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
             (res) => {
                 this.inventaires = res.payload;
                 console.log(this.inventaires)
             }
         );
     }*/

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


    // ifExist(): boolean {
    //     if (this.inventaire.id) {
    //         return this.inventaires.some(
    //             value =>
    //                 value.id !== this.inventaire.id &&
    //                 value.description === this.inventaire.description
    //         );
    //     } else {
    //         return this.inventaires.some(value => value.description === this.inventaire.description);
    //     }
    // }


    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    currentdate: any;

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    changeClient() {
        this.ventes = [];
    }

    onPeriodChange() {
        this.ventes = [];
    }

    onDateChange() {
        this.ventes = [];
    }
}
