import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, ResponseGeneric, VenteParClient} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class VenteClientService extends CrudService<VenteParClient, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    venteClienth(dateDebut?: Date, dateFin?: Date, clientId?: number, dateJournee?: Date): Observable<ResponseGeneric<VenteParClient[]>> {
        const url = `${GestockEndpoint.vente_client}/${dateDebut}/${dateFin}/${clientId}/${dateJournee}`;
        return this.http.get<ResponseGeneric<VenteParClient[]>>(url);
    }

    venteClient(dates: Dates, idsociete: number): Observable<ResponseGeneric<VenteParClient[]>> {

        return this.http.post<ResponseGeneric<VenteParClient[]>>(GestockEndpoint.vente_client + idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.vente_client_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }
}
