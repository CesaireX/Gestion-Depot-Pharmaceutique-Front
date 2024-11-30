import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs";
import {Dates, ResponseGeneric, AchatParArticle, } from "../../../entities/gestock.entity";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class AchatArticleService extends CrudService<AchatParArticle, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_inventaire);
    }


    achatArticleh(dateDebut?: Date, dateFin?: Date, articleId?: number, dateJournee?: Date): Observable<ResponseGeneric<AchatParArticle[]>> {
        const url = `${GestockEndpoint.achat_article}/${dateDebut}/${dateFin}/${articleId}/${dateJournee}`;
        return this.http.get<ResponseGeneric<AchatParArticle[]>>(url);
    }

    achatArticle(dates: Dates, idsociete: number): Observable<ResponseGeneric<AchatParArticle[]>> {

        return this.http.post<ResponseGeneric<AchatParArticle[]>>(GestockEndpoint.achat_article + idsociete, dates);
    }



    generateReport(dates: Dates, idsociete: number): Observable<HttpResponse<HttpResponse<Blob>>> {
        // @ts-ignore
        return this.http.post<HttpResponse<Blob>>(GestockEndpoint.achat_article_export + idsociete, dates,  {observe: 'response', responseType: 'blob' as 'json'} );
    }


}
