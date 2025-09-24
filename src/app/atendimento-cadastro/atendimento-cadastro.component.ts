import { Component, OnInit } from '@angular/core';
import { AtendimentoService } from './atendimento.service';
import { TipoAtendimentoService, TipoAtendimento } from './tipo-atendimento.service';
import { ProfissionalService, Profissional } from './profissional.service';

@Component({
  selector: 'app-atendimento-cadastro',
  templateUrl: './atendimento-cadastro.component.html',
  styleUrls: ['./atendimento-cadastro.component.css']
})
export class AtendimentoCadastroComponent implements OnInit {

  isLoading = false;

  atendimento: any = {
    data: '',
    hora: '',
    idServico: null,
    idProfissional: 0,
    observacoes: ''
  };

  tiposAtendimento: any[] = [];
  profissionais: Profissional[] = [];


  constructor(
    private atendimentoService: AtendimentoService,
    private tipoAtendimentoService: TipoAtendimentoService,
    private profissionalService: ProfissionalService
  ) {}

  ngOnInit(): void {
    this.tipoAtendimentoService.listarTipos().subscribe({
      next: (tipos) => this.tiposAtendimento = tipos,
      error: () => this.tiposAtendimento = []
    });
  }

  onTipoServicoChange() {
    console.log('Valor selecionado idServico:', this.atendimento.idServico);
    const idServico = Number(this.atendimento.idServico);
    if (!isNaN(idServico) && idServico > 0) {
      const servicoSelecionado = this.tiposAtendimento.find(s => s.idServico === idServico);
      this.profissionais = servicoSelecionado ? servicoSelecionado.profissionais : [];
      this.atendimento.idProfissional = 0;
    } else {
      this.profissionais = [];
      this.atendimento.idProfissional = 0;
    }
  }

  cadastrarAtendimento(form: any) {
    console.log('Form válido?', form.valid);
    console.log('Dados do atendimento:', this.atendimento);
    if (form.valid) {
      // Monta o objeto para enviar os ids
        // Converter data de yyyy-MM-dd para dd/MM/yyyy
        const [ano, mes, dia] = this.atendimento.data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        const atendimentoParaEnviar = {
          idServico: Number(this.atendimento.idServico),
          idProfissional: Number(this.atendimento.idProfissional),
          data: dataFormatada,
          hora: this.atendimento.hora,
          observacoes: this.atendimento.observacoes
        };
        this.isLoading = true;
        console.log('Enviando para o backend:', atendimentoParaEnviar);
        this.atendimentoService.cadastrarAtendimento(atendimentoParaEnviar).subscribe({
          next: (res) => {
            this.isLoading = false;
            alert('Atendimento cadastrado com sucesso!');
            form.reset();
          },
          error: (err) => {
            this.isLoading = false;
            if (err.status === 201) {
              alert('Atendimento cadastrado com sucesso!');
              form.reset();
            } else {
              console.error('Erro ao cadastrar atendimento:', err);
              alert('Erro ao cadastrar atendimento.');
            }
          }
        });
    }
  }
}
