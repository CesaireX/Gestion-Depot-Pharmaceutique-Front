import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {
    AuthEntity,
    PasswordReset,
    ResponseGeneric,
    Userproperties,
    Utilisateur
} from "../../entities/gestock.entity";
import {jwtDecode} from "jwt-decode";
import {Router} from "@angular/router";
import {UtilisateurService} from "./Utilisateur.service";
import {Observable} from "rxjs";
import {RoleService} from "./Role.service";
import CryptoJS from 'crypto-js';
import {TokenStorage} from "../../storage/tokenStorage";

@Injectable({
    providedIn: "root"
})
export class AuthService  {

    isAuthenticated:boolean=false;
    role : any;
    username: any;
    token: any;
    utilisateurs: Utilisateur[] = [];
    droits:any;
    userdisponoibles: boolean = false;

    private inactivityTimeout = 3600000; // 1 heure d'inactivité, l'appli se deconnecte auto
    private inactivityTimer: any;
    idrole: any;
    constructor(private http : HttpClient, public tokenStorage: TokenStorage,
                private router:Router,private utilisateurService:UtilisateurService,
                protected roleService: RoleService
    ) {
        this.initializeInactivityTimer();
    }
    public login(aut:AuthEntity): Observable<Userproperties>{
        let options ={
            headers:new HttpHeaders()
                .set("Content-Type","application/json")
        }
        let param=
            {
                username: aut.username,
                password: aut.password
            };
        // @ts-ignore
        return this.http.post(GestockEndpoint.gestock_auth, param,options )
    }

    public findUsers(){
        this.utilisateurService.findAll().subscribe(
            (res) => {
                this.utilisateurs = res.payload;
                if(this.utilisateurs.length>=1){
                    this.userdisponoibles = true;
                }
            }
        );
    }

    async loadProfile(data: any, societyId: number, societyName: string) {
        this.isAuthenticated = true;
        this.token = data['token'];
        let jwtDecoder: any = jwtDecode(this.token);
        this.username = jwtDecoder.sub;
        console.log(jwtDecoder)
        if (data['roles']) {
            this.role = data['roles'];
        }
        if(data['idrole']){
            this.idrole = data['idrole'];
        try {
            const res = await this.roleService.findOne(this.idrole).toPromise();
            this.droits = res!.payload.droits;
            const jwt = CryptoJS.AES.encrypt(JSON.stringify(this.token),"this.token").toString();
            window.localStorage.setItem("ESCAPE",jwt);
            const roles = CryptoJS.AES.encrypt(JSON.stringify(this.role),"this.token").toString();
            window.localStorage.setItem("CHEKSTYLE", roles);
            if(this.droits!=null){
                const droits = CryptoJS.AES.encrypt(JSON.stringify(this.droits),"this.token").toString();
                window.localStorage.setItem("ATEMPS", droits);
            }
            if (societyId != 0) {
                const username = CryptoJS.AES.encrypt(JSON.stringify(data['username']),"this.token").toString();
                window.localStorage.setItem("TESTTRY", username);
                const societyid = CryptoJS.AES.encrypt(JSON.stringify(String(societyId)),"this.token").toString();
                window.localStorage.setItem("UNDERGROUND", societyid);
                const societyname = CryptoJS.AES.encrypt(JSON.stringify(String(societyName)),"this.token").toString();
                window.localStorage.setItem("LOWERCASE", societyname);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des droitss :', error);
        }
        }
    }

   async loadAllDroit(name: string) {
       try {
           const res = await this.roleService.findByName(name).toPromise();
           this.droits = res!.payload.droits;
       } catch (error) {
           console.error('Erreur lors du chargement des droits :', error);
       }
    }
  async  loadAllDroits(name: string) {
       try {
           const res = await this.roleService.findByName(name).toPromise();
           this.droits = res!.payload.droits;
           return this.droits;
       } catch (error) {
           console.error('Erreur lors du chargement des droits :', error);
       }

    }

    logout() {
        this.isAuthenticated=false;
        this.token=undefined;
        this.username=undefined;
        this.role=undefined;
        this.droits = undefined;
        window.localStorage.removeItem("CHEKSTYLE")
        window.localStorage.removeItem("ESCAPE")
        window.localStorage.removeItem("ATEMPS")
        window.localStorage.removeItem("UNDERGROUND")
        window.localStorage.removeItem("LOWERCASE")
        window.localStorage.removeItem("TESTTRY")
        this.router.navigateByUrl("auth/login");
    }

    loadJwtTokenFromStorage() {
        let token = this.tokenStorage.getToken();
        let role = this.tokenStorage.getrole();
        //let droits = window.localStorage.getItem("droits-user");
        //this.findUsers();
        this.role=role;
        // @ts-ignore
        if(token ){
            this.loadProfile({"token": token}, 0, "");
            //this.router.navigateByUrl()
        }
        this.role=role;
        //this.droits=droits;
    }


    sendVerifyEmailService(passwordReset: PasswordReset): Observable<ResponseGeneric<PasswordReset[]>> {

        return this.http.post<ResponseGeneric<PasswordReset[]>>(GestockEndpoint.verify_password_email, passwordReset);
    }
     resetPsswdService(passwordReset: PasswordReset): Observable<ResponseGeneric<PasswordReset[]>> {
        return this.http.post<ResponseGeneric<PasswordReset[]>>(GestockEndpoint.reset_password, passwordReset);
    }
  changePsswdService(passwordReset: PasswordReset): Observable<ResponseGeneric<PasswordReset[]>> {
        return this.http.post<ResponseGeneric<PasswordReset[]>>(GestockEndpoint.change_password, passwordReset);
    }


    private initializeInactivityTimer() {
        // Écoute des événements utilisateur pour réinitialiser le minuteur d'inactivité
        window.addEventListener('mousemove', this.onUserAction.bind(this));
        window.addEventListener('keypress', this.onUserAction.bind(this));
        window.addEventListener('click', this.onUserAction.bind(this));
        window.addEventListener('scroll', this.onUserAction.bind(this));
        window.addEventListener('contextmenu', this.onUserAction.bind(this));
        window.addEventListener('mousedown', this.onUserAction.bind(this));
        window.addEventListener('mouseup', this.onUserAction.bind(this));
        window.addEventListener('dblclick', this.onUserAction.bind(this));
        window.addEventListener('wheel', this.onUserAction.bind(this));
        window.addEventListener('touchstart', this.onUserAction.bind(this));
        window.addEventListener('touchmove', this.onUserAction.bind(this));
        window.addEventListener('touchend', this.onUserAction.bind(this));
        window.addEventListener('keydown', this.onUserAction.bind(this));
        window.addEventListener('keyup', this.onUserAction.bind(this));
        window.addEventListener('focus', this.onUserAction.bind(this));
        window.addEventListener('blur', this.onUserAction.bind(this));
        // Ajoutez d'autres événements selon les interactions que vous souhaitez surveiller
    }

    private resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            // Déconnecter l'utilisateur ici
            this.logout();
        }, this.inactivityTimeout);
    }
    private onUserAction() {
        clearTimeout(this.inactivityTimer);
        this.resetInactivityTimer();
    }

}
