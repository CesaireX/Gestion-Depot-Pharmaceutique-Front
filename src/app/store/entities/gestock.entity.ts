import {Droit, Mode_paiement, Mouvement} from "../enum/enums";

export interface ResponseGeneric<T>{
    status?: string;
    payload: T;
    errors?: any;
    metadata?: any;
}

export interface TypeStructure {
    id?: number;
    libelle?: string;
    desc?: string;
    deleted?: boolean;
    societyId?: number;
}

export interface Fournisseur {
    id?: number;
     nom?:string;
     prenom?:string;
     entreprise?:string;
     telephone?:string;
     cinb?:string;
     adresse?: string;
     societyId?: string;
}

export interface Client {
    id?: number;
    nom?:string;
    prenom?:string;
    entreprise?:string;
    telephone?:string;
    cinb?:string;
    adresse?: string;
    societyId?: number;
}
export interface Utilisateur {
    id?: number;
    username?:string;
    nom?:string;
    prenoms?:string;
    telephone?:string;
    email?:string;
    resetToken?: string;
    password?:string;
    roles?:Role[];
    societies?: Societe[];
    activated?:boolean;
    cnib?:string;
    societyId?: number;
}

export interface Creance{
    id: number;
    numero: number;
    date_creance: Date;
    clientId: number;
    clientNom: string;
    clientPrenom: string;
    montant_creance: number;
    numeroCheque: string;
    societyId: number;
    montant_restant_a_payer: number;
    listRecus: Recu[];
    listPaiements?: PaiementFactureDTO[];
    motif: string;
    lastNumber?: string
}

export interface Userproperties{
    email: string;
    societes: Societe[];
    token: string;
    username: string;
    role: string[];
    societyId?: number;
}

export interface AuthEntity{
    username?:string;
    password?:string;
    societyId?: number;
}

export interface AggregationRecapitulatif{
    totalNbrClient?: number;
    totalNbrFournisseur?: number;
    totalNbrProduit?: number;
    totalNbrMagasin?: number;
    annee?: number;
    mois?: number;
    repartitions?:  Array<Map<string, number>>;
    societyId?: number;
    totaldepense?: number;
    totalfacture?: number;
    totalentree?: number;
    totalliquide?: number;
    totalliquidesorti?: number;
    totaldepenseday?: number;
    totalfactureday?: number;
    totalentreeday?: number;
    totalliquideday?: number;
    totalliquidesortiday?: number;
}

export interface Magasin {
    id?: number;
    nom?: string;
    adresse?: string;
    description?: string;
    societyId?: number;
}

export interface ArticleStockMagasin {
    Articlenom?: string;
    MagasinValues?: MagasinValues[];
    MagasinNom?: string;
    restant?: number;
    seuil?: number;
    societyId?: number;
}

export interface MagasinValues{
    MagasinNom?: string;
    restant?: number;
    ProduitNom?: string;
    societyId?: number;
}

export interface Bestclient{
    clientnom?: string;
    somme?: number;
    societyId?: number;
}

export interface Bestfrs{
    fournisseurnom?: string;
    somme?: number;
    societyId?: number;
}

export interface role{
    id?: number;
    name?: string;
    societyId?: number;
}

export interface Produit {

    id?: number;
    nom?: string;
    stockInitial?:number;
    prixventeht?: number;
    prixachatht?: number;

    prixventettc?: number;
    prixachatttc?: number;

    description?: string;

    categorieId?: number;
    categorieLibelle?: string;
    familleId?: number;
    familleLibelle?: string;
    reference?: string;

    seuil?: number;
    //magasinNom?: number;
    uniteMesureId?: number;
    uniteMesureLibelle?: number;

    ligneMagasinDTOS?: LigneMagasin[];
    societyId?: number;
    isUsed?:number;
    quantite_a_facture?: number;
    quantite_a_recevoir?: number;
    quantite_a_regler?: number;
    quantite_a_livrer?: number;

    quantiteTotal?:number;
}

