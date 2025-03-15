// pagination.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginationParams {
    page: number;
    size: number;
}

export interface PaginationResult<T> {
    content: T[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class PaginationService {
    constructor(private http: HttpClient) {}

    /**
     * Méthode générique pour effectuer des requêtes paginées
     * @param url - L'URL de l'endpoint paginé
     * @param params - Les paramètres de pagination (page et taille)
     * @returns Un Observable contenant le résultat paginé
     */
    fetchPaginatedData<T, R>(url: string, params: PaginationParams): Observable<R> {
        return this.http.get<R>(`${url}?page=${params.page}&size=${params.size}`);
    }

    /**
     * Méthode d'aide pour extraire le contenu paginé d'une réponse
     * @param response - La réponse de l'API contenant les données paginées
     * @returns Le résultat paginé formaté
     */
    extractPaginationResult<T>(response: any): PaginationResult<T> {
        // Adapter selon la structure de réponse de votre API
        if (response && response.payload) {
            return {
                content: response.payload.content || [],
                currentPage: response.payload.currentPage || 0,
                totalItems: response.payload.totalItems || 0,
                totalPages: response.payload.totalPages || 0
            };
        }

        return {
            content: [],
            currentPage: 0,
            totalItems: 0,
            totalPages: 0
        };
    }
}
