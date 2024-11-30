import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {
    ClientDebiteur, ClientHistorique,
    Dates,
    EtatStock,
    FactureEntree,
    Facture,
    ResponseGeneric, Transaction, VenteParArticle, FrsHistorique, FournisseurCrediteur } from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class FactureService extends CrudService<Facture, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_facture);
    }

    Annulerfacture(t: Facture): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_facture + '/annuler';
        return this.http.post<ResponseGeneric<any>>(base, t);
    }

    Modifierfacture(t: Facture): Observable<Facture> {
        let base = GestockEndpoint.gestock_facture + '/modifier';
        return this.http.post<Facture>(base, t);
    }

    Report( id: number){
        const httpOptions = {
            responseType: 'arraybuffer' as 'json',
            headers: new HttpHeaders({'Content-Type':  'application/json'}),
        };

        return this.http.get<any>(GestockEndpoint.gestock_facture_export+ '/' +id);
    }

    findbybon(id: number):  Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(this.base + "bybon" + '/' + id);
    }

    findbyclient(id: number):  Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(this.base + "byclient" + '/' + id);
    }

    findbyfrs(id: number):  Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(this.base + "byfrs" + '/' + id);
    }

    generateReport(id: number): Observable<HttpResponse<Blob>> {
        // @ts-ignore
        return this.http.get(GestockEndpoint.gestock_facture_export+ '/' +id, { observe: 'response', responseType: 'blob' as 'json' });
    }

    generateReportforFacture(id: number, type: number): Observable<HttpResponse<Blob>> {
        // @ts-ignore
        return this.http.get(GestockEndpoint.gestock_facture_export+ '/' +id + '/' +type, { observe: 'response', responseType: 'blob' as 'json' });
    }

    generateclientstransactions(idsociety: number, idClient: number): Observable<ResponseGeneric<any>> {
        // @ts-ignore
        return this.http.post<ResponseGeneric<any>>(GestockEndpoint.transactionclient + '/' + idsociety + '/' + idClient);
    }

    generatefrstransactions(idsociety: number, idClient: number): Observable<ResponseGeneric<any>> {
        // @ts-ignore
        return this.http.post<ResponseGeneric<any>>(GestockEndpoint.transactionfrs + '/' + idsociety + '/' + idClient);
    }

    getClientDebiteur(idsociete: number): Observable<ResponseGeneric<ClientDebiteur[]>> {
        return this.http.get<ResponseGeneric<ClientDebiteur[]>>( GestockEndpoint.client_debiteur +idsociete );
    }
    getFournisseurCrediteur(idsociete: number): Observable<ResponseGeneric<FournisseurCrediteur[]>> {
        return this.http.get<ResponseGeneric<FournisseurCrediteur[]>>( GestockEndpoint.fournisseur_crediteur +idsociete );
    }
    getClientDebiteurBySocieteId(id:number): Observable<ResponseGeneric<ClientDebiteur[]>> {
        return this.http.get<ResponseGeneric<ClientDebiteur[]>>( GestockEndpoint.client_debiteurByIdSociete+ '/' + id );
    }
getClientHistoriqussse(): Observable<ResponseGeneric<ClientHistorique[]>> {
        return this.http.get<ResponseGeneric<ClientHistorique[]>>( GestockEndpoint.client_historique );
    }

    getClientHistorique(dates: Dates): Observable<ResponseGeneric<ClientHistorique[]>> {

        return this.http.post<ResponseGeneric<ClientHistorique[]>>(GestockEndpoint.client_historique, dates);
    }
    getFournisseurHistorique(dates: Dates): Observable<ResponseGeneric<FrsHistorique[]>> {

        return this.http.post<ResponseGeneric<FrsHistorique[]>>(GestockEndpoint.fournisseur_historique, dates);
    }

    getFrsHistorique(dates: Dates): Observable<ResponseGeneric<FrsHistorique[]>> {

        return this.http.post<ResponseGeneric<FrsHistorique[]>>(GestockEndpoint.frs_historique, dates);
    }

    generateReportofclientdebiteurs(idsociete: number):Observable<HttpResponse<Blob>> {
        // @ts-ignore
        return this.http.get(GestockEndpoint.client_debiteurs_export +idsociete, { observe: 'response', responseType: 'blob' as 'json' });
    }

    getfacturesnonpayesbyclient(id: number, idClient: number): Observable<ResponseGeneric<Facture[]>> {
        return this.http.get<ResponseGeneric<Facture[]>>(this.base + "bysocietyandclient" + '/' + id + '/' + idClient);
    }


    generateReportHistoriqueClient(dates: Dates): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.client_historique_export , dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }

}
