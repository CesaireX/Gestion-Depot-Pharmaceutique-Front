import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Client, Commande, Course, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CommandeService extends CrudService<Commande, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_commande);
    }

}
