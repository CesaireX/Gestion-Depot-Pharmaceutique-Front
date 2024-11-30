import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Reception} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";

@Injectable({
    providedIn: "root"
})
export class ReceptionService extends CrudService<Reception, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.reception);
    }

}
