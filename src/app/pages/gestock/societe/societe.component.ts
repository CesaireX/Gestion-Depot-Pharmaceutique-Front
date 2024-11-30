import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Societe, Magasin} from "../../../store/entities/gestock.entity";
import { Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {NgForm} from "@angular/forms";
import {Table} from 'primeng/table';
import {SocieteService} from "../../../store/services/gestock-service/Societe.service";
import {TokenStorage} from "../../../store/storage/tokenStorage";

@Component({
    selector: 'app-societe',
    templateUrl: './societe.component.html',
    styleUrls: ['./societe.component.scss']
})
export class SocieteComponent implements OnInit {

    societes: Societe[] = [];
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
    societe: Societe = {};
    @ViewChild('filter') filter!: ElementRef;
    roles: any;

    imageChangedEvent?: any;
    msg?: any;
    url?: any;
    formData: {image: any} = {image: null};
    droits: any;
    isSecondaryActive = false;
    items: MenuItem[] | undefined;
    tabs = [
        { label: 'Informations générales' },
        { label: 'Transactions' }
        ];
    selectedTab: number | null = 0;
    displayForm: boolean = false;
    chrgmt: boolean = false;
    constructor(
        protected societeService: SocieteService,
        protected router: Router,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService,
        private tokenStorage:TokenStorage,
    ) {
    }

    ngOnInit(): void {
        this.roles=this.tokenStorage.getrole();
        this.display = false;
        this.menuBarBool = false;
        this.droits = this.tokenStorage.getdroits();
        this.loadAll();
        this.loadItems();
    }

    selectTab(index: number) {
        this.selectedTab = index;
    }
    SaveChoice(editForm: NgForm, choix: string){
        if(choix === 'continuer'){
            this.display = true;
            this.save(editForm);
        }else{
            this.display = false;
            this.save(editForm);
        }
    }

    closeSection(editform: NgForm) {
        this.displayForm =  false
        editform.resetForm()
    }

    annulate() {
        this.displayForm = false;
        this.societe = {};
    }

    add(societeValue: Magasin) {
        if (societeValue === null) {
            this.modal = 'ajouter';
        } else {
            this.societe = societeValue;
            this.modal = 'modifier';
        }
        this.displayForm = true;
    }

    deleteElement(societeToDelete: Magasin) {
        this.confirmationService.confirm({
            header: 'Confirmation',
            message: 'Etes-vous sûr de vouloir supprimer ?',
            accept: () => {
                if (societeToDelete === null) {
                    return;
                } else {
                    if (societeToDelete.id != null) {
                        this.societeService.delete(societeToDelete.id).subscribe(
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
        this.societes = [];
        this.societeService.findOne(JSON.parse(this.tokenStorage.getsociety()!)).subscribe(
            (res) => {
                this.societes.push(res.payload);
                this.loading = false; // Fin du chargement
            },
            (error) => {
                this.loading = false; // Fin du chargement en cas d'erreur
            }
            );
    }


    onFileChange(event: any) { //Angular 11, for stricter type
        this.imageChangedEvent = event;
        if(!event.target.files[0] || event.target.files[0].length == 0) {
            this.msg = 'Veuillez importer une image';
            return;
        }
        let mimeType = event.target.files[0].type;

        if (mimeType.match(/image\/*/) == null) {
            this.msg = "Seules les images sont acceptées";
            return;
        }

        let reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);

        reader.onload = (_event) => {
            const result: any = reader.result;
            this.msg = "";
            this.url = reader.result;
            // personForm.patchValue ({photo: result.split (',')[1]});
            this.societe.logo = result.split (',')[1];

            const file: File = event.target.files[0];
            if(file){
                this.formData.image = URL.createObjectURL(file);
            }
        };

    }

    showMessage(sever: string, sum: string, det: string) {
        this.messageService.add({
            severity: sever,
            summary: sum,
            detail: det
        });
    }

    save(editForm: NgForm) {
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer une nouvelle societe?',
                accept: () => {
                    this.chrgmt = true;
                    if (this.societe?.id) {
                        this.societeService.update(this.societe).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                this.displayForm = false;
                                editForm.resetForm();
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                    } else {

                        this.societeService.save(this.societe).subscribe(
                            (res) => {
                                this.loadAll();
                                this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                this.displayForm = false;
                                editForm.resetForm();
                            },

                            () => this.showMessage('error', 'Ajout', 'Echec Ajout !')
                        );
                    }

                }
            });
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                /*{
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    disabled:!this.droits.includes('SUPPRIMER_SOCIETE'),
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },*/
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
                    disabled:!this.droits.includes('MODIFIER_SOCIETE'),
                    command: ($event: any) => {
                        this.add(this.selectedItem);
                    }
                }
            ]
        }
        ]
    };

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
