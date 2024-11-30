export enum Mode_paiement {
    ESPECE = 'ESPECE',
    ORANGEMONEY = 'ORANGEMONEY',
    MOOVMONEY = 'MOOVMONEY',
    CHEQUE = 'CHEQUE',
    VERSEMENT = 'VERSEMENT'
}

export enum Type_caisse {
    CREANCE = 'CREANCE',
    FACTURE = 'FACTURE'
}

export enum Mouvement {
    ENTREE = 'ENTREE',
    SORTIE = 'SORTIE'
}

export enum Droit {
    SUPPRIMER_USER = 'SUPPRIMER_USER',
    AJOUTER_USER = 'AJOUTER_USER',
    MODIFIER_USER = 'MODIFIER_USER',
    VOIR_UTILISATEUR = 'VOIR_UTILISATEUR',
    VOIR_ROLE = 'VOIR_ROLE',
    MODIFIER_ROLE = 'MODIFIER_ROLE',
    AJOUTER_ROLE = 'AJOUTER_ROLE',
    SUPPRIMER_ROLE = 'SUPPRIMER_ROLE',
    MODIFIER_MON_MOT_DE_PASSE = 'MODIFIER_MON_MOT_DE_PASSE',
    MODIFIER_MON_COMPTE = 'MODIFIER_MON_COMPTE',

    SUPPRIMER_MAGASIN = 'SUPPRIMER_MAGASIN',
    AJOUTER_MAGASIN = 'AJOUTER_MAGASIN',
    MODIFIER_MAGASIN = 'MODIFIER_MAGASIN',

    SUPPRIMER_PRODUIT = 'SUPPRIMER_PRODUIT',
    AJOUTER_PRODUIT = 'AJOUTER_PRODUIT',
    MODIFIER_PRODUIT = 'MODIFIER_PRODUIT',
    VOIR_ARTICLE_STOCK_MAGASIN = 'VOIR_ARTICLE_STOCK_MAGASIN',
    VOIR_ARTICLE_TRANSACTION = 'VOIR_ARTICLE_TRANSACTION',

    AJOUTER_FOURNISSEUR = 'AJOUTER_FOURNISSEUR',
    MODIFIER_FOURNISSEUR = 'MODIFIER_FOURNISSEUR',
    SUPPRIMER_FOURNISSEUR = 'SUPPRIMER_FOURNISSEUR',

    AJOUTER_CLIENT = 'AJOUTER_CLIENT',
    MODIFIER_CLIENT = 'MODIFIER_CLIENT',
    SUPPRIMER_CLIENT = 'SUPPRIMER_CLIENT',

    AJOUTER_CATEGORIE = 'AJOUTER_CATEGORIE',
    MODIFIER_CATEGORIE = 'MODIFIER_CATEGORIE',
    SUPPRIMER_CATEGORIE = 'SUPPRIMER_CATEGORIE',

    AJOUTER_UNITE_MESURE = 'AJOUTER_UNITE_MESURE',
    MODIFIER_UNITE_MESURE = 'MODIFIER_UNITE_MESURE',
    SUPPRIMER_UNITE_MESURE = 'SUPPRIMER_UNITE_MESURE',



    AJOUTER_TRANSFERT_STOCK = 'AJOUTER_TRANSFERT_STOCK',
    MODIFIER_TRANSFERT_STOCK = 'MODIFIER_TRANSFERT_STOCK',
    SUPPRIMER_TRANSFERT_STOCK = 'SUPPRIMER_TRANSFERT_STOCK',
    VOIR_LISTE_TRANSFERT_STOCK = 'VOIR_LISTE_TRANSFERT_STOCK',

    AJOUTER_NATURE_DEPENSE = 'AJOUTER_NATURE_DEPENSE',
    MODIFIER_NATURE_DEPENSE = 'MODIFIER_NATURE_DEPENSE',
    SUPPRIMER_NATURE_DEPENSE = 'SUPPRIMER_NATURE_DEPENSE',

    AJOUTER_DEPENSE = 'AJOUTER_DEPENSE',
    MODIFIER_DEPENSE = 'MODIFIER_DEPENSE',
    SUPPRIMER_DEPENSE = 'SUPPRIMER_DEPENSE',

