import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {CrudService} from "../../../../../Utils/generic-crud/crud.service";
import {
    PaiementFactureDTO,
    PayerFacturesRequestDTO,
    PaymentRequest,
    Recu,
    ResponseGeneric
} from "../../entities/gestock.entity";
import {GestockEndpoint} from "../../endpoints/gestock.endpoint";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class PaiementService extends CrudService<PaiementFactureDTO, number> {
    constructor( http: HttpClient) {
        super(http, GestockEndpoint.gestock_recu);
    }

    createPayment(paymentRequest: PaymentRequest): Observable<PaiementFactureDTO> {
        let base = GestockEndpoint.gestock_get_a_paiement
        if(paymentRequest.type == "factureclient" || paymentRequest.type == "facturefournisseur"){
            return this.http.post<PaiementFactureDTO>(base + '/facture', paymentRequest);
        }else{
            return this.http.post<PaiementFactureDTO>(base + '/creance', paymentRequest);
        }
    }

    deletePayment(paymentId: number, type: string): Observable<void> {
        let base = GestockEndpoint.gestock_get_a_paiement
        if(type == "factureclient" || type == "facturefournisseur"){
            return this.http.delete<void>(`${base}/facture/${paymentId}`);
        }else{
            return this.http.delete<void>(`${base}/creance/${paymentId}`);
        }
    }

    updatePayment(paymentId: number, paymentRequest: PaymentRequest): Observable<PaiementFactureDTO> {
        let base = GestockEndpoint.gestock_get_a_paiement
        if(paymentRequest.type == "factureclient" || paymentRequest.type == "facturefournisseur"){
            return this.http.put<PaiementFactureDTO>(`${base}/facture/${paymentId}`, paymentRequest);
        }else{
            return this.http.put<PaiementFactureDTO>(`${base}/creance/${paymentId}`, paymentRequest);
        }
    }


}
