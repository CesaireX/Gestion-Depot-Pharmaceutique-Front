import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Depense} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class DepenseService extends CrudService<Depense, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_depense);
    }

}