    AJOUTER_SOCIETE = 'AJOUTER_SOCIETE',
    MODIFIER_SOCIETE = 'MODIFIER_SOCIETE',
    SUPPRIMER_SOCIETE = 'SUPPRIMER_SOCIETE',



    VOIR_CLIENT_DEBITEUR = 'VOIR_CLIENT_DEBITEUR',
    VOIR_VENTE_PAR_CLIENT = 'VOIR_VENTE_PAR_CLIENT',
    VOIR_VENTE_PAR_ARTICLE = 'VOIR_VENTE_PAR_ARTICLE',
    VOIR_LISTE_DES_DEPENSE = 'VOIR_LISTE_DES_DEPENSE',
    VOIR_ENCAISSEMENT = 'VOIR_ENCAISSEMENT',
    VOIR_RAPPORT_ACTIVITE = 'VOIR_RAPPORT_ACTIVITE',
    VOIR_ETAT_STOCK = 'VOIR_ETAT_STOCK',
    VOIR_CHIFFRE_AFFAIRE_PAR_TRIMESTRE = 'VOIR_CHIFFRE_AFFAIRE_PAR_TRIMESTRE',
    VOIR_ACHAT_ARTICLE='VOIR_ACHAT_ARTICLE',
    VOIR_FOURNISSEUR_ACHAT='VOIR_FOURNISSEUR_ACHAT',
    VOIR_FOURNISSEUR_CREDITEUR='VOIR_FOURNISSEUR_CREDITEUR',
    VOIR_HISTORIQUE_FOURNISSEUR='VOIR_HISTORIQUE_FOURNISSEUR',

    VOIR_FOURNISSEURS = 'VOIR_FOURNISSEURS',
    VOIR_FOURNISSEUR_TRANSACTION = 'VOIR_FOURNISSEUR_TRANSACTION',
    VOIR_FOURNISSEUR_HISTORIQUE = 'VOIR_FOURNISSEUR_HISTORIQUE',
    VOIR_CLIENTS = 'VOIR_CLIENTS',
    VOIR_CLIENT_TRANSACTION = 'VOIR_CLIENT_TRANSACTION',
    VOIR_CLIENT_HISTORIQUE = 'VOIR_CLIENT_HISTORIQUE',
    VOIR_MAGASINS = 'VOIR_MAGASINS',
    VOIR_CATEGORIE = 'VOIR_CATEGORIE',
    VOIR_UNITE_MESURE = 'VOIR_UNITE_MESURE',
    VOIR_ARTICLE = 'VOIR_ARTICLE',
    AJOUT_ARTICLES_MAGASINS = 'AJOUT_ARTICLES_MAGASINS',

    VOIR_INVENTAIRE = 'VOIR_INVENTAIRE',
    VOIR_NATURE_DEPENSE = 'VOIR_NATURE_DEPENSE',
    VOIR_DEPENSE = 'VOIR_DEPENSE',
    VOIR_SOCIETE = 'VOIR_SOCIETE',
    VOIR_HISTORIQUE_CLIENT = 'VOIR_HISTORIQUE_CLIENT',

    VOIR_DASHBOARD = 'VOIR_DASHBOARD',

    VOIR_DIV1 = 'VOIR_DIV1',
    VOIR_DIV2 = 'VOIR_DIV2',
    VOIR_DIV3 = 'VOIR_DIV3',
    VOIR_DIV4 = 'VOIR_DIV4',
    VOIR_DIV5 = 'VOIR_DIV5',
    VOIR_DIV6 = 'VOIR_DIV6',

    VOIR_TAXE = 'VOIR_TAXE',
    VOIR_TAXE_AJOUTER = 'VOIR_TAXE_AJOUTER',
    VOIR_TAXE_MODIFIER = 'VOIR_TAXE_MODIFIER',
    VOIR_TAXE_SUPPRIMER = 'VOIR_TAXE_SUPPRIMER',

    VOIR_CREANCE = 'VOIR_CREANCE',
    VOIR_CREANCE_AJOUTER = 'VOIR_CREANCE_AJOUTER',
    VOIR_CREANCE_MODIFIER = 'VOIR_CREANCE_MODIFIER',
    VOIR_CREANCE_SUPPRIMER = 'VOIR_CREANCE_SUPPRIMER',
    VOIR_CREANCE_PAIEMENT = 'VOIR_CREANCE_PAIEMENT',

