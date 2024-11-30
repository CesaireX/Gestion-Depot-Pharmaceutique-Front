import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {LigneMagasin, ResponseGeneric, Role} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class RoleService extends CrudService<Role, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_role);
    }

    findByName(name:string):Observable<ResponseGeneric<Role>> {
        return this.http.get<ResponseGeneric<Role>>( GestockEndpoint.gestock_roleByName + name);
    }

    findByRoleId(name:string):Observable<ResponseGeneric<Role>> {
        return this.http.get<ResponseGeneric<Role>>( GestockEndpoint.gestock_roleByName + name);
    }

}
