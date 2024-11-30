import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: '[appPhoneNumber]'
})
export class PhoneNumberDirective {

    constructor(private el: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event: Event) {
        const initialValue: string = this.el.nativeElement.value;
        let transformedValue: string = initialValue.replace(/\D/g, '');

        if (transformedValue.length <= 8) {
            // Format avec des tirets tous les deux chiffres
            // @ts-ignore
            transformedValue = transformedValue.match(/.{1,2}/g).join('-');
        } else {
            // Prend les 8 premiers chiffres et les groupe par groupes de deux
            const prefix = transformedValue.slice(0, transformedValue.length - 8);
            const suffix = transformedValue.slice(-8);
            // @ts-ignore
            transformedValue = `${prefix}-${suffix.match(/.{1,2}/g).join('-')}`;
        }

        // Mettre à jour la valeur de l'élément natif
        this.el.nativeElement.value = transformedValue;
    }

}
