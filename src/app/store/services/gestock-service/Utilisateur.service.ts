import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Utilisateur, Produit, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class UtilisateurService extends CrudService<Utilisateur, number> {
    constructor( http: HttpClient) {
        console.log()
        super(http, GestockEndpoint.gestock_utilisateur);
    }

    findAllUsers(idSociete: number): Observable<ResponseGeneric<Utilisateur[]>> {
        return this.http.get<ResponseGeneric<Utilisateur[]>>(this.base + "/" + idSociete);
    }
}
