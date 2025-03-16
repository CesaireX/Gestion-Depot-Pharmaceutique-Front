import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {
    ClientDebiteur, ClientHistorique,
    Dates,
    EtatStock, Facture,
    FactureEntree,
    FactureSortie,
    ResponseGeneric, VenteParArticle
} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class FactureFournisseurClientService extends CrudService<Facture, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_facture);
    }



    generateReport(id: number): Observable<HttpResponse<Blob>> {
        // @ts-ignore
        return this.http.get(GestockEndpoint.gestock_facture_export+ '/' +id, { observe: 'response', responseType: 'blob' as 'json' });
    }



    findSupplierInvoicesBySocieteId(id: number): Observable<ResponseGeneric<Facture[]>> {
        return this.http.get<ResponseGeneric<Facture[]>>(GestockEndpoint.gestock_by_society_facture + '/' + id + '/frs');
    }

    findClientInvoicesBySocieteId(id: number): Observable<ResponseGeneric<Facture[]>> {
        return this.http.get<ResponseGeneric<Facture[]>>(GestockEndpoint.gestock_by_society_facture + '/' + id + '/clients');
    }
    findClientInvoicesBySocieteIdPaginated(id: number, searchTerm: string = '', page: number, size: number): Observable<ResponseGeneric<any>> {
        let url = `${GestockEndpoint.gestock_by_society_facture}/${id}/clients/paginated?page=${page}&size=${size}`;

        if (searchTerm && searchTerm.trim() !== '') {
            url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
        }

        return this.http.get<ResponseGeneric<any>>(url);
    }
    findNonRembourseClientInvoicesBySocieteId(id: number): Observable<ResponseGeneric<Facture[]>> {
        return this.http.get<ResponseGeneric<Facture[]>>(GestockEndpoint.gestock_by_society_facture + '/' + id + '/clients/non-rembourse');
    }

    findRembourseClientInvoicesBySocieteId(id: number): Observable<ResponseGeneric<Facture[]>> {
        return this.http.get<ResponseGeneric<Facture[]>>(GestockEndpoint.gestock_by_society_facture + '/' + id + '/clients/rembourse');
    }


    updateFacture(t: Facture): Observable<Facture> {
        let base = GestockEndpoint.gestock_facture + '/modifier';
        return this.http.put<Facture>(base, t);
    }

    DeleteFacture(t: Facture): Observable<Facture> {
        let base = GestockEndpoint.gestock_facture + '/annuler';
        return this.http.post<Facture>(base, t);
    }

    markAsRembourse(factureId: number): Observable<any> {
        return this.http.post<any>(`${GestockEndpoint.gestock_facture}/${factureId}/rembourse`, {});
    }

    imprimerTicket(facture: Facture): Observable<any> {
        console.log(facture)
        return this.http.post<Facture>(`${GestockEndpoint.gestock_impression}/ticket`, facture);
    }
}
