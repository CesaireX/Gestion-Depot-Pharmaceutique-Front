import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {gestockRoutes} from './gestock-routing.module';
import { MagasinComponent } from './magasin/magasin.component';
import {RouterModule} from "@angular/router";
import {SharedCommonsModule} from "../../shared-commons.module";
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
import {Sortie_stockComponent} from "./sortie_stock/create/sortie_stock.component";
import {Sortie_listComponent} from "./sortie_stock/list/sortie_list.component";
import {TaxeComponent} from "./taxe/taxe.component";
import {FactureEntreeComponent} from "./facture/facture.component";
import {UtilisateurComponent} from "./utilisateur/utilisateur.component";
import {ConnexionComponent} from "./connexion/connexion.component";
import {AppConfigModule} from "../../layout/config/app.config.module";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AppHttpInterceptor} from "../../store/interceptors/app-http.interceptor";
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
import {ImageModule} from "primeng/image";
import { StepsModule } from 'primeng/steps';
import {RoleComponent} from "./role/role.component";
import {ClientHistoriqueComponent} from "./etats/clientHistorique/clientHistorique.component";
import {ResetPsswdComponent} from "./resetPsswd/resetPsswd.component";
import {CreanceComponent} from "./creance/creance.component";
import {CorrectionStockComponent} from "./correction_stock/correctionStock.component";
import {CustomNumberPipe} from "../../store/pipe/custom-number.pipe";
import {PhoneNumberPipe} from "../../store/pipe/phone-number.pipe";
import {FormatNumberInputDirective} from "../../store/directive/format-number-input.directive";
import {PhoneNumberDirective} from "../../store/directive/phone-number-directive.directive";
import {TransfertlistComponent} from "./transfertList/transfertlist.component";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DashboardSaasComponent} from "./saas/dashboardsass.component";
import {AdministrationComponent} from "./administration/administration.component";
import { SpeedDialModule } from 'primeng/speeddial';
import {BonCommandeComponent} from "./bon-commande/bon-commande.component";
import {CommandeClientComponent} from "./commande-client/commande-client.component";
import {ReceptionCommandeComponent} from "./reception-commande/reception-commande.component";
import {LivraisonCommandeComponent} from "./livraison-commande/livraison-commande.component";
import {PaiementComponent} from "./paiement/paiement.component";
import {FactureFournisseurComponent} from "../facture-fournisseur/facture-fournisseur.component";
import {FactureClientComponent} from "../facture-client/facture-client.component";
import {AchatParFournisseurComponent} from "./etats/achatParFournisseur/achatParFournisseur.component";
import {AchatParArticleComponent} from "./etats/achatParArticle/achatParArticle.component";
import {FournisseurCrediteurComponent} from "./etats/fournisseurCrediteur/fournisseurCrediteur.component";
import {FournisseurHistoriqueComponent} from "./etats/fournisseurHistorique/fournisseurHistorique.component";
import {CustomDatePipe} from "../../store/pipe/custom-date.pipe";
import {EncaissementFactureComponent} from "./encaissements/encaissement-facture.component";
import {VersementsFactureComponent} from "./versements/versements-facture.component";
import { AddProduitMagasinComponent } from './add-produit-magasin/add-produit-magasin.component';
import {NumberToWordsPipe} from "../../store/pipe/numberToWords.pipe";
import {Transfert_stockComponent} from "./transfertStock/transfert_stock.component";
@NgModule({
    declarations: [
        MagasinComponent,
        ProduitComponent,
        CategorieComponent,
        ClientComponent,
        FournisseurComponent,
        DepenseComponent,
        UniteMesureComponent,
        UniteMesureComponent,
        Entree_stockComponent,
        Entree_listComponent,
        Sortie_stockComponent,
        Sortie_listComponent,
        CourseComponent,
        DepenseComponent,
        Entree_listComponent,
        InventaireComponent,
        TaxeComponent,
        FactureEntreeComponent,
        EncaissementFactureComponent,
        VersementsFactureComponent,
        UtilisateurComponent,
        ConnexionComponent,
        NotauthorizeComponent,
        VenteParClientComponent,
        VenteParArticleComponent,
        Transfert_stockComponent,
        ListeDepenseComponent,
        EncaissementComponent,
        VenteParArticleComponent,
        EtatStockComponent,
        RapportActiviteComponent,
        ChiffreAffaireParTrimestreComponent,
        RapportActiviteComponent,
        ClientDebiteurComponent,
        SocieteComponent,
        RoleComponent,
        ClientHistoriqueComponent,
        ResetPsswdComponent,
        CorrectionStockComponent,
        CustomNumberPipe,
        CustomDatePipe,
        NumberToWordsPipe,
        PhoneNumberPipe,
        FormatNumberInputDirective,
        CreanceComponent,
        PhoneNumberDirective,
        TransfertlistComponent,
        DashboardSaasComponent,
        AdministrationComponent,
        BonCommandeComponent,
        CommandeClientComponent,
        ReceptionCommandeComponent,
        LivraisonCommandeComponent,
        FactureFournisseurComponent,
        FactureClientComponent,
        PaiementComponent,
        AchatParFournisseurComponent,
        AchatParArticleComponent,
        FournisseurCrediteurComponent,
        FournisseurHistoriqueComponent,
        CustomDatePipe,
        AddProduitMagasinComponent
    ],
    imports: [
        CommonModule, SharedCommonsModule, StepsModule,
        SpeedDialModule,
        RouterModule.forChild(gestockRoutes)
        , AppConfigModule, ImageModule, ProgressSpinnerModule
    ],
    exports: [
        CustomNumberPipe,
        PhoneNumberDirective
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true},

    ]
})
export class GestockModule { }
