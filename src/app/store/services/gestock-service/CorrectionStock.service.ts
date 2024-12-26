import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {CorrectionStock, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CorrectionStockService extends CrudService<CorrectionStock, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_correctionStock);
    }

    getExpiredProducts(id: number): Observable<ResponseGeneric<CorrectionStock[]>> {
        return this.http.get<ResponseGeneric<CorrectionStock[]>>(GestockEndpoint.gestock_produit_perime + "bysociety" + '/' + id);
    }

}
