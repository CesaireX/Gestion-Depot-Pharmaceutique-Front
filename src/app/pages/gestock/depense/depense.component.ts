import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    Categorie, Course, Depense,
    Magasin,
    Produit,
} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {CourseService} from "../../../store/services/gestock-service/Course.service";
import {DepenseService} from "../../../store/services/gestock-service/Depense.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";

@Component({
    selector: 'app-depense',
    templateUrl: './depense.component.html',
    styleUrls: ['./depense.component.scss']
})
export class DepenseComponent implements OnInit {

    depenses: Depense[] = [];
    courses: Course[] = [];
    depense: Depense = {};
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
    produit: Produit = {};
    selectedCourse?: Course;
    magasins: Magasin[] = [];
    total: number | undefined;
    currentdate: Date = new Date();
    date: Date = new Date();
    droits: any;
    items: MenuItem[] | undefined;
    displayForm: boolean = false;
    chrgmt: boolean = false;
    createormodif = false;
    @ViewChild('filter') filter!: ElementRef;
     depenseValue=0;


    constructor(
        protected courseService: CourseService,
        protected depenseService: DepenseService,
        protected router: Router,
        private tokenStorage: TokenStorage,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        protected authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
    }

    async initialize() {
        this.chrgmt = true; // Commencer le spinner

        try {
            this.display = false;
            this.menuBarBool = false;
            this.droits = this.tokenStorage.getdroits();

            await Promise.all([
                this.loadAll(),
                this.loadItems(),
                this.loadCourses()
            ]);

            this.items = [
                /*{
                    label: 'Importer des articles',
                    icon: 'pi pi-upload',
                    routerLink: ['/fileupload']
                },*/
                {
                    icon: 'pi pi-external-link',
                    label: 'Exporter la fiche'
                }
            ];
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.chrgmt = false; // Cacher le spinner après le chargement de toutes les données ou en cas d'erreur
        }
    }

    add(depense: Depense) {
        if (depense === null) {
            this.modal = 'ajouter';
            this.date = new Date()
            this.depense = {};
            this.depenseValue=0;
            this.selectedCourse = undefined;
            this.createormodif=true;
        } else {
            this.createormodif=false;
            this.depense = depense;
            this.modal = 'modifier';
            this.selectedCourse = this.courses.find(course => course.id === depense.courseId);
            if (this.depense.dateDepense) {
                if (Array.isArray(depense.dateDepense) && depense.dateDepense.length >= 5) {
                    this.date = new Date(
                        depense.dateDepense[0],      // Année
                        depense.dateDepense[1] - 1,  // Mois (JavaScript utilise des mois de 0 à 11)
                        depense.dateDepense[2],      // Jour
                        depense.dateDepense[3],      // Heure
                        depense.dateDepense[4]       // Minute
                    );
                }
            }
            /*if(this.depense.dateDepense){
                this.currentdate = new Date();
                const dateString = this.depense.dateDepense;
                this.currentdate = new Date(dateString);
            }*/
        }
        this.displayForm = true;
    }


    deleteElement(depenseToDelete: Depense) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (depenseToDelete === null) {
                    return;
                } else {

                    if (depenseToDelete.id != null) {
                        this.depenseService.delete(depenseToDelete.id).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'SUPPRESSION', 'Suppression effectuée avec succès !');
                            },
                            () => this.showMessage('error', 'SUPPRESSION', 'Echec de la suppression !')
                        );
                    }
                }
            }
        });
    }


    loadAll() {
        this.loading = true; // Début du chargement
        this.depenseService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.depenses = res.payload;
                this.loading = false; // Fin du chargement
            },
            (error) => {
                console.error(error);
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
    }


    loadCourses() {
        this.courseService.findbysociety(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.courses = res.payload;
            }
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

    async save(editForm: NgForm) {
        this.depense.societyId = JSON.parse(this.tokenStorage.getsociety()!);
        this.depense.courseId = this.selectedCourse?.id;
        this.depense.dateDepense = this.currentdate;

        this.confirmationService.confirm({
            header: 'ENREGISTREMENT',
            message: 'Voulez-vous vraiment enregistrer une nouvelle dépense?',
            accept: async () => {
                try {
                    this.chrgmt = true; // Affiche le spinner

                    if (this.depense?.id) {
                        await this.performSaveOperation(async () => {
                            await new Promise((resolve, reject) => {
                                this.depenseService.update(this.depense).subscribe(
                                    async (value) => {
                                        this.depense = value;
                                        this.loadAll();
                                        this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                        resolve(null);
                                    },
                                    () => {
                                        this.showMessage('error', 'Modification', 'Echec de Modification !');
                                        reject(new Error('Echec de Modification'));
                                    }
                                );
                            });
                        });
                    } else {
                        await this.performSaveOperation(async () => {
                            await new Promise((resolve, reject) => {
                                this.depenseService.save(this.depense).subscribe(
                                    async () => {
                                        this.loadAll();
                                        this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                        editForm.resetForm();
                                        resolve(null);
                                    },
                                    () => {
                                        this.showMessage('error', 'Ajout', 'Echec Ajout !');
                                        reject(new Error('Echec Ajout'));
                                    }
                                );
                            });
                        });
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    this.chrgmt = false;

                    if(this.display){
                        this.display = false
                    } else {
                        this.display = false;
                        this.displayForm = false;
                    }                }
            }
        });
    }

    private async performSaveOperation(operation: () => Promise<void>): Promise<void> {
        try {
            await operation();
        } catch (error) {
            console.error('Erreur lors de l\'opération de sauvegarde :', error);
        }
    }
    ifExist(): boolean {
        if (this.depense.id) {
            return this.depenses.some(
                value =>
                    value.id !== this.depense.id);
        } else {
            return this.depenses.some(value => value.id === this.depense.id);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled: !this.droits.includes('SUPPRIMER_DEPENSE'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled: !this.droits.includes('MODIFIER_DEPENSE'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    SaveChoice(editForm: NgForm, choix: string){
        if(choix === 'continuer'){
            this.display = true;
            this.save(editForm);
            this.depenseValue=0;
        }else{
            this.display = false;
            this.save(editForm);
        }
    }

    closeSection(editform: NgForm) {
        this.displayForm =  false;
        editform.resetForm()
    }
    annulate() {
        this.displayForm = false;
        this.depense = {};
    }


    updateprix(event: any) {
        this.depense.prix = event.value;
        this.depenseValue=event.value;
    }
}
