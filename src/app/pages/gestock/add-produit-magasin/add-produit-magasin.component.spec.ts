import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProduitMagasinComponent } from './add-produit-magasin.component';

describe('AddProduitMagasinComponent', () => {
  let component: AddProduitMagasinComponent;
  let fixture: ComponentFixture<AddProduitMagasinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProduitMagasinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProduitMagasinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
