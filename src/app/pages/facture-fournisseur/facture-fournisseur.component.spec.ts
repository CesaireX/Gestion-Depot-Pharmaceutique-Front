import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactureFournisseurComponent } from './facture-fournisseur.component';

describe('FactureFournisseurComponent', () => {
  let component: FactureFournisseurComponent;
  let fixture: ComponentFixture<FactureFournisseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FactureFournisseurComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureFournisseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
