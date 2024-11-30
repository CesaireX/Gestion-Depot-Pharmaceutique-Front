import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from '../../../../../Utils/generic-crud/crud.service';
import { BonCommande, ResponseGeneric } from '../../entities/gestock.entity';
import { GestockEndpoint } from '../../endpoints/gestock.endpoint';

@Injectable({
    providedIn: 'root'
})
export class BonCommandeService extends CrudService<BonCommande, number> {
    constructor(http: HttpClient) {
        super(http, GestockEndpoint.gestock_bon_commande);
    }

    saveBonCommandes(entreeRequest: BonCommande): Observable<ResponseGeneric<any>> {
        console.log("dddddddddd")
        return this.http.post<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande, entreeRequest);
    }
 annulerBonCommandes(entreeRequest: BonCommande): Observable<ResponseGeneric<any>> {
        console.log("dddddddddd")
        return this.http.post<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande+'/annuler', entreeRequest);
    }

    getFiveLatestBonCommandes(societyId: number): Observable<ResponseGeneric<BonCommande[]>> {
        return this.http.get<ResponseGeneric<BonCommande[]>>(`${GestockEndpoint.gestock_bon_commande}/latest/${societyId}`);
    }

    getBonBySocietyAndFrs(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande_frs + "bysociety" + '/' + id);
    }

    getBonBySocietyAndFacture(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande_facture + "bysociety" + '/' + id);
    }

    getBonBySocietyAndClients(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande_client + "bysociety" + '/' + id);
    }
    findClientBondCommandesWithIncompleteFacturesBySocieteId(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande_client  + '/' + id+ '/incompleteFactures');
    }
    findFsrBondCommandesWithIncompleteFacturesBySocieteId(id: number): Observable<ResponseGeneric<any>> {
        return this.http.get<ResponseGeneric<any>>(GestockEndpoint.gestock_bon_commande_frs + '/' + id+ '/incompleteFactures');
    }

    getCommandeByBonId(id: number): Observable<ResponseGeneric<any>> {
        let base = `${GestockEndpoint.commande}/list`;
        return this.http.get<ResponseGeneric<any>>(`${base}/${id}`);
    }

    getBonByFrs(id: number): Observable<ResponseGeneric<any>> {
        let base = `${GestockEndpoint.boncommandefrs}`;
        return this.http.get<ResponseGeneric<any>>(`${base}/${id}`);
    }

    getBonByClient(id: number): Observable<ResponseGeneric<any>> {
        let base = `${GestockEndpoint.boncommandeclient}`;
        return this.http.get<ResponseGeneric<any>>(`${base}/${id}`);
    }

    hasFacture(bondCommandeId: number): Observable<boolean>{
        return this.http.get<boolean>(GestockEndpoint.bon_commande_factured + '/' + bondCommandeId+ '/hasFacture');
    }
}
