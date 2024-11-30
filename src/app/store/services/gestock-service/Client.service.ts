import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Client, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class ClientService extends CrudService<Client, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_client);
    }

    findclientsbysociety(id: number): Observable<ResponseGeneric<Client[]>> {
        return this.http.get<ResponseGeneric<Client[]>>(this.base + "bysociety" + '/' + id);
    }
}
