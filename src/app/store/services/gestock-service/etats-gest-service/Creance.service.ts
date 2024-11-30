import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {CrudService} from "../../../../../../Utils/generic-crud/crud.service";
import {Creance, ResponseGeneric} from "../../../entities/gestock.entity";
import {GestockEndpoint} from "../../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CreanceService extends CrudService<Creance, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_creance);
    }

    findbyclient(id: number):  Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(this.base + "byclient" + '/' + id);
    }


}
