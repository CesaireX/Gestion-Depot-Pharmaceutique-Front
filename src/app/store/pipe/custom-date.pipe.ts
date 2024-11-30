// Exemple de transformation dans un pipe personnalisé
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

    transform(value: any): any {
        if (!value || !Array.isArray(value) || value.length < 5) {
            return value;
        }

        const [year, month, day, hours, minutes] = value;
        const date = new Date(year, month - 1, day, hours, minutes);

        // Formatage de la date comme nécessaire (exemple : dd/MM/yyyy)
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

        return formattedDate;
    }

}
