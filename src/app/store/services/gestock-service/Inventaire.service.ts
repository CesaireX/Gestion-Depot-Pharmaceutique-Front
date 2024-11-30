import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {
    ClientDebiteur,
    Dates,
    EtatStock,
    Inventaire,
    LigneMagasin,
    ResponseGeneric
} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class InventaireService extends CrudService<Inventaire, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    getinventaireByMagasin(idParam? : number, idsociete?: number, dates?: Dates): Observable<ResponseGeneric<Inventaire[]>> {
        return this.http.post<ResponseGeneric<Inventaire[]>>( GestockEndpoint.gestock_inventaireByMagasin + idParam + '/' +idsociete, dates);
    }
    getEtatStock(idsociete: number, dates: Dates): Observable<ResponseGeneric<EtatStock[]>> {
        return this.http.post<ResponseGeneric<EtatStock[]>>( GestockEndpoint.etat_stock + idsociete, dates);
    }

    getClientDebiteur(idsociete: number): Observable<ResponseGeneric<ClientDebiteur[]>> {
        return this.http.get<ResponseGeneric<ClientDebiteur[]>>( GestockEndpoint.client_debiteur +idsociete );
    }

    generateReport(etatStocks: EtatStock[], idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.etat_stock_export + "PDF" + "/" + idsociete, etatStocks, {observe: 'response', responseType: 'blob' as 'json'} );
    }
    generateReportInventaire(magasinId:number ,idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.gestock_inventaire_export + magasinId + '/' + idsociete , {observe: 'response', responseType: 'blob' as 'json'} );
    }

}
