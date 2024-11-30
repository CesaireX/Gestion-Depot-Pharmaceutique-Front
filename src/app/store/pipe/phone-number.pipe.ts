import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

    transform(value: string|undefined): string {
        value = value!.replace(/\D/g, '');

        if (value.length <=  8) {
            // Format avec des tirets tous les deux chiffres
            // @ts-ignore
            return value.match(/.{1,2}/g).join('-');
        } else {
            // Prend les  8 premiers chiffres et les groupe par groupes de deux
            const prefix = value.slice(0, value.length -  8);
            const suffix = value.slice(-8);
            // @ts-ignore
            return `${prefix}-${suffix.match(/.{1,2}/g).join('-')}`;
        }
    }
}