    VOIR_CORRECTION_STOCK = 'VOIR_CORRECTION_STOCK',
    VOIR_CORRECTION_STOCK_AJOUTER = 'VOIR_CORRECTION_STOCK_AJOUTER',
    VOIR_CORRECTION_STOCK_MODIFIER = 'VOIR_CORRECTION_STOCK_MODIFIER',
    VOIR_CORRECTION_STOCK_SUPPRIMER = 'VOIR_CORRECTION_STOCK_SUPPRIMER',



    // Facture Client
    AJOUTER_FACTURE_CLIENT = 'AJOUTER_FACTURE_CLIENT',
    MODIFIER_FACTURE_CLIENT = 'MODIFIER_FACTURE_CLIENT',
    SUPPRIMER_FACTURE_CLIENT = 'SUPPRIMER_FACTURE_CLIENT',
    VOIR_FACTURE_CLIENT = 'VOIR_FACTURE_CLIENT',

    // Commande Client
    AJOUTER_COMMANDE_CLIENT = 'AJOUTER_COMMANDE_CLIENT',
    MODIFIER_COMMANDE_CLIENT = 'MODIFIER_COMMANDE_CLIENT',
    SUPPRIMER_COMMANDE_CLIENT = 'SUPPRIMER_COMMANDE_CLIENT',
    VOIR_COMMANDE_CLIENT = 'VOIR_COMMANDE_CLIENT',

    // Facture Fournisseur
    AJOUTER_FACTURE_FOURNISSEUR = 'AJOUTER_FACTURE_FOURNISSEUR',
    MODIFIER_FACTURE_FOURNISSEUR = 'MODIFIER_FACTURE_FOURNISSEUR',
    SUPPRIMER_FACTURE_FOURNISSEUR = 'SUPPRIMER_FACTURE_FOURNISSEUR',
    VOIR_FACTURE_FOURNISSEUR = 'VOIR_FACTURE_FOURNISSEUR',

    // Commande Fournisseur
    AJOUTER_COMMANDE_FOURNISSEUR = 'AJOUTER_COMMANDE_FOURNISSEUR',
    MODIFIER_COMMANDE_FOURNISSEUR = 'MODIFIER_COMMANDE_FOURNISSEUR',
    SUPPRIMER_COMMANDE_FOURNISSEUR = 'SUPPRIMER_COMMANDE_FOURNISSEUR',
    VOIR_COMMANDE_FOURNISSEUR = 'VOIR_COMMANDE_FOURNISSEUR',




    // Réception d’achat
    AJOUTER_RECEPTION_ACHAT = 'AJOUTER_RECEPTION_ACHAT',
    MODIFIER_RECEPTION_ACHAT = 'MODIFIER_RECEPTION_ACHAT',
    SUPPRIMER_RECEPTION_ACHAT = 'SUPPRIMER_RECEPTION_ACHAT',
    VOIR_RECEPTION_ACHAT = 'VOIR_RECEPTION_ACHAT',

    // Livraison
    AJOUTER_LIVRAISON = 'AJOUTER_LIVRAISON',
    MODIFIER_LIVRAISON = 'MODIFIER_LIVRAISON',
    SUPPRIMER_LIVRAISON = 'SUPPRIMER_LIVRAISON',
    VOIR_LIVRAISON = 'VOIR_LIVRAISON',


    //Encaissement
    VOIR_ENCAISSEMENT_FACTURE='VOIR_ENCAISSEMENT_FACTURE',
    AJOUTER_ENCAISSEMENT='AJOUTER_ENCAISSEMENT',
    MODIFIER_ENCAISSEMENT='MODIFIER_ENCAISSEMENT',
    SUPPRIMER_ENCAISSEMENT='SUPPRIMER_ENCAISSEMENT',

    //Encaissement
    VOIR_VERSEMENT='VOIR_VERSEMENT',
    AJOUTER_VERSEMENT='AJOUTER_VERSEMENT',
    MODIFIER_VERSEMENT='MODIFIER_VERSEMENT',
    SUPPRIMER_VERSEMENT='SUPPRIMER_VERSEMENT',


}
