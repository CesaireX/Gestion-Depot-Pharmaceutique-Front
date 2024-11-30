import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Entree_stock, ResponseGeneric, Sortie_stock} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class Sortie_stockService extends CrudService<Sortie_stock, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_sortie_stock);
    }

    getFiveLatestSorties(societyId: number): Observable<ResponseGeneric<Sortie_stock[]>> {
        return this.http.get<ResponseGeneric<Sortie_stock[]>>(GestockEndpoint.gestock_lastest_sortie_stock  + societyId);
    }

    saveListofSorties(sorties: Sortie_stock[]): Observable<Sortie_stock> {
        let base = GestockEndpoint.gestock_sortie_stock;
        return this.http.post<Sortie_stock>(base +'/'+'list', sorties);
    }
    getSortiesByFactures(id: number): Observable<ResponseGeneric<Sortie_stock[]>> {
        return this.http.get<ResponseGeneric<Sortie_stock[]>>(GestockEndpoint.gestock_get_sorties_by_factures  + id);
    }

}
