import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ArrayToDatePipe'
})
export class ArrayToDatePipe implements PipeTransform {
    transform(value: any, format: string = 'dd/MM/yyyy HH:mm:ss'): string {
        if (!value || value.length < 6) {
            return '';
        }
        const dateObj = new Date(value[0], value[1] - 1, value[2], value[3], value[4], value[5]);
        // Utilisation du pipe date interne
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(dateObj);
    }
}
