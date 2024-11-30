import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Societe} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class SocieteService extends CrudService<Societe, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_societe);
    }

}
