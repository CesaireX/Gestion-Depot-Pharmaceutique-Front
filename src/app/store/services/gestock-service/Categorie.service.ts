import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Categorie, Produit} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class CategorieService extends CrudService<Categorie, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_categorie);
    }

}
