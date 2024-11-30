import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customNumber'
})
export class CustomNumberPipe implements PipeTransform {

    transform(value: number | string | undefined): string {
        if (!value) {
            return '0';
        }
        const numberString = value.toString();
        const parts = numberString.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] ? `.${parts[1]}` : '';
        // Utiliser un point comme séparateur de milliers
        const separator = '.';
        // Regex pour ajouter un point après chaque groupe de 3 chiffres
        const regex = /(\d)(?=(\d{3})+(?!\d))/g;

        return integerPart.replace(regex, `$1${separator}`) + decimalPart;
    }

}
