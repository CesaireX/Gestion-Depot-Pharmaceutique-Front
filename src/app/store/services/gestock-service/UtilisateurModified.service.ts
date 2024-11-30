import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Utilisateur, Produit} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class UtilisateurModifiedService extends CrudService<Utilisateur, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_utilisateur_modified);
    }

}
