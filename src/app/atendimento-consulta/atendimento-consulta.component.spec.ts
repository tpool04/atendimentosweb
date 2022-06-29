import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtendimentoConsultaComponent } from './atendimento-consulta.component';

describe('AtendimentoConsultaComponent', () => {
  let component: AtendimentoConsultaComponent;
  let fixture: ComponentFixture<AtendimentoConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtendimentoConsultaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtendimentoConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
