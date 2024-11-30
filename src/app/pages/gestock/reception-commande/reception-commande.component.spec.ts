import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionCommandeComponent } from './reception-commande.component';

describe('BonCommandeComponent', () => {
  let component: ReceptionCommandeComponent;
  let fixture: ComponentFixture<ReceptionCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceptionCommandeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
