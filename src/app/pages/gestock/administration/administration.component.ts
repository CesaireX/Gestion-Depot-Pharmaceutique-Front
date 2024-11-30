import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {state, style, trigger} from '@angular/animations';
import {AuthEntity, Magasin, Role, Societe, Utilisateur} from "../../../store/entities/gestock.entity";
import {Router} from "@angular/router";
import {SocieteService} from "../../../store/services/gestock-service/Societe.service";
import {UtilisateurService} from "../../../store/services/gestock-service/Utilisateur.service";
import {NgForm} from "@angular/forms";
import {Table} from "primeng/table";
import {AuthService} from "../../../store/services/gestock-service/Auth.service";
import {UtilisateurModifiedService} from "../../../store/services/gestock-service/UtilisateurModified.service";
import {RoleService} from "../../../store/services/gestock-service/Role.service";

@Component({
    selector: 'app-wizard',
    templateUrl: './administration.component.html',
    styleUrls: ['./administration.component.scss'],
    animations: [
        trigger('tabBar', [
            state('register', style({
                width: '33.3333%',
                left: '0'
            })),
            state('tier', style({
                width: '33.3333%',
                left: '33.3333%'
            })),
            state('payment', style({
                width: '33.3333%',
                left: '66.6667%'
            }))
        ])
    ]
})
export class AdministrationComponent implements OnInit{

    countries: any[] = [];
    activeIndex = 0; // The index of the active step
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
    loading: any;
    societe: Societe = {};
    utilisateur: Utilisateur = {};
    confirmPassword: string="";
    errorMessage: string = '';
    authentity: AuthEntity = {};
    @ViewChild('filter') filter!: ElementRef;
    roles: Role[] = [];
    role: Role[] | undefined =[];
    roleList: Role[]  | undefined =[];
    imageUrl:any;
    utilisateurs: Utilisateur[] = [];
    socities: Societe[] = [];
    steps = [
        { label: 'Sociéte' },
        { label: 'Utilisateur' },
        { label: 'Finalisation' }
        // Add more steps as needed
    ];
    imageChangedEvent?: any;
    msg?: any;
    url?: any;
    formData: {image: any} = {image: null};
    creationfirst: boolean = false;

    activeTab = 'register';

    activeCard = '';

    dropdownOptions1: SelectItem[];

    dropdownOptions2: SelectItem[];

    selectDropdownOptions1: any;

    selectDropdownOptions2: any;

    birthdate!: Date;

    checked = false;

    radioButton1!: string;
    userFinal: Utilisateur = {};

