import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Fournisseur} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class FournisseurService extends CrudService<Fournisseur, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_fournisseur);
    }

}
