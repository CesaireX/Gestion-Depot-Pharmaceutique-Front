import {
    SERVICE_Auth,
    SERVICE_GESTOCK_EXPORT,
    SERVICE_GESTOCK_PREFIX,
    SERVICE_GESTOCK_PREFIX_LIBRE
} from "../services/url-backend";


export class GestockEndpoint {
    static readonly gestock = `${SERVICE_GESTOCK_PREFIX}/typeStructures`;
    static readonly gestock_magasin = `${SERVICE_GESTOCK_PREFIX}/magasin`;
    static readonly gestock_correctionStock = `${SERVICE_GESTOCK_PREFIX}/correctionStock`;
    static readonly gestock_produit = `${SERVICE_GESTOCK_PREFIX}/produit`;
    static readonly gestock_categorie = `${SERVICE_GESTOCK_PREFIX}/categorie`;
    static readonly gestock_creance = `${SERVICE_GESTOCK_PREFIX}/creance`;
    static readonly gestock_fournisseur = `${SERVICE_GESTOCK_PREFIX}/fournisseur`;
    static readonly gestock_transfert = `${SERVICE_GESTOCK_PREFIX}/transfertStock`;
    static readonly gestock_client = `${SERVICE_GESTOCK_PREFIX}/client`;
    static readonly gestock_modify_paiement = `${SERVICE_GESTOCK_PREFIX}/modifierpaiement`;
    static readonly gestock_by_society_magasin = `${SERVICE_GESTOCK_PREFIX}/magasinbysociety`;
    static readonly gestock_by_society_produit = `${SERVICE_GESTOCK_PREFIX}/produitbysociety`;
    static readonly gestock_by_society_categorie = `${SERVICE_GESTOCK_PREFIX}/categoriebysociety`;
    static readonly gestock_by_society_fournisseur = `${SERVICE_GESTOCK_PREFIX}/fournisseurbysociety`;
    static readonly gestock_client_by_society = `${SERVICE_GESTOCK_PREFIX}/clientbysociety`;
    static readonly gestock_by_society_uniteVente = `${SERVICE_GESTOCK_PREFIX}/uniteventebysociety`;
    static readonly gestock_by_society_uniteMesure = `${SERVICE_GESTOCK_PREFIX}/unitemesurebysociety`;
    static readonly gestock_by_society_entree_stock = `${SERVICE_GESTOCK_PREFIX}/entreebysociety`;
    static readonly gestock_by_society_sortie_stock = `${SERVICE_GESTOCK_PREFIX}/sortiebysociety`;
    static readonly gestock_by_society_course = `${SERVICE_GESTOCK_PREFIX}/coursebysociety`;
    static readonly gestock_by_society_dgestock_by_sorties_and_factureepense = `${SERVICE_GESTOCK_PREFIX}/depensebysociety`;
    static readonly gestock_by_society_facture = `${SERVICE_GESTOCK_PREFIX}/facturebysociety`;
    static readonly gestock_get_sorties_by_factures  = `${SERVICE_GESTOCK_PREFIX}/sortieStockbyfactures/`;