    constructor(protected router: Router,
                private authService: AuthService,
                protected roleService :RoleService,
                protected messageService: MessageService,
                protected confirmationService: ConfirmationService,
                protected societeService: SocieteService,
                protected utilisateurService: UtilisateurService,
                protected utilisateurModifiedService: UtilisateurModifiedService) {
        this.dropdownOptions1 = [
            {label: 'Select Time Zone', value: null},
            {label: 'UTC-12.00', value: {id: 1, name: 'UTC-12.00', code: '-12'}},
            {label: 'UTC-11.00', value: {id: 2, name: 'UTC-11.00', code: '-11'}},
            {label: 'UTC-10.00', value: {id: 3, name: 'UTC-10.00', code: '-10'}},
            {label: 'UTC-09.30', value: {id: 4, name: 'UTC-09.30', code: '-93'}},
            {label: 'UTC-09.00', value: {id: 5, name: 'UTC-09.00', code: '-09'}},
            {label: 'UTC-08.00', value: {id: 6, name: 'UTC-08.00', code: '-08'}},
            {label: 'UTC-07.00', value: {id: 7, name: 'UTC-07.00', code: '-07'}},
            {label: 'UTC-06.00', value: {id: 8, name: 'UTC-06.00', code: '-06'}},
            {label: 'UTC-05.00', value: {id: 9, name: 'UTC-05.00', code: '-05'}},
            {label: 'UTC-04.00', value: {id: 10, name: 'UTC-04.00', code: '-04'}},
            {label: 'UTC-03.30', value: {id: 11, name: 'UTC-03.30', code: '-33'}},
            {label: 'UTC-03.00', value: {id: 12, name: 'UTC-03.00', code: '-03'}},
            {label: 'UTC-02.00', value: {id: 13, name: 'UTC-02.00', code: '-02'}},
            {label: 'UTC-01.00', value: {id: 14, name: 'UTC-01.00', code: '-01'}},
            {label: 'UTC-+00.00', value: {id: 15, name: 'UTC-+00.00', code: '-00'}},
            {label: 'UTC+01.00', value: {id: 16, name: 'UTC+01.00', code: '+01'}},
            {label: 'UTC+02.00', value: {id: 17, name: 'UTC+02.00', code: '+02'}},
            {label: 'UTC+03.00', value: {id: 18, name: 'UTC+03.00', code: '+03'}},
            {label: 'UTC+03.30', value: {id: 19, name: 'UTC+03.30', code: '+33'}},
            {label: 'UTC+04.00', value: {id: 20, name: 'UTC+04.00', code: '+04'}},
            {label: 'UTC+04.30', value: {id: 21, name: 'UTC+04.30', code: '+43'}},
            {label: 'UTC+05.00', value: {id: 22, name: 'UTC+05.00', code: '+05'}},
            {label: 'UTC+05.30', value: {id: 23, name: 'UTC+05.30', code: '+53'}},
            {label: 'UTC+05.45', value: {id: 24, name: 'UTC+05.45', code: '+54'}},
            {label: 'UTC+06.00', value: {id: 25, name: 'UTC+06.00', code: '+06'}},
            {label: 'UTC+06.30', value: {id: 26, name: 'UTC+06.30', code: '+63'}},
            {label: 'UTC+07.00', value: {id: 27, name: 'UTC+07.00', code: '+07'}},
            {label: 'UTC+08.00', value: {id: 28, name: 'UTC+08.00', code: '+08'}},
            {label: 'UTC+08.45', value: {id: 29, name: 'UTC+08.45', code: '+84'}},
            {label: 'UTC+09.00', value: {id: 30, name: 'UTC+09.00', code: '+09'}},
            {label: 'UTC+09.30', value: {id: 31, name: 'UTC+09.30', code: '+93'}},
            {label: 'UTC+10.00', value: {id: 32, name: 'UTC+10.00', code: '+10'}},
            {label: 'UTC+10.30', value: {id: 33, name: 'UTC+10.30', code: '+13'}},
            {label: 'UTC+11.00', value: {id: 34, name: 'UTC+01.00', code: '+11'}},
            {label: 'UTC+12.00', value: {id: 35, name: 'UTC+01.00', code: '+12'}},
            {label: 'UTC+12.45', value: {id: 36, name: 'UTC+01.00', code: '+24'}},
            {label: 'UTC+13.00', value: {id: 37, name: 'UTC+01.00', code: '+13'}},
            {label: 'UTC+14.00', value: {id: 38, name: 'UTC+01.00', code: '+14'}},
        ];

        this.dropdownOptions2 = [
            {label: 'Where did you hear Ultima', value: null},
            {label: 'Blogs', value: 'Blogs'},
            {label: 'Google Ads', value: 'google'},
            {label: 'Your Forum', value: 'prime-forum'},
            {label: 'Youtube', value: 'Youtube'},
            {label: 'Reddit', value: 'Reddit'},
            {label: 'Events', value: 'Events'},
            {label: 'Other', value: 'Other'}
        ];
    }

    clickNext(step: string) {
        this.activeTab = step;
    }

    selectTier(card: string) {
        this.activeCard = card;
        this.activeTab = 'payment';
    }

    SaveAll(editForm: NgForm){
        this.saveAdmin(editForm);
    }

    ngOnInit(): void {
        this.display = false;
        this.menuBarBool = false;
        //this.loadAll();
        //this.loadItems()
        this.loadCountries()
        this.loadAllRole()
    }

    loadAllRole() {
        this.roleService.findAll().subscribe(
            (res) => {
                this.roles = res.payload;
            }
        );
    }

    savesociety(editForm: NgForm) {
        if (!this.ifExist()) {
            this.authService.loadProfile(this.userFinal, 0,"");
            this.societeService.save(this.societe).subscribe(
                (res) => {
                    this.authService.loadProfile(this.userFinal, res.payload.id!, res.payload.nom!);
                    this.UpdateAdmin(res.payload);
                    // this.loadAll();
                })
        } else {

            this.showMessage('error', 'ENREGISTREMENT', 'Une societe portant le meme nom existe déja !');

        }

    }

