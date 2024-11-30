import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, ResponseGeneric, AchatParFournisseur} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class AchatFournisseurService extends CrudService<AchatParFournisseur, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    achatFournisseurh(dateDebut?: Date, dateFin?: Date, fournisseurId?: number, dateJournee?: Date): Observable<ResponseGeneric<AchatParFournisseur[]>> {
        const url = `${GestockEndpoint.achat_fournisseur}/${dateDebut}/${dateFin}/${fournisseurId}/${dateJournee}`;
        return this.http.get<ResponseGeneric<AchatParFournisseur[]>>(url);
    }

    achatFournisseur(dates: Dates, idsociete: number): Observable<ResponseGeneric<AchatParFournisseur[]>> {

        return this.http.post<ResponseGeneric<AchatParFournisseur[]>>(GestockEndpoint.achat_fournisseur + idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.achat_fournisseur_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }
}
