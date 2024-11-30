import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, ChiffreAffaireParTrimestre, ResponseGeneric} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class ChiffreAffaireParTrimestreService extends CrudService<ChiffreAffaireParTrimestre, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    postChiffreAffaire(dates: Dates, idsociete: number): Observable<ResponseGeneric<ChiffreAffaireParTrimestre[]>> {

        return this.http.post<ResponseGeneric<ChiffreAffaireParTrimestre[]>>(GestockEndpoint.chiffreAffaireParTrimestre + idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.chiffre_affaire_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }

}
