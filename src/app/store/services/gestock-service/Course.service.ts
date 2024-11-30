import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {Client, Course, ResponseGeneric} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CourseService extends CrudService<Course, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_course);
    }

}
