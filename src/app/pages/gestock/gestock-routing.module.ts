import { Routes } from '@angular/router';
import {MagasinComponent} from "./magasin/magasin.component";
import {ProduitComponent} from "./produit/produit.component";
import {CategorieComponent} from "./categorie/categorie.component";
import {ClientComponent} from "./client/client.component";
import {FournisseurComponent} from "./fournisseur/fournisseur.component";
import {DepenseComponent} from "./depense/depense.component";
import {UniteMesureComponent} from "./uniteMesure/uniteMesure.component";
import {Entree_stockComponent} from "./entree_stock/create/entree_stock.component";
import {Entree_listComponent} from "./entree_stock/list/entree_list.component";
import {CourseComponent} from "./course/course.component";
import {InventaireComponent} from "./Inventaire/inventaire.component";
import {TaxeComponent} from "./taxe/taxe.component";
import {FactureEntreeComponent} from "./facture/facture.component";
import {Sortie_stockComponent} from "./sortie_stock/create/sortie_stock.component";
import {Sortie_listComponent} from "./sortie_stock/list/sortie_list.component";
import {UtilisateurComponent} from "./utilisateur/utilisateur.component";
import {NotauthorizeComponent} from "./notauthorize/notauthorize.component";
import {VenteParClientComponent} from "./etats/venteParClient/venteParClient.component";
import {VenteParArticleComponent} from "./etats/venteParArticle/venteParArticle.component";
import {ListeDepenseComponent} from "./etats/listeDepense/listeDepense.component";
import {EncaissementComponent} from "./etats/encaissement/encaissement.component";
import {EtatStockComponent} from "./etats/EtatStock/etatStock.component";
import {RapportActiviteComponent} from "./etats/rapportActivite/rapportActivite.component";
import {ClientDebiteurComponent} from "./etats/clientDebiteur/clientDebiteur.component";
import {ChiffreAffaireParTrimestreComponent} from "./etats/ChiffreAffaireParTrimestre/ChiffreAffaireParTrimestre.component";
import {SocieteComponent} from "./societe/societe.component";
import {RoleComponent} from "./role/role.component";
import {ClientHistoriqueComponent} from "./etats/clientHistorique/clientHistorique.component";
import {CorrectionStockComponent} from "./correction_stock/correctionStock.component";
import {CreanceComponent} from "./creance/creance.component";
import {AuthorizationGuard} from "../../store/guards/authorization.guard";
import {TransfertlistComponent} from "./transfertList/transfertlist.component";
import {DashboardSaasComponent} from "./saas/dashboardsass.component";
import {AdministrationComponent} from "./administration/administration.component";
import {BonCommandeComponent} from "./bon-commande/bon-commande.component";
import {CommandeClientComponent} from "./commande-client/commande-client.component";
import {FactureFournisseurComponent} from "../facture-fournisseur/facture-fournisseur.component";
import {FactureClientComponent} from "../facture-client/facture-client.component";
import {ReceptionCommandeComponent} from "./reception-commande/reception-commande.component";
import {LivraisonCommandeComponent} from "./livraison-commande/livraison-commande.component";
import {PaiementComponent} from "./paiement/paiement.component";
import {AchatParArticleComponent} from "./etats/achatParArticle/achatParArticle.component";
import {AchatParFournisseurComponent} from "./etats/achatParFournisseur/achatParFournisseur.component";
import {FournisseurCrediteurComponent} from "./etats/fournisseurCrediteur/fournisseurCrediteur.component";
import {FournisseurHistoriqueComponent} from "./etats/fournisseurHistorique/fournisseurHistorique.component";
import {EncaissementFactureComponent} from "./encaissements/encaissement-facture.component";
import {VersementsFactureComponent} from "./versements/versements-facture.component";
import {AddProduitMagasinComponent} from "./add-produit-magasin/add-produit-magasin.component";
import {Transfert_stockComponent} from "./transfertStock/transfert_stock.component";

