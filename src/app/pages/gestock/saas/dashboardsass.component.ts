import { AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Subscription } from "rxjs";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import {DashService} from "../../../store/services/gestock-service/Dash.service";
import {
    AggregationRecapitulatif,
    ArticleStockMagasin, AuthEntity, Bestclient, Bestfrs,
    Entree_stock,
    Sortie_stock, Utilisateur
} from "../../../store/entities/gestock.entity";
import {Entree_stockService} from "../../../store/services/gestock-service/Entree_stock.service";
import {Sortie_stockService} from "../../../store/services/gestock-service/Sortie_stock.service";
import {Table} from "primeng/table";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {Router} from "@angular/router";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";

interface DailyTask {
    id: number;
    checked: boolean;
    label: string;
    description: string;
    avatar: string;
    borderColor: string,

}

@Component({
    templateUrl: "./dashboardsaas.component.html",
})
export class DashboardSaasComponent implements OnInit, OnDestroy {
    subscription!: Subscription;
    indicateur: AggregationRecapitulatif = {};
    selectedDetails: AggregationRecapitulatif = {};
    indicateurgetted: AggregationRecapitulatif = {};
    mois: any;
    getBackDecValue: boolean | undefined;
    getBackEntreesValue: boolean | undefined;
    client: any;
    fournisseur: any;
    magasin: any;
    produit: any;
    dette= 'dette';
    paye= "payé";
    Articlemagasinstock: ArticleStockMagasin = {};
    ListArticlemagasinstock: ArticleStockMagasin[] = [];
    bestclients: Bestclient[] = [];
    bestfrs: Bestfrs[] = [];
    authentity: AuthEntity = {};
    utilisateur: Utilisateur = {};
    valeurChart: any;
    societyname: string | null = "";
    username: string | null = "";
    date: Date | undefined;
    totalfacture: number | undefined;
    totaldepense: number | undefined;
    totalentree: number | undefined;
    totalliquide: number | undefined;
    totalliquidesorti: number | undefined;
    totalfactureday: number | undefined;
    totaldepenseday: number | undefined;
    totalentreeday: number | undefined;
    totalliquideday: number | undefined;
    totalliquidesortiday: number | undefined;
    droits : any;
    constructor(@Inject(PLATFORM_ID) private platformId: Object, private zone: NgZone,
                private tokenStorage: TokenStorage,
                public layoutService: LayoutService, private dashService: DashService, private entreeStockService: Entree_stockService,
                private sortieStockService: Sortie_stockService,
                private router: Router,
                protected authService: AuthService,) {
        this.subscription = this.layoutService.configUpdate$.subscribe(config => {
        })
    }

    ordersOptions: any;

    basicData: any;
    ordersChart: any;

    basicOptions: any;

    selectedTeam: string = 'UX Researchers';

    filteredTeamMembers: any = [];
    list_entrees_stock: Entree_stock[] = [];
    list_sorties_stock: Sortie_stock[] = [];
    cols: any[] = [];

    ngOnInit(): void {
        // @ts-ignore
        this.societyname = this.tokenStorage.getsocietyname();
        // @ts-ignore
        this.username = this.tokenStorage.getusername();
        this.chartInit();
        this.getBestclients();
        this.getBestfrs();
        this.loadUser();
        let date= new Date();
        this.date = date;
        this.selectedDetails.annee = date.getFullYear();
        this.selectedDetails.mois = date.getMonth() + 1;
        this.getNumberIndicateur();
        this.getPerformmanceIndicateurs();
        this.getEntreeandsorties();
        this.droits = this.tokenStorage.getdroits();
    }

    loadUser(){
        this.authentity.username = this.utilisateur.username;
    }

