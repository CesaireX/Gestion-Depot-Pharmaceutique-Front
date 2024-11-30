import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Fournisseur, TransfertStock} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class TransfertService extends CrudService<TransfertStock, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_transfert);
    }

}