export interface Categorie {
    id?: number;
    libelle?: string;
    societyId?: number;
}
export interface Famille {
    id?: number;
    libelle?: string;
    societyId?: number;
}

export interface Course {
    id?: number;
    libelle?: string;
    societyId?: number;
}

export interface UniteVente {

    id?: number;
    categorieId?:number;
    prix?:number;
    categorieLibelle?:string;
    contenance?:string;
    produitId?:number;
    produitLibelle?:string;
    uniteMesureId?: number;
    uniteMesureLibelle?: number;
    societyId?: number;
}

export interface UniteMesure {
    id?: number;
    libelle?: string;
    societyId?: number;
}

export interface Taxe {
    id?: number;
    libelle?: string;
    hauteur?: number;
    societyId?: number;
}

export interface FactureEntree{
    id?: number;
    numero?: string;
    remise?: number;
    mouvement?: Mouvement;
    listEntrees?: Entree_stock[];
    magasinId?: number;
    magasinNom?: string;
    fournisseurId?: number;
    fournisseurNom?: string;
    fournisseurPrenom?: string;
    societyId?: number;
}

export interface FactureSortie{
    id: number;
    numero: string;
    mouvement: Mouvement;
    magasinId: number;
    magasinNom: string;
    initialize: number;
    clientId: number;
    clientNom: string;
    clientPrenom: string;
    listRecus: Recu[];
    listSorties: Sortie_stock[];
    modePaiement: Mode_paiement;
    paiement: number;
    numeroCheque: string;
    montant_total: number;
    reste: number;
    nbrRecu: number;
    createdDate: Date;
    createdBy: string;
    societyId: number;
    factureAvecEntete: boolean;
}

export interface Entree_stock{
    id?: number;
    produitId?: number;
    produitNom?: string;
    produitPrix?: number;
    magasinId?: number;
    magasinSortieId?: number;
    magasinNom?: string;
    magasinSortieNom?: string;
    fournisseurId?: number;
    taxeId?: number;
    fournisseurNom?: string;
    fournisseurPrenom?: string;
    quantite?: number;
    paiement?: number;
    totalentree?: number;
    modePaiement?: Mode_paiement;
    date_entree?: Date;
    remise?: number;
    commandeId?:number;
    bonCommandeId?:number;
   // numerofacture?: string;
  //  factureId?: number;
    societyId?: number;
}

export interface Recu{
    id: number;
    numero: string;
    factureId: number;
    creanceId: number;
    modePaiement: Mode_paiement;
    date_paiement?: Date
    montant: number;
    solde_restant: number;
    createdDate: Date;
    createdBy: string;
    societyId: number;
    montantCreance: number;
    numeroCheque: string;
    lastNumber?: string
}

export interface PayerFacturesRequestDTO{
    factureIds: number[];
    creanceIds: number[];
    recuDTO?: Recu
}

export interface PaymentRequest{
    invoicePayments: any;
    totalAmount: number;
    type?: string,
    modePaiement?: Mode_paiement,
    numeroPaiement?: string,
    lastNumber?: string
    societeid?: number;
    chequevalue?: string;
}

export interface Sortie_stock{
    id?: number;
    produitId?: number;
    produitNom?: string;
    produitPrix?: number;
    taxehauteur?: number;
    taxeId?: number
    assuranceId?: number;
    assuranceLibelle?: string;
    assuranceHauteur?: number;
    magasinId?: number;
    magasinNom?: string;
    factureId?: number;
    magasinDestId?: number;
    //magasinSortieId?: number;
    magasinDestNom?: string;
    clientId?: number;
    clientNom?: string;
    clientPrenom?: string;
    quantite?: number;
    totalSortie?: number;
    date_sortie?: Date;
    societyId?: number;
    taxePourcentage?: number;
    commandeId?:number;
    bonCommandeId?:number;
}

export class Dates{
    dateDebut?: Date;
    dateFin?: Date;
    dateJournee?: Date;
    trimestre?: Date;
    entityId?:number;
    entityId2?:number;
    societyId?: number;
}

