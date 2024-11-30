import { Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Table} from 'primeng/table';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {AchatFournisseurService} from "../../../../store/services/gestock-service/etats-gest-service/AchatFournisseur.service";
import {Fournisseur, Dates, AchatParFournisseur} from "../../../../store/entities/gestock.entity";
import {FournisseurService} from "../../../../store/services/gestock-service/Fournisseur.service";
import {TokenStorage} from "../../../../store/storage/tokenStorage";
import {DatePipe} from "@angular/common";
import {PdfService} from "../../../../store/services/service-partage/Pdf.service";
interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-inventaire',
    templateUrl: './achatParFournisseur.component.html',
    styleUrls: ['./achatParFournisseur.component.scss']
})
export class AchatParFournisseurComponent implements OnInit {

    achats: AchatParFournisseur[] = [];
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
    fournisseurs: Fournisseur[]=[];
    fournisseurselected: Fournisseur | undefined |null;
    @ViewChild('filter') filter!: ElementRef;
    selectedPeriod: Date[]=[];
    dateJournee: Date = new Date();
    currenteDate: Date = new Date();
    check = 0;
    societyId: number = 0;
    today1: Date=new Date();
    today: string|null;
    total: number=0;

    constructor(
        protected achatFournisseurService: AchatFournisseurService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected fournisseurService:FournisseurService,
        protected datePipe: DatePipe,
        private pdfService: PdfService
    ) {
        this.today=this.datePipe.transform(this.today1, 'dd/MM/yy');
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        this.checkValue();
        this.getAchatByFournisseur();
        this.loadFournisseur();
        this.societyId = JSON.parse(this.tokenStorage.getsociety()!);
    }

    loadFournisseur() {
        this.fournisseurService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.fournisseurs = res.payload;
            }
        );
    }

    formatCurrency(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    calculateTotal() {
        return this.achats.reduce((total, achat) => total + (achat.montant || 0), 0);
    }

    exportPDF() {
        const data = this.achats.map(achat => ({
            // @ts-ignore
            Date: this.formatDate(achat.dateEntree!) || '',
            Fournisseur: `${achat.nomFournisseur || ''} ${achat.prenomFournisseur || ''}`,
            Désignation: achat.nomProduit || '',
            // @ts-ignore
            Quantité: this.formatCurrency(achat.quantiteAchetee) || 0,
            Unité: achat.unite || '',
            Montant: this.formatCurrency(achat.montant!)  || 0
        }));

        const headers = ['Date', 'Fournisseur', 'Désignation', 'Quantité', 'Unité', 'Montant'];
        const title = 'Achats par Fournisseurs';
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

        this.pdfService.exportPDF(data, headers, title, 'achats_par_fournisseur',dateInfo, totals);
    }

    formatDate(dateArray: number[]): string {
        const [year, month, day] = dateArray;
        const formattedDay = day.toString().padStart(2, '0');
        const formattedMonth = (month).toString().padStart(2, '0'); // Les mois sont indexés à partir de 0
        return `${formattedDay}/${formattedMonth}/${year}`;
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


    getAchatByFournisseur(): void {
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
            entityId2:this.societyId,
        };

        this.achatFournisseurService.achatFournisseur(dates, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            resp => {
                this.achats = resp.payload;
                this.loading = false; // Fin du chargement
                console.log(this.achats)
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
                this.achats.map((achat) => {
                return {
                    Fournisseur: achat.nomFournisseur +" "+ " "+ achat.prenomFournisseur,
                    Date: achat.dateEntree,
                    Désignation: achat.nomProduit,
                    Quantité: achat.quantiteAchetee,
                    Unité: achat.unite,
                };
            })
            );
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'achats');
        });
    }

    exportPdf() {
        const doc = new jsPDF('l', 'mm', 'a4');

        const head = [['Fournisseur', 'Date', 'Désignation',
            'Quantité', 'Unité']];

        autoTable(doc, {
            head: head,
            body: this.toPdfFormat(),
            didDrawCell: (data) => { },
        });
        doc.save('achats.pdf');
    }
    toPdfFormat() {
        let data = [];
        for (var i = 0; i < this.achats.length; i++) {
            // @ts-ignore
            data.push([
                this.achats[i].nomFournisseur|| '' + " " + " "+ this.achats[i].prenomFournisseur,
                this.achats[i].dateEntree|| '',
                this.achats[i].nomProduit|| '',
                this.achats[i].quantiteAchetee|| '',
                this.achats[i].unite|| '',
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

    changeFournisseur() {
        this.achats = [];
    }

    onPeriodChange() {
        this.achats = [];
    }

    onDateChange() {
        this.achats = [];
    }
}
