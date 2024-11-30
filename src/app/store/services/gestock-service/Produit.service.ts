import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Produit, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class ProduitService extends CrudService<Produit, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_produit);
    }

    getProductOfmagasin(idmagasin: number, idsociety: number):Observable<ResponseGeneric<any>> {
        // @ts-ignore
        return this.http.get(GestockEndpoint.product_of_magasin + idmagasin + "/" +idsociety);
    }

}
