export interface IActeur {
    id?: number;
    nom?:string;
    prenom?:string;

}

export class Acteur implements IActeur{
    public id?: number;
    public nom?:string;
    public prenom?:string

    constructor(){

    }

}

