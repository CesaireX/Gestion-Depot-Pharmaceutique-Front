import { Directive, ElementRef, HostListener } from '@angular/core';
import {NgControl} from "@angular/forms";

@Directive({
    selector: '[appFormatNumberInput]'
})
export class FormatNumberInputDirective {

    constructor(private control: NgControl) {}

    @HostListener('input', ['$event'])
    onInputChange(event: Event) {
        const initalValue = this.control.value;
        // Remplacez tous les caractères non numériques par une chaîne vide
        const sanitizedValue = initalValue.replace(/\D/g, '');
        // Formatez la valeur numérique avec des espaces chaque trois chiffres
        const formattedValue = sanitizedValue.replace(/(\d)(?=(\d{3})+\b)/g, '$1 ');
        // Mettez à jour la valeur de l'input avec la valeur formatée
        // @ts-ignore
        this.control.control.setValue(formattedValue);
    }
}
