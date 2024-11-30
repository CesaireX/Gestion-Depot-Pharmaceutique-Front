import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncaissementFactureComponent } from './encaissement-facture.component';

describe('BonCommandeComponent', () => {
  let component: EncaissementFactureComponent;
  let fixture: ComponentFixture<EncaissementFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncaissementFactureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncaissementFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
