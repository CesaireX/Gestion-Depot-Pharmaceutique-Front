import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Entree_stock, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class Entree_stockService extends CrudService<Entree_stock, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_entree_stock);
    }

    saveListofEntrees(entrees: Entree_stock[]): Observable<Entree_stock> {
        let base = GestockEndpoint.gestock_entree_stock;
        return this.http.post<Entree_stock>(base +'/'+'list', entrees);
    }
    getFiveLatestEntrees(societyId: number): Observable<ResponseGeneric<Entree_stock[]>> {
        return this.http.get<ResponseGeneric<Entree_stock[]>>(GestockEndpoint.gestock_lastest_entree_stock  + societyId);
    }
    getEntreeByFactureId(factureId: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_entree_stock+ "byfacture"
        return this.http.get<ResponseGeneric<any>>(base + '/' + factureId);
    }

}