export interface Depense {
    id?: number;
    description?: string;
    prix?:number;
    dateDepense?: Date;
    courseId?: number;
    courseLibelle?: string;
    beneficiaire?:string;
    societyId?: number;
}

export interface LigneMagasin {
    id?: number;
    stockInitial?:number;
    stockActuel?:number;
    magasinId?:number;
    produitId?:number;
    magasinNom?:string;
    produitReference?:string;
    produitNom?:string;
    societyId?: number;
    stock_comptable_dispo?: number;
    stock_comptable_engage?: number;
    stock_comptable_dispo_vente?: number;
    stock_physique_dispo?: number;
    stock_physique_engage?: number;
    stock_physique_dispo_vente?: number;
    statutStock?: EtatStock; // Assurez-vous de définir cette énumération ou type
}
export interface Inventaire {
    id?: number;
    description?:string;
    dateInventaire?:string;
     produitId?: number;
     entreeId?: number;
     sortieId?: number;
     produitNom?:string;
     //produitReference?:string;
     produitSeuil?: number;
     //produitQuantite?: number;
     entreeQuantite?: number;
     sortieQuantite?: number;
     stockFinal?: number;
     unite?: number;
     //produitValeur?: number;
     //produitPrix?: number;
     categorie?: string;
     statut?:string;
    nomMagasin?:string;
    famille?:string;
    idMagasin?:number;
    stockInitial?:number;
    stock_physique_dispo?:number;
    stock_physique_engage?:number;
    stock_physique_dispo_vente?:number;
    societyId?: number;

}

export interface VenteParClient{
     id?:number;
     nomProduit?:string;
     nomClient?:string;
     prenomClient?:string;
    unite?:string;
     quantiteVendue?:string;
    montant?: number;
     dateSortie?:string;
     societyId?: number;
}
export interface AchatParFournisseur{
     id?:number;
     nomProduit?:string;
    nomFournisseur?:string;
    prenomFournisseur?:string;
    unite?:string;
    quantiteAchetee?:string;
    montant?: number;
     dateEntree?:string;
     societyId?: number;
}
export interface VenteParArticle{
     id?:number;
     nomProduit?:string;
     quantiteVendue?:string;
    unite?:string;
    montant?: number;
    societyId?: number;
}

export interface AchatParArticle{
     id?:number;
     nomProduit?:string;
    quantiteAchetee?:string;
    unite?:string;
    montant?: number;
    societyId?: number;
}

export interface EtatDepense {
    id?: number;
    natureDepense?: string;
    nomBeneficiaire?:string;
    montant?:number;
    dateDepense?: string;
    total?: number;
    societyId?: number;
}

export interface Encaissement {
    id?:number;
    nomClient?:string;
    prenomClient?:string;
    modePaiement?:number;
    paiement?:number;
    total?:number;
    totalOrangeMoney?:number;
    totalEspece?:number;
    totalCheque?:number;
    totalVersement?:number;
    totalMoovMoney?:number;
    dateSortie?:string;
    numero_fact_creance?:string;
    type?:string;
    societyId?: number;
}

export interface EtatStock {
   id?:number;
   produitNom?:string;
   magasinStockList?:[];
   stockActuel?:number;
   stock_dispo_total?:number;
    stock_dispo_vente_total?:number;
    stock_dispo_engage_total?:number;
   unite?:string;
   societyId?: number;
}

export interface RapportActivite{
      id?: number;
      montantVente?: number;
      montantEncaisse?:number;
      montantDepense?:number;
      montantAssuranceNonRembourse?:number;
    reste?:number;
      credit?:number;
      etat?:number;
      totalCredit?: number;
      societyId?: number;

}

export interface ChiffreAffaireParTrimestre {
    id?:number;
    nomClient?:string;
    prenomClient?:string;
    type?:string;
    montant?:number;
    //trimestre?: boolean;
    societyId?: number;
    trimestre?:any;
}


export interface ClientDebiteur{
     id?: number;
     nomClient?:string
     prenomClient?:string;
     ville?:string;
     tel?:string;
     entrepriseNom?:string
     sommeAdebite?:number;
     total?:number;
     societyId?: number;
}

