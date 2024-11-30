import { Observable } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Client, ResponseGeneric} from "../../src/app/store/entities/gestock.entity";
export interface CrudOperations<T, ID> {
    save(t: T): Observable<T>;

    update(t: T): Observable<T>;

    findOne(id: ID): Observable<T>;

    findAll(): Observable<T[]>;

    delete(id: ID): Observable<any>;

}

export abstract class CrudService<T, ID> implements CrudOperations<T, ID> {

    protected constructor(
        protected http: HttpClient,
        protected base: string
    ) {

    }

    // @ts-ignore
    save(t: T): Observable<ResponseGeneric<T>> {
        console.log('base ====== ', this.base);
        console.log(t)
        return this.http.post<ResponseGeneric<T>>(this.base, t);
    }


    update(t: T): Observable<T> {
        console.log('base ====== ', this.base);
        return this.http.put<T>(this.base, t, {});
    }

    findbysociety(id: number): Observable<ResponseGeneric<T[]>> {
        return this.http.get<ResponseGeneric<T[]>>(this.base + "bysociety" + '/' + id);
    }

    // @ts-ignore
    findOne(id: ID): Observable<ResponseGeneric<T>> {
        return this.http.get<ResponseGeneric<T>>(this.base + '/' + id);
    }

    // @ts-ignore
    findAll(params?: any): Observable<ResponseGeneric<T[]>> {
        return this.http.get<ResponseGeneric<T[]>>(this.base, {params});
    }

    delete(id: ID): Observable<T> {
        return this.http.delete<T>(this.base + '/' + id);
    }

}
