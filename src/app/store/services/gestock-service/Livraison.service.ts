import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Livraison, Reception} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class LivraisonService extends CrudService<Livraison, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.livraison);
    }

}
