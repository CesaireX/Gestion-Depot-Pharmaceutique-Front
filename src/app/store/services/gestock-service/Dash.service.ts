import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {AggregationRecapitulatif, Client, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class DashService extends CrudService<AggregationRecapitulatif, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_client);
    }

    getIndicateurtotal(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_dash + "/" + id);
    }

    getActualStock(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_dash_stock_actuel+ '/' + id);
    }

    getBestclients(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_dash_best_client+ '/' + id);
    }

    getBestfrs(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_dash_best_frs+ '/' + id);
    }

    getIndicateurByregion(t: AggregationRecapitulatif, id: number): Observable<ResponseGeneric<any>> {
        return this.http.post<ResponseGeneric<any>>(GestockEndpoint.gestock_dash_entree_sorties + "/" + id, t);
    }

}
