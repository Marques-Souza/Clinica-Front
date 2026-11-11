# Clínica Frontend

Uma interface web para aproximar pacientes, médicos e a equipe administrativa da clínica. A ideia é deixar as tarefas do dia a dia — como encontrar um horário e acompanhar consultas — mais simples e organizadas.

Este repositório contém o frontend. Os dados, o login e as regras de acesso são atendidos pela API do projeto.

## O que você encontra por aqui

- Cadastro, login e recuperação de senha.
- Área do paciente para completar o perfil, consultar horários disponíveis, agendar e acompanhar consultas.
- Prévia do valor da consulta durante o agendamento, conforme a configuração da especialidade.
- Busca de consulta pelo código e geração de relatório em PDF.
- Área do médico para consultar e atualizar os dados do perfil.
- Área administrativa com dashboard e telas para gerenciar médicos, usuários, especialidades e relatórios.
- Páginas protegidas conforme o perfil de acesso.

## Tecnologias

- React 19 e TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- ESLint

## Requisitos

- Node.js 22.12 ou mais recente
- npm
- API da clínica em execução

## Começando

Clone o repositório e instale as dependências:

```powershell
git clone https://github.com/Marques-Souza/Clinica-Front.git
Set-Location Clinica-Front
npm ci
```

O frontend precisa saber onde encontrar a API. Crie o arquivo local `.env.development` a partir do exemplo:

```powershell
Copy-Item .env.example .env.development
```

Confira se `VITE_API_URL` aponta para a URL da API e inclui o prefixo `/api/v1`. Para a configuração local padrão do backend, use:

```env
VITE_API_URL=http://localhost:8081/api/v1
```

Com a API em execução, inicie o frontend:

```powershell
npm run dev
```

O Vite normalmente disponibiliza a aplicação em [http://localhost:5173](http://localhost:5173). Para que as chamadas funcionem, o backend também deve permitir essa origem na configuração CORS.

## Comandos úteis

| Comando | Para que serve |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run lint` | Analisa o código com ESLint |
| `npm run build` | Verifica os tipos TypeScript e gera a versão de produção |
| `npm run preview` | Abre localmente a versão gerada em `dist` |

## Publicação

O frontend pode ser publicado em um serviço de hospedagem de sites estáticos. Configure o comando de build como `npm run build` e a pasta de publicação como `dist`.

Defina `VITE_API_URL` nas variáveis do serviço de hospedagem com o endereço público da API seguido de `/api/v1`. Essa variável é incorporada ao JavaScript durante o build, então precisa estar configurada antes de gerar a versão de produção. No serviço do backend, inclua em `CORS_ALLOWED_ORIGINS` a origem HTTPS exata do frontend, sem barra final (por exemplo, `https://clinica-pink-nu.vercel.app`).

Variáveis com prefixo `VITE_` ficam visíveis no navegador. Use-as apenas para configurações públicas, como o endereço da API; nunca coloque senhas, tokens privados ou credenciais nelas.

## Organização do projeto

```text
src/
  components/  elementos reutilizados da interface
  pages/       páginas e fluxos da aplicação
  services/    comunicação com a API e funções auxiliares
  assets/      imagens e outros recursos usados pelo app
public/        arquivos servidos diretamente pelo Vite
```

## Sobre o acesso

O frontend mostra as áreas disponíveis para cada perfil para facilitar a navegação. A API continua sendo responsável por validar o login e autorizar cada operação; esconder uma tela no navegador não substitui essa validação no servidor.