    getNumberIndicateur(){
        this.dashService.getIndicateurtotal(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(rep =>{
            this.indicateur = rep.payload
            this.client = this.indicateur.totalNbrClient;
            this.fournisseur = this.indicateur.totalNbrFournisseur;
            this.magasin = this.indicateur.totalNbrMagasin;
            this.produit = this.indicateur.totalNbrProduit;
        });
    }

    getBestclients(){
        this.dashService.getBestclients(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(rep =>{
            this.bestclients = rep.payload
        });
    }

    getBestfrs(){
        this.dashService.getBestfrs(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(rep =>{
            this.bestfrs = rep.payload
        });
    }

    getEntreeandsorties(){
        this.entreeStockService.getFiveLatestEntrees(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.list_entrees_stock = res.payload;
            }
        );

        this.sortieStockService.getFiveLatestSorties(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.list_sorties_stock = res.payload;
            }
        );
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalFiltersortie(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    updateDash(){
        setTimeout(() => {
            this.selectedDetails.annee = this.date!.getFullYear();
            this.selectedDetails.mois = this.date!.getMonth() + 1;
            this.getPerformmanceIndicateurs()
        });
    }

    getPerformmanceIndicateurs(){
        this.dashService.getIndicateurByregion(this.selectedDetails, JSON.parse(this.tokenStorage.getsociety()!)).subscribe(rep =>{
            this.indicateurgetted = rep.payload
            this.totalfacture = this.indicateurgetted.totalfacture;
            this.totaldepense = this.indicateurgetted.totaldepense;
            this.totalentree = this.indicateurgetted.totalentree;
            this.totalliquide = this.indicateurgetted.totalliquide;
            this.totalfactureday = this.indicateurgetted.totalfactureday;
            this.totaldepenseday = this.indicateurgetted.totaldepenseday;
            this.totalentreeday = this.indicateurgetted.totalentreeday;
            this.totalliquideday = this.indicateurgetted.totalliquideday;
            this.totalliquidesortiday = this.indicateurgetted.totalliquidesortiday;
            this.totalliquidesorti = this.indicateurgetted.totalliquidesorti;

            if(this.indicateurgetted.repartitions){

                const orderOfKeys = [];
                const orderOfKeys2 = [];

                const firstMonthData = this.indicateurgetted.repartitions[0];

                for (const day in firstMonthData) {
                    // @ts-ignore
                    orderOfKeys.push(`${day}`)
                    // @ts-ignore
                    orderOfKeys2.push(`${day}`)
                }
                this.mois = this.indicateurgetted.repartitions[0];
                let deces = this.indicateurgetted.repartitions[1];
                let depenses = this.indicateurgetted.repartitions[2];
                let paiementeffectuer = this.indicateurgetted.repartitions[3];
                let paiement = this.indicateurgetted.repartitions[4];

                const valuedefault = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const sortedArrayEntree = Object.entries(this.mois).sort((a, b) => a[0].localeCompare(b[0]));
            const sortedArraySortie = Object.entries(deces).sort((a, b) => a[0].localeCompare(b[0]));
                const sortedArrayDepense = Object.entries(depenses).sort((a, b) => a[0].localeCompare(b[0]));
                const sortedArrayPE = Object.entries(paiementeffectuer).sort((a, b) => a[0].localeCompare(b[0]));
                const sortedArrayP = Object.entries(paiement).sort((a, b) => a[0].localeCompare(b[0]));
                let orderMonthEntree: any[]=[];
            let orderMonthSorties: any[]=[];
                let orderMonthDepense: any[]=[];
                let orderMonthPE: any[]=[];
                let orderMonthP: any[]=[];
            let valueEntrees: any[]=[];
            let valueSortie: any[]=[];
                let valueDepenses: any[]=[];
                let valeurEntrees: any[]=[];
                let valeurSortie: any[]=[];
                let valeurPE: any[]=[];
                let valeurP: any[]=[];
            orderOfKeys.forEach(i =>{
                orderMonthEntree.push(sortedArrayEntree.filter(elt => elt[0] == i))
                orderMonthSorties.push(sortedArraySortie.filter(elt => elt[0] == i))
                orderMonthDepense.push(sortedArrayDepense.filter(elt => elt[0] == i))
                orderMonthPE.push(sortedArrayPE.filter(elt => elt[0] == i))
                orderMonthP.push(sortedArrayP.filter(elt => elt[0] == i))
            })

            orderMonthSorties.forEach(valueDec=>{
                if(valueDec.length===0){
                    this.getBackDecValue = false;
                }
            })

            orderMonthEntree.forEach(valueEntrees=>{
                if(valueEntrees.length===0){
                    this.getBackEntreesValue = false;
                }
            })
                orderMonthDepense.forEach(valueEntrees=>{
                    if(valueEntrees.length===0){
                        this.getBackEntreesValue = false;
                    }
                })
                orderMonthPE.forEach(valueEntrees=>{
                    if(valueEntrees.length===0){
                        this.getBackEntreesValue = false;
                    }
                })
                orderMonthP.forEach(valueEntrees=>{
                    if(valueEntrees.length===0){
                        this.getBackEntreesValue = false;
                    }
                })

                orderMonthEntree.filter(elt => {
                    valueEntrees.push(elt[0][1])
                })
                orderMonthSorties.filter(elt => {
                    valueSortie.push(elt[0][1])
                })
                orderMonthDepense.filter(elt => {
                    valueDepenses.push(elt[0][1])
                })
                orderMonthPE.filter(elt => {
                    valeurPE.push(elt[0][1])
                })
                orderMonthP.filter(elt => {
                    valeurP.push(elt[0][1])
                })

                this.ordersChart = {
                labels: orderOfKeys,
                datasets: [{
                    label: 'Factures clientes',
                    data: valueSortie,
                    borderColor: [
                        'rgba(0,62,255,0.82)',
                    ],
                    backgroundColor: [
                        'rgba(0,62,255,0.51)'
                    ],
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    tension: .2
                }, {
                    label: 'Factures fournisseurs',
                    data: valueEntrees,
                    borderColor: [
                        'rgb(121,94,190)',
                    ],
                    backgroundColor: [
                        'rgba(121,94,190,0.62)',
                    ],
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    tension: .4
                },
                    {
                    label: 'Paiements effectués',
                    data: valeurPE,
                    borderColor: [
                        'rgba(185,83,39,0.82)',
                    ],
                    backgroundColor: [
                        'rgba(185,83,39,0.53)',
                    ],
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    tension: .4
                },
                {
                    label: 'Paiements reçus',
                    data: valeurP,
                    borderColor: [
                        'rgba(0,98,90,0.82)',
                    ],
                    backgroundColor: [
                        'rgba(0,98,90,0.67)',
                    ],
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    tension: .4
                },{
                    label: 'Dépenses',
                    data: valueDepenses,
                    borderColor: [
                        '#7c0202',
                    ],
                    backgroundColor: [
                        'rgba(141,1,1,0.5)',
                    ],
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    tension: .4
                }],
                responsive: true
            };

                this.valeurChart = {
                    labels: orderOfKeys2,
                    datasets: [{
                        label: 'Sorties',
                        data: valeurSortie,
                        borderColor: [
                            '#63f17b',
                        ],
                        backgroundColor: [
                            'rgba(241, 178, 99, 0.1)'
                        ],
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 3,
                        tension: .2
                    }, {
                        label: 'Entrées',
                        data: valeurEntrees,
                        borderColor: [
                            '#6351bd',
                        ],
                        backgroundColor: [
                            'rgba(47, 142, 229, 0.05)',
                        ],
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 3,
                        tension: .4
                    }],
                    responsive: true
                };
            }
        })
    }

    chartInit() {
        this.basicData = {
            labels: ["January", "February", "March", "April", "May"],
            datasets: [
                {
                    label: "Previous Month",
                    data: [22, 36, 11, 33, 2],
                    fill: false,
                    borderColor: "#E0E0E0",
                    tension: 0.5,
                },
                {
                    label: "Current Month",
                    data: [22, 16, 31, 11, 38],
                    fill: false,
                    borderColor: "#6366F1",
                    tension: 0.5,
                },
            ],
        };
        this.basicOptions = this.getBasicOptions();

    }

    getBasicOptions() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color')
        const surfaceLight = getComputedStyle(document.body).getPropertyValue('--surface-100')
        return {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        boxWidth: 12,
                        boxHeight: 4,
                    },
                    position: "bottom",
                },
            },
            elements: { point: { radius: 0 } },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                    },
                    grid: {
                        color: surfaceLight,
                    },
                },
                y: {
                    ticks: {
                        color: textColor,
                        stepSize: 10,
                    },
                    grid: {
                        color: surfaceLight,
                    },
                },
            },
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