export const gestockRoutes: Routes = [{
    path:'',
    children:[
        { path: 'magasin', component: MagasinComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_MAGASINS'] } },
        { path: 'produit', component: ProduitComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ARTICLE'] } },
        { path: 'categorie', component: CategorieComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CATEGORIE'] } },
        { path: 'client', component: ClientComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CLIENTS'] } },
        {path:'utilisateur', component:UtilisateurComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_UTILISATEUR'] } },
        {path:'fournisseur', component:FournisseurComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FOURNISSEURS'] } },
        {path:'uniteMesure', component:UniteMesureComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_UNITE_MESURE'] } },
        {path:'taxe', component:TaxeComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_TAXE'] } },
        {path:'facture', component:FactureEntreeComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FACTURE'] } },
        {path:'entreestock', component:Entree_stockComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ENTREE'] } },
        {path:'entreestocklist', component:Entree_listComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_LISTE_ENTRE_STOCK'] } },
        {path:'course', component:CourseComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_NATURE_DEPENSE'] } },
        {path:'societe', component:SocieteComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_SOCIETE'] } },
        {path:'depense', component:DepenseComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_DEPENSE'] } },
        {path:'inventaire', component:InventaireComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_INVENTAIRE'] } },
        {path:'sortieStock', component:Sortie_stockComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_SORTIE'] } },
        {path:'sortieStocklist', component:Sortie_listComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_LISTE_SORTIE_STOCK'] } },
        {path:'transfertList', component:TransfertlistComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_LISTE_SORTIE_STOCK'] } },
        {path:'transfertStock', component:Transfert_stockComponent, canActivate: [AuthorizationGuard], data: { roles: ['AJOUTER_SORTIE_STOCK'] } },
        { path: "notauthorize",  component: NotauthorizeComponent},
        {path:'venteparclient', component:VenteParClientComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_VENTE_PAR_CLIENT'] } },
        {path:'ventepararticle', component:VenteParArticleComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_VENTE_PAR_ARTICLE'] } },
        {path:'clientdebiteur', component:ClientDebiteurComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CLIENT_DEBITEUR'] } },
        {path:'clienthistorique', component:ClientHistoriqueComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_HISTORIQUE_CLIENT'] } },
        {path:'etatstock', component:EtatStockComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ETAT_STOCK'] } },
        {path:'etatDepense', component:ListeDepenseComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_LISTE_DES_DEPENSE'] } },
        {path:'encaissement', component:EncaissementComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ENCAISSEMENT'] } },
        {path:'rapportActivite', component:RapportActiviteComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_RAPPORT_ACTIVITE'] } },
        {path:'chiffreAffaire', component:ChiffreAffaireParTrimestreComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CHIFFRE_AFFAIRE_PAR_TRIMESTRE'] } },
        {path:'role', component:RoleComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ROLE'] } },
        {path:'creance', component:CreanceComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CREANCE'] } },
        {path:'correctionStock', component:CorrectionStockComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CORRECTION_STOCK'] } },
        {path:'dashboards', component:DashboardSaasComponent},
        {path:'wizard', component:AdministrationComponent},

        // {path:'bonCommande', component:BonCommandeComponent },
        //{path:'commandeClient', component:CommandeClientComponent },

        {path:'caisse', component:EncaissementFactureComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ENCAISSEMENT_FACTURE'] } },
        {path:'versement', component:VersementsFactureComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_VERSEMENT'] } },

        //{path:'reception', component:ReceptionCommandeComponent},
        //{path:'livraison', component:LivraisonCommandeComponent},
       // {path:'paiement', component:PaiementComponent},
       // {path:'factureFournisseur', component:FactureFournisseurComponent },
       // {path:'factureFournisseur/:id', component: FactureFournisseurComponent },
        // {path:'factureClient', component:FactureClientComponent },
        // {path:'factureClient/:id', component:FactureClientComponent },


       {path:'bonCommande', component:BonCommandeComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_COMMANDE_FOURNISSEUR'] }},
        {path:'commandeClient', component:CommandeClientComponent , canActivate: [AuthorizationGuard], data: { roles: ['VOIR_COMMANDE_CLIENT'] }},
        {path:'reception', component:ReceptionCommandeComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_RECEPTION_ACHAT'] }},
        {path:'livraison', component:LivraisonCommandeComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_LIVRAISON'] }},
        {path:'paiement', component:PaiementComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_CORRECTION_STOCK'] }},
        {path:'factureFournisseur', component:FactureFournisseurComponent , canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FACTURE_FOURNISSEUR'] }},
        {path:'factureFournisseur/:id', component: FactureFournisseurComponent , canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FACTURE_FOURNISSEUR'] }},
        {path:'factureClient', component:FactureClientComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FACTURE_CLIENT'] } },
        {path:'factureClient/:id', component:FactureClientComponent , canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FACTURE_CLIENT'] }},

        {path:'achatpararticle', component:AchatParArticleComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_ACHAT_ARTICLE'] }},
        {path:'achatparfournisseur', component:AchatParFournisseurComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FOURNISSEUR_ACHAT'] }},
        {path:'fournisseurcrediteur', component:FournisseurCrediteurComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_FOURNISSEUR_CREDITEUR'] }},
        {path:'fournisseurhistorique', component:FournisseurHistoriqueComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_HISTORIQUE_FOURNISSEUR'] }},
        {path:'addProduitMagasin', component:AddProduitMagasinComponent, canActivate: [AuthorizationGuard], data: { roles: ['VOIR_HISTORIQUE_FOURNISSEUR'] }},
    ]
}];

