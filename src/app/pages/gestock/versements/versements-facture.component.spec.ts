import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersementsFactureComponent } from './versements-facture.component';

describe('BonCommandeComponent', () => {
  let component: VersementsFactureComponent;
  let fixture: ComponentFixture<VersementsFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VersementsFactureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VersementsFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
