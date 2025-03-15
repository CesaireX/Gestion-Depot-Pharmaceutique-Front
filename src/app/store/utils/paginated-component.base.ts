// paginated-component.base.ts
import { Directive, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import {PaginationResult, PaginationService} from "./pagination.service";
import {Observable} from "rxjs";

@Directive()
export abstract class PaginatedComponentBase<T> implements OnInit {
    // Propriétés de pagination
    currentPage: number = 0;
    pageSize: number = 25;
    totalItems: number = 0;
    totalPages: number = 0;

    // Données
    items: T[] = [];
    filteredItems: T[] = [];
    loading: boolean = false;

    constructor(protected paginationService: PaginationService) {}

    ngOnInit(): void {
        this.loadData();
    }

    /**
     * Charge les données paginées
     */
    loadData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.loading = true;

            this.fetchPaginatedData()
                .pipe(
                    finalize(() => this.loading = false)
                )
                .subscribe(
                    (result) => {
                        this.items = result.content;
                        this.filteredItems = this.items;
                        this.currentPage = result.currentPage;
                        this.totalItems = result.totalItems;
                        this.totalPages = result.totalPages;

                        this.onDataLoaded();
                        resolve();
                    },
                    (error) => {
                        console.error('Erreur lors du chargement des données', error);
                        reject(error);
                    }
                );
        });
    }

    /**
     * Gère le changement de page
     */
    onPageChange(event: any): void {
        this.currentPage = event.page;
        this.pageSize = event.rows;
        this.loadData();
    }

    /**
     * Méthode abstraite à implémenter dans les composants dérivés
     * pour récupérer les données paginées spécifiques
     */
    protected abstract fetchPaginatedData(): Observable<PaginationResult<T>>;

    /**
     * Méthode appelée après le chargement des données
     * Peut être remplacée dans les composants dérivés
     */
    protected onDataLoaded(): void {
        // À implémenter dans les classes dérivées si nécessaire
    }

    /**
     * Filtre global pour tableau PrimeNG
     */
    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
