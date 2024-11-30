import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {UniteMesure, Produit} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class UniteMesureService extends CrudService<UniteMesure, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_uniteMesure);
    }

}