export interface FournisseurCrediteur{
    id: number;
    nomFournisseur: string;
    prenomFournisseur: string;
    ville: string;
    tel: string;
    entrepriseNomF: string;
    sommeACredite: number;
    total: number;
    societyId?: number;
}


export interface Transaction{
     facturesDTOS?: Facture[];
     boncommandeDTOS?: BonCommande[];
     creanceDTOS?: Creance[];
     recuDTOS?: Recu[];
}

export interface TransfertStock{
     id?: number;
     motif?: string;
     transferts?: TransfertRequest[];
     societyId?: number;
     dateTransfert?: Date;
}

export interface TransfertRequest{
     sourceId?: number;
     sourceNom?: string;
     produitId?: number;
     produitNom?: string
     destinationId?: number;
     destinationNom?: string;
     quantite?: number;
}



export interface ClientHistorique{
     id?:number;
     somme?:number;
     numero?:string;
     type?:string;
     moyenPaiement:Mode_paiement;
     faitPar?:string;
     date?:string;
     reste?:number;

     totalFacturePaye?:number;
     totalCreancePaye?:number;
     totalFactureImpayee?:number;
     totalCreanceImpayee?:number;
     totalFacture?:number;
     totalCreance?:number;
    totalCommande?:number;

}


export interface FrsHistorique{
     id?:number;
     somme?:number;
     numero?:string;
     type?:string;
     moyenPaiement:Mode_paiement;
     faitPar?:string;
     date?:string;
     reste?:number;
    totalFacturePaye?:number;
    totalCreancePaye?:number;
    totalFactureImpayee?:number;
    totalCreanceImpayee?:number;
    totalFacture?:number;
    totalCreance?:number;
    totalCommande?:number;
}


export interface Societe{
     id?:number;
     nom?:string;
     adresse?:string;
     codePostal?:string;
     logo?:ArrayBuffer;
     ville?:string;
     tel?:string;
     email?:string;
     pays?:string;
     fixe?:string;
     colorprincipale?:string;
     colorsecondaire?:string;
     slogan?:string;
}

export interface Role{
    id?:number;
    name?:string;
    description?:string;
    droits?:Droit[];
    droit?:Droit;
    societyId?:number;
}

export interface PasswordReset {
     id?:number;
     username?:string;
     email?:string;
     password?:string;
     request?:string;
     resetToken?:string;
    actuelPsswd?:string|null;
}

export interface CorrectionStock{
    id?:number;
    dateCorrection?:string;
    userCorrection?:string;
    stockTheorique?:number;
    stockPhysique?:number;
    diff?:number;
    magasinId?:number;
    produitId?:number;
    magasinNom?:string;
    produitReference?:string;
    produitNom?:string;
    categorie?:string;
    qtePerime?:number;
    famille?:string;
    unite?:string;
    raison?:string;
    datePeremption?:Date;
    productExpired?:boolean;
    societyId?: number;
}


export interface BonCommande{
    id?: number;
    numero?: string;
    numero_reference?: string;
    fournisseurId?: number;
    fournisseurNom?: string;
    fournisseurPrenom?: string;
    date_livraison?: Date;
    remise?: number;
    date_expedition?: Date;
    frais_expedition?:number;
    clientNom?: string;
    clientId?: number;
    clientPrenom?: string;
    date_commande?: Date;
    sous_total?: number;
    ajustement?: number;
    montant_total?: number;
    createdDate?: Date;
    createdBy?: string;
    societyId?: number;
    lastCommandNumber?: string;
    commandes?: Commande[];
    factures?: Facture[];
    livraisons?: Livraison[];
    receptions?: Reception[];
    statutreception?: string;
    statutreglee?: string;
    //Pour une commande client
    statutlivraison?: string;
    statutfacture?: string;
    montantAssurance?:number;
}

export interface EventItem {
    date: Date;
    time: Date;
    title: string;
    description: string;
    user: string;
}

