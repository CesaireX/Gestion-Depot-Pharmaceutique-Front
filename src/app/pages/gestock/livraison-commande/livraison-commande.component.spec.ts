import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonCommandeComponent } from './livraison-commande.component';

describe('BonCommandeComponent', () => {
  let component: LivraisonCommandeComponent;
  let fixture: ComponentFixture<LivraisonCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LivraisonCommandeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisonCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
