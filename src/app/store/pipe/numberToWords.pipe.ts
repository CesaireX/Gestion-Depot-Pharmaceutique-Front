import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberToWords'
})
export class NumberToWordsPipe implements PipeTransform {

    private units = ["", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf"];
    private teens = ["Dix", "Onze", "Douze", "Treize", "Quatorze", "Quinze", "Seize", "Dix-sept", "Dix-huit", "Dix-neuf"];
    private tens = ["", "Dix", "Vingt", "Trente", "Quarante", "Cinquante", "Soixante", "Soixante-dix", "Quatre-vingt", "Quatre-vingt-dix"];
    private thousands = ["", "Mille", "Million", "Milliard", "Billion"];

    transform(value: any): string {
        if (value === 0) return "Zéro";
        return this.convertNumberToWords(value);
    }

    private convertNumberToWords(value: any): string {
        if (value < 0) return `moins ${this.convertNumberToWords(-value)}`;

        let words = '';
        let scale = 0;

        do {
            let n = value % 1000;
            if (n !== 0) {
                let s = this.convertHundreds(n);
                if (scale > 0) {
                    // Gérer les milliers sans ajouter "Un", sauf pour les valeurs supérieures à 1 mille
                    if (scale === 1 && n === 1) {
                        s = this.thousands[scale];
                    } else {
                        s += ` ${this.thousands[scale]}${n > 1 && scale > 1 ? 's' : ''}`;
                    }
                }
                words = `${s} ${words}`.trim();
            }
            scale++;
            value = Math.floor(value / 1000);
        } while (value > 0);

        return words.trim();
    }

    private convertHundreds(value: number): string {
        let result = '';

        if (value >= 100) {
            const hundreds = Math.floor(value / 100);
            if (hundreds > 1) {
                result += `${this.units[hundreds]} Cent`;
            } else {
                result += `Cent`;
            }
            value %= 100;
        }

        if (value >= 20) {
            result += `${result ? ' ' : ''}${this.tens[Math.floor(value / 10)]}`;
            if (value % 10 > 0) {
                result += value >= 70 && value < 80 ? `-${this.teens[value % 10]}` : `-${this.units[value % 10]}`;
            }
        } else if (value >= 10) {
            result += `${result ? ' ' : ''}${this.teens[value - 10]}`;
        } else if (value > 0) {
            result += `${result ? ' ' : ''}${this.units[value]}`;
        }

        return result.trim();
    }
}