export interface Livraison{
    id?: number;
    boncommandeNumero?: number;
    statutlivraison?: string;
    boncommandeId?: number;
    numero?: string;
    clientNom?: string;
    clientPrenom?: string;
    dateLivraison?: Date;
    societyId?: number;
    ligneLivraisonClient?: LigneLivraisonClient[];
    lastNumber?: string
}

export interface Reception{
    id?: number;
    boncommandeId?: number;
    boncommandeNumero?: number;
    statutreception?: string;
    fournisseurNom?: string;
    fournisseurPrenom?: string;
    numero?: string;
    dateReception?: Date;
    societyId?: number;
    ligneReceptionFrs?: LigneReceptionFrs[];
    lastNumber?: string
}

export interface LigneReceptionFrs{
    id?: number;
    commandeId?: number;
    magasinId?: number;
    magasinNom?: number;
    receptionFournisseurId?: number;
    quantiteRecue?: number;
    articleName?: string;
}

export interface LigneLivraisonClient{
    id?: number;
    commandeId?: number;
    magasinId?: number;
    livraisonClientId?: number
    quantiteLivree?: number
    articleName?: string;
}

export interface PaiementFactureDTO{
    id?: number;
    modePaiement: Mode_paiement;
    date_paiement?: Date
    lastNumber?: string
    numeroCheque: string;
    numero?: string;
    montant?: number
    societyId?: number;
    client?: string;
    numerosFactures?: string[];
    numerosCreances?: string[];
    invoicePayments?: any[]
    type?: string
}

export interface Commande {
    id?: number;
    produitId?: number;
    magasinId?: number;
    magasin?: Magasin
    taxeId?: number;
    taxeLibelle?: string;
    taxeValue?: number;
    taxehauteur?: number;
    assuranceId?: number;
    assuranceLibelle?: string;
    assuranceHauteur?: number;
    bondCommandeId?: number;
    produitNom?: string;
    produitUnite?: string;
    magasinNom?: string;
    produitPrix?: number;
    quantite?: number;
    quantiterecue?: number;
    quantiterecuetowatch?: number;
    quantiteLivreetowatch?: number
    quantitefacturee?: number;
    quantitereglee?: number;
    quantiteLivree?: number;
    societyId?: number;
    isInvalid?: boolean;
    ligne_qui_puisse_id?: number;
}

export class Facture {
    id?: number;
    numero?: string;
    numeroboncommande?: string;
    boncommandeId?: number;
    date_facture?: Date;
    date_echeance?: Date;
    status? : string;
    // Pour une facture
    clientId?: number;
    clientNom?: string;
    clientPrenom?: string;
    telClient?: number;
    // Facture Fournisseurs
    fournisseurId?: number;
    fournisseurNom?: string;
    fournisseurPrenom?: string;
    remise?: number;

    modePaiement?: string;
    paiement?: number;
    numeroCheque?: string;
    nomAssure?: string;
    nomPatient?: string;
    matriculeAssure?: string;
    codeIDAssure?: string;
    agePatient?: string;
    sexePatient?: string;
    assuranceId?:number;
    assuranceLabel?:string;
    assuranceValue?:number;
    relationAssure?: string;
    assure? : boolean;
    rembourseParAssureur? : boolean;
    montant_total?: number;
    montantAssurance?: number;
    reste?: number;
    ajustement?: number;
    sous_total?: number;

    listSorties?: Sortie_stock[]; // Utilisation des interfaces DTO correspondantes
    listEntrees?: Entree_stock[];
    commandes?: Commande[];
    listRecus?: Recu[];
    listPaiements?: PaiementFactureDTO[];

    createdDate?: string; // Utiliser string pour les dates en TypeScript
    createdBy?: string;
    societyId?: number;
    lastNumber?: string
}

export class Assurance {
    id?: number;
    libelle?: string;
    hauteur?: number;
    societyId?: number;
}

export class VentesDuJourData{
    id?: number;
    nombreVentes?: number;
    montantEncaisse?: number;

}