    static readonly gestock_utilisateur = `${SERVICE_Auth}/signup`;
    static readonly gestock_utilisateur_modified = `${SERVICE_Auth}/signupmodifiyng`;
    static readonly verify_password_email = `${SERVICE_Auth}/verifyemail`;
    static readonly reset_password = `${SERVICE_Auth}/resetpsswd`;
    static readonly change_password = `${SERVICE_Auth}/changepsswd`;
    static readonly gestock_role = `${SERVICE_GESTOCK_PREFIX}/role`;
    static readonly gestock_roleByName = `${SERVICE_GESTOCK_PREFIX}/roleByName/`;
    static readonly gestock_auth = `${SERVICE_Auth}/signin`;
    static readonly gestock_uniteVente = `${SERVICE_GESTOCK_PREFIX}/uniteVente`;
    static readonly gestock_uniteMesure = `${SERVICE_GESTOCK_PREFIX}/uniteMesure`;
    static readonly gestock_entree_stock = `${SERVICE_GESTOCK_PREFIX}/entreeStock`;
    static readonly gestock_lastest_entree_stock = `${SERVICE_GESTOCK_PREFIX}/latest_entreeStock/`;
    static readonly gestock_lastest_sortie_stock = `${SERVICE_GESTOCK_PREFIX}/latest_sortieStock/`;
    static readonly gestock_sortie_stock = `${SERVICE_GESTOCK_PREFIX}/sortieStock`;
    static readonly gestock_course = `${SERVICE_GESTOCK_PREFIX}/course`;
    static readonly gestock_commande = `${SERVICE_GESTOCK_PREFIX}/commande`;
    static readonly bon_commande_factured = `${SERVICE_GESTOCK_PREFIX}/boncommandefrs`;
    static readonly gestock_depense = `${SERVICE_GESTOCK_PREFIX}/depense`;
    static readonly gestock_inventaire = `${SERVICE_GESTOCK_PREFIX}/inventaire`;
    static readonly gestock_inventaire_export = `${SERVICE_GESTOCK_PREFIX}/inventaire/export/`;
    static readonly gestock_taxe = `${SERVICE_GESTOCK_PREFIX}/taxe`;
    static readonly gestock_ligneMagasin = `${SERVICE_GESTOCK_PREFIX}/ligneMagasin`;
    static readonly gestock_ligneMagasinByProductAndMagasin = `${SERVICE_GESTOCK_PREFIX}/ligneMagasin/ByProductAndMagasin/`;
    static readonly gestock_ligneMagasinByProduit = `${SERVICE_GESTOCK_PREFIX}/ligneMagasinByProduit/`;
    static readonly gestock_facture = `${SERVICE_GESTOCK_PREFIX}/facture`;
    static readonly gestock_societe = `${SERVICE_GESTOCK_PREFIX}/societe`;
    static readonly gestock_facture_export = `${SERVICE_GESTOCK_EXPORT}/export`;
    static readonly gestock_recu_export = `${SERVICE_GESTOCK_EXPORT}/exportrecu`;
    static readonly gestock_inventaireByMagasin = `${SERVICE_GESTOCK_PREFIX}/inventaireByMagasin/`;
    static readonly gestock_dash = `${SERVICE_GESTOCK_PREFIX}/indicateur-dash`;
    static readonly gestock_dash_entree_sorties = `${SERVICE_GESTOCK_PREFIX}/indicateursentreesorties`;
    static readonly gestock_dash_stock_actuel = `${SERVICE_GESTOCK_PREFIX}/stockactuel`;
    static readonly gestock_dash_best_client = `${SERVICE_GESTOCK_PREFIX}/bestclients`;
    static readonly gestock_dash_best_frs = `${SERVICE_GESTOCK_PREFIX}/bestfrs`;
    static readonly gestock_recu = `${SERVICE_GESTOCK_PREFIX}/recubyfacture`;
    static readonly gestock_get_a_paiement = `${SERVICE_GESTOCK_PREFIX}/paiement`;
    static readonly gestock_paye = `${SERVICE_GESTOCK_PREFIX}/paiementbyfacture`;
    static readonly gestock_paye_by_creance = `${SERVICE_GESTOCK_PREFIX}/paiementbycreance`;
    static readonly gestock_recu_by_creances = `${SERVICE_GESTOCK_PREFIX}/recubycreance`;
    static readonly gestock_paiements = `${SERVICE_GESTOCK_PREFIX}/paiements`;
    static readonly gestock_versements = `${SERVICE_GESTOCK_PREFIX}/versements`;
    static readonly gestock_recu_simple = `${SERVICE_GESTOCK_PREFIX}/recu`;
    static readonly gestock_delete_paiement = `${SERVICE_GESTOCK_PREFIX}/paiement/delete/`;
    static readonly gestock_new_recu = `${SERVICE_GESTOCK_PREFIX}/newrecu`;
    static readonly gestock_paye_facture = `${SERVICE_GESTOCK_PREFIX}/payerfacture`;
    static readonly gestock_paye_creance = `${SERVICE_GESTOCK_PREFIX}/payercreance`;
    static readonly vente_client = `${SERVICE_GESTOCK_PREFIX}/vente-client/`;
    static readonly achat_fournisseur = `${SERVICE_GESTOCK_PREFIX}/achat-fournisseur/`;
    static readonly vente_article = `${SERVICE_GESTOCK_PREFIX}/vente-article/`;
    static readonly achat_article = `${SERVICE_GESTOCK_PREFIX}/achat-article/`;
    static readonly vente_client_export = `${SERVICE_GESTOCK_PREFIX}/venteparclient/export/`;
    static readonly achat_fournisseur_export = `${SERVICE_GESTOCK_PREFIX}/achatparfournisseur/export/`;
    static readonly encaissement_export = `${SERVICE_GESTOCK_PREFIX}/encaissement/export/`;
    static readonly vente_article_export = `${SERVICE_GESTOCK_PREFIX}/ventepararticle/export/`;
    static readonly achat_article_export = `${SERVICE_GESTOCK_PREFIX}/achatpararticle/export/`;
    static readonly depense_export = `${SERVICE_GESTOCK_PREFIX}/depenses/export/`;
    static readonly chiffre_affaire_export = `${SERVICE_GESTOCK_PREFIX}/chiffreaffaire/export/`;
    static readonly client_debiteurs_export = `${SERVICE_GESTOCK_PREFIX}/clientdebiteurs/export/`;
    static readonly product_of_magasin = `${SERVICE_GESTOCK_PREFIX}/produitbymagasin/`;
    static readonly etat_stock = `${SERVICE_GESTOCK_PREFIX}/alletatstock/`;
    static readonly etat_stock_by_socite = `${SERVICE_GESTOCK_PREFIX}/all-etat-stock`;
    static readonly etat_stock_export = `${SERVICE_GESTOCK_PREFIX}/etatstock/`;
    static readonly client_debiteur = `${SERVICE_GESTOCK_PREFIX}/clients-debiteurs/`;
    static readonly fournisseur_crediteur = `${SERVICE_GESTOCK_PREFIX}/frns-crediteurs/`;
    static readonly client_debiteurByIdSociete = `${SERVICE_GESTOCK_PREFIX}/clients-debiteurs/`;
    static readonly client_historique = `${SERVICE_GESTOCK_PREFIX}/clients-historiques/`;
    static readonly fournisseur_historique = `${SERVICE_GESTOCK_PREFIX}/fournisseurs-historiques/`;
    static readonly frs_historique = `${SERVICE_GESTOCK_PREFIX}/frs-historiques/`;
    static readonly client_historique_export = `${SERVICE_GESTOCK_PREFIX}/clients-historiques/export`;
    static readonly etat_depense = `${SERVICE_GESTOCK_PREFIX}/etat-depense/`;
    static readonly encaissement = `${SERVICE_GESTOCK_PREFIX}/etat-encaissement/`;
    static readonly rapportActivite = `${SERVICE_GESTOCK_PREFIX}/etat-rapport-activite/`;
    static readonly chiffreAffaireParTrimestre = `${SERVICE_GESTOCK_PREFIX}/etat-chiffreAffaire/`;

    static readonly gestock_bon_commande = `${SERVICE_GESTOCK_PREFIX}/boncommande`;
    static readonly gestock_bon_commande_frs = `${SERVICE_GESTOCK_PREFIX}/boncommandefrs`;
    static readonly gestock_bon_commande_facture = `${SERVICE_GESTOCK_PREFIX}/boncommandefacture`;
    static readonly gestock_bon_commande_client = `${SERVICE_GESTOCK_PREFIX}/boncommandeclient`;

    static readonly commande = `${SERVICE_GESTOCK_PREFIX}/commande`;
    static readonly livraison = `${SERVICE_GESTOCK_PREFIX}/livraison`;
    static readonly reception = `${SERVICE_GESTOCK_PREFIX}/reception`;
    static readonly boncommandefrs = `${SERVICE_GESTOCK_PREFIX}/boncommandefrs`;
    static readonly boncommandeclient = `${SERVICE_GESTOCK_PREFIX}/boncommandeclient`;
    static readonly transactionclient = `${SERVICE_GESTOCK_PREFIX}/clients-historiques/month`;
    static readonly transactionfrs = `${SERVICE_GESTOCK_PREFIX}/frs-historiques/month`;

}
