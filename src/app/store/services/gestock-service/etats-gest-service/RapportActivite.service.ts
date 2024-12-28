import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {
    Dates,
    Encaissement,
    RapportActivite,
    ResponseGeneric,
    VentesDuJourData
} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class RapportActiviteService extends CrudService<RapportActivite, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    postRapportActivite(dates: Dates, idsociete: number): Observable<ResponseGeneric<RapportActivite>> {

        return this.http.post<ResponseGeneric<RapportActivite>>(GestockEndpoint.rapportActivite+ idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.rapportActivite + "export/" + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }

    generateReport2(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.rapportActivite + "export2/" + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }



    getVentesDuJour(idsociete: number): Observable<ResponseGeneric<VentesDuJourData>> {
        return this.http.get<ResponseGeneric<VentesDuJourData>>(GestockEndpoint.vente_du_jr+ idsociete);
    }
}
