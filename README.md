
# Atendimentos Web

Este projeto é um sistema web para cadastro, consulta e gerenciamento de atendimentos, com autenticação de dois fatores (2FA) opcional para maior segurança.

## Funcionalidades
- Cadastro e edição de clientes
- Login com ou sem autenticação de dois fatores (2FA)
- Ativação e confirmação de 2FA via Google Authenticator
- Cadastro e consulta de atendimentos
- Exibição do perfil do usuário na barra superior

## Tecnologias Utilizadas
- Angular
- Bootstrap
- TypeScript
- API RESTful (backend externo)

## Como rodar o projeto
1. Instale as dependências:
	```
	npm install
	```
2. Inicie o servidor de desenvolvimento:
	```
	npm start
	```
3. Acesse o sistema em [http://localhost:4200](http://localhost:4200)

## Observações
- O backend deve estar rodando e acessível nas URLs configuradas nos arquivos de ambiente.
- O 2FA é opcional: usuários podem acessar o sistema sem ativar o 2FA, mas podem ativar a qualquer momento para maior segurança.

## Estrutura Principal
- `src/app/login/` — Tela de login e fluxo de 2FA
- `src/app/consulta-cadastro/` — Consulta e edição de dados do cliente
- `src/app/ativar-2fa/` — Componente de ativação do 2FA
- `src/app/app.component.*` — Barra de navegação e roteamento principal

## Contribuição
Pull requests são bem-vindos! Para sugestões, abra uma issue.

---

© 2025 Atendimentos Web
