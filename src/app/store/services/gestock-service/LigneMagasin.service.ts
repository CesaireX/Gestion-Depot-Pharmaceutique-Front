import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {LigneMagasin, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class LigneMagasinService extends CrudService<LigneMagasin, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_ligneMagasin);
    }


    findAllByBesoin(idParam? : number): Observable<ResponseGeneric<LigneMagasin[]>> {
        return this.http.get<ResponseGeneric<LigneMagasin[]>>( GestockEndpoint.gestock_ligneMagasinByProduit  + idParam);
    }

    findByProductAndMagasin(idProduct: number, idMagasin: number): Observable<ResponseGeneric<LigneMagasin>> {
        return this.http.get<ResponseGeneric<LigneMagasin>>(GestockEndpoint.gestock_ligneMagasinByProductAndMagasin+ idProduct+ '/' +idMagasin);
    }
    findByMagasin(idMagasin: number): Observable<ResponseGeneric<LigneMagasin[]>> {
        return this.http.get<ResponseGeneric<LigneMagasin[]>>(GestockEndpoint.gestock_ligneMagasinByProductAndMagasin+idMagasin);
    }
}
