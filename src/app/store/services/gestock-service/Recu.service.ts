import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {PayerFacturesRequestDTO, Recu, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class RecuService extends CrudService<Recu, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_recu);
    }

    getRecuByFactureId(factureId: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_recu
        return this.http.get<ResponseGeneric<any>>(base + '/' + factureId);
    }

    getpaiement(id: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_get_a_paiement
        return this.http.get<ResponseGeneric<any>>(base + '/' + id);
    }

    getrecu(id: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_recu_simple
        return this.http.get<ResponseGeneric<any>>(base + '/' + id);
    }

    getPaiementByFactureId(factureId: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_paye
        return this.http.get<ResponseGeneric<any>>(base + '/' + factureId);
    }

    getPaiementByCreanceId(creanceId: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_paye_by_creance
        return this.http.get<ResponseGeneric<any>>(base + '/' + creanceId);
    }

    getRecuByCreanceId(creanceId: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_recu_by_creances
        return this.http.get<ResponseGeneric<any>>(base + '/' + creanceId);
    }

    getpaiements(id: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_paiements
        return this.http.get<ResponseGeneric<any>>(base + '/' + id);
    }

    getversements(id: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_versements
        return this.http.get<ResponseGeneric<any>>(base + '/' + id);
    }

    saveNewRecu(t: Recu): Observable<ResponseGeneric<any>> {
        console.log(t)
        this.base = GestockEndpoint.gestock_new_recu;
        return this.http.post<ResponseGeneric<any>>(this.base, t);
    }

    savePaiement(t: PayerFacturesRequestDTO): Observable<ResponseGeneric<any>> {
        console.log(t)
        if(t.creanceIds!=null){
            this.base = GestockEndpoint.gestock_paye_creance;
        }else{
            this.base = GestockEndpoint.gestock_paye_facture;
        }
        return this.http.post<ResponseGeneric<any>>(this.base, t);
    }
    generateReport(id: number): Observable<HttpResponse<Blob>> {
        // @ts-ignore
        return this.http.get(GestockEndpoint.gestock_recu_export+ '/' +id, { observe: 'response', responseType: 'blob' as 'json' });
    }

    updateRecu(t: Recu): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_recu_simple;
        return this.http.put<ResponseGeneric<any>>(base, t, {});
    }

    deleteRecu(paiementId: number): Observable<ResponseGeneric<any>> {
        let base = GestockEndpoint.gestock_delete_paiement;
        return this.http.get<ResponseGeneric<any>>(base + paiementId);
    }


}