    saveAdmin(editForm: NgForm) {
        // @ts-ignore
        this.utilisateur.roles =this.roles[0];
        this.utilisateur.societies = [];
            if (this.utilisateur.password !== this.confirmPassword) {
                this.errorMessage = "Les mots de passe ne correspondent pas.";
                return; // Arrêter l'exécution de la fonction si les mots de passe ne correspondent pas
            }
            this.utilisateurService.save(this.utilisateur).subscribe(
                (user) => {
                    // this.loadAll();`
                    this.creationfirst = true;
                    setTimeout(() => {
                        this.creationfirst = false;
                        this.authentity.username = this.utilisateur.username;
                        this.authentity.password = this.utilisateur.password;
                        //this.authService.login(this.authentity);
                        this.authService.login(this.authentity).subscribe({
                            next: data =>  {
                                this.userFinal = data;
                                //this.authService.loadProfile(data);
                                this.savesociety(editForm);
                            }
                        });
                    }, 4000)
                });
            //this.loadAll();
    }

    UpdateAdmin(society: Societe) {
        this.societes.push(society)
        this.utilisateur.societies = [];
        this.utilisateur.societies = this.societes;
            this.utilisateurModifiedService.save(this.utilisateur).subscribe(
                () => {
                    this.router.navigateByUrl("gestock/dashboards")
                });
    }


    onDisplayDialog() {
        if (this.display) {
            this.display = false;
        } else {
            this.display = true;
            this.societe = {};
        }
    }

    next(): void {
        this.activeIndex++;
    }

    // Function to navigate to the previous step
    prev(): void {
        this.activeIndex--;
    }

    add(societeValue: Magasin) {
        if (societeValue === null) {
            this.modal = 'ajouter';
        } else {
            this.societe = societeValue;
            this.modal = 'modifier';
        }
        this.display = true;
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
        this.societeService.findAll().subscribe(
            (res) => {
                this.societes = res.payload;
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

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.convertToBase64(file);
        }
    }

    convertToBase64(file: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.imageUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
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


    save(editForm: NgForm) {
        if (!this.ifExist()) {
            this.confirmationService.confirm({
                header: 'ENREGISTREMENT',
                message: 'Voulez-vous vraiment enregistrer une nouvelle societe?',
                accept: () => {
                    if (this.societe?.id) {
                        this.societeService.update(this.societe).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'Modification', 'Modification effectuée avec succès !');
                                this.display = false;
                            },
                            () => this.showMessage('error', 'Modification', 'Echec de Modification !')
                        );
                        editForm.resetForm();
                        this.display = false;
                    } else {

                        this.societeService.save(this.societe).subscribe(
                            () => {
                                this.loadAll();
                                this.showMessage('success', 'Ajout', 'Ajout effectué avec succès !');
                                this.display = false;
                            },

                            () => this.showMessage('error', 'Ajout', 'Echec Ajout !')
                        );
                        this.loadAll();
                        this.display = false;
                        editForm.resetForm();
                    }

                }
            });

        } else {

            this.showMessage('error', 'ENREGISTREMENT', 'Une societe de la meme hauteur existe déja !');

        }

    }

    ifExist(): boolean {
        if (this.societe.id) {
            return this.societes.some(
                value =>
                    value.id !== this.societe.id &&
                    value.nom === this.societe.nom
            );
        } else {
            return this.societes.some(value => value.nom === this.societe.nom);
        }
    }

    loadItems() {
        this.menuitems = [{
            label: 'Options',
            items: [
                {
                    label: 'Supprimer',
                    icon: 'pi pi-times',
                    command: ($event: any) => {
                        this.deleteElement(this.selectedItem);
                    }
                },
                {
                    label: 'Modifier',
                    icon: 'pi pi-pencil',
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

    private loadCountries() {
        this.countries = [
            {name: 'Australia', code: 'AU'},
            {name: 'Brazil', code: 'BR'},
            {name: 'China', code: 'CN'},
            {name: 'Egypt', code: 'EG'},
            {name: 'France', code: 'FR'},
            {name: 'Germany', code: 'DE'},
            {name: 'India', code: 'IN'},
            {name: 'Japan', code: 'JP'},
            {name: 'Spain', code: 'ES'},
            {name: 'United States', code: 'US'}
        ];
    }

    //
}
