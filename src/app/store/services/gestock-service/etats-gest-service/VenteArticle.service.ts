import {Injectable} from "@angular/core";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, ResponseGeneric, VenteParArticle, VenteParClient} from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class VenteArticleService extends CrudService<VenteParArticle, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    venteArticleh(dateDebut?: Date, dateFin?: Date, articleId?: number, dateJournee?: Date): Observable<ResponseGeneric<VenteParArticle[]>> {
        const url = `${GestockEndpoint.vente_article}/${dateDebut}/${dateFin}/${articleId}/${dateJournee}`;
        return this.http.get<ResponseGeneric<VenteParArticle[]>>(url);
    }

    venteArticle(dates: Dates, idsociete: number): Observable<ResponseGeneric<VenteParArticle[]>> {

        return this.http.post<ResponseGeneric<VenteParArticle[]>>(GestockEndpoint.vente_article + idsociete, dates);
    }

    achatArticle(dates: Dates, idsociete: number): Observable<ResponseGeneric<VenteParArticle[]>> {

        return this.http.post<ResponseGeneric<VenteParArticle[]>>(GestockEndpoint.achat_article + idsociete, dates);
    }

    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.vente_article_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }


}
