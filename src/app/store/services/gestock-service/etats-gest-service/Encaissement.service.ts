import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, Encaissement, ResponseGeneric} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class EncaissementService extends CrudService<Encaissement, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    postEncaissement(dates: Dates, idsociete: number): Observable<ResponseGeneric<Encaissement[]>> {

        return this.http.post<ResponseGeneric<Encaissement[]>>(GestockEndpoint.encaissement + idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.encaissement_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }

}
