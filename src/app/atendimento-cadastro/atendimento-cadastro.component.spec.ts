import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtendimentoCadastroComponent } from './atendimento-cadastro.component';

describe('AtendimentoCadastroComponent', () => {
  let component: AtendimentoCadastroComponent;
  let fixture: ComponentFixture<AtendimentoCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtendimentoCadastroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtendimentoCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
