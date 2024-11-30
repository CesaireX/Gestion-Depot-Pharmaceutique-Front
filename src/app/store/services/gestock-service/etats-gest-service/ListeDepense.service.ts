import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, EtatDepense, ResponseGeneric} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class ListeDepenseService extends CrudService<EtatDepense, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }




    postlisteDepense(dates: Dates, idsociete: number): Observable<ResponseGeneric<EtatDepense[]>> {

        return this.http.post<ResponseGeneric<EtatDepense[]>>(GestockEndpoint.etat_depense + idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.depense_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }

}
