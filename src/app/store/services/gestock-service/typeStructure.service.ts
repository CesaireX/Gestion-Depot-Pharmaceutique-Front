import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {TypeStructure} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";


@Injectable({
    providedIn: "root"
})
export class TypeStructureService extends CrudService<TypeStructure, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock);
    }

}
