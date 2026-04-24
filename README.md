# Sistema de Moeda Estudantil

Monorepo de **API REST (Spring Boot)** + **SPA (React, Vite)** com **PostgreSQL**, voltado a disciplina de laboratório de software: moedas virtuais emitidas por professores, resgate de vantagens por alunos e cadastro por parceiros, com autenticação JWT e e-mail opcional (JavaMail).

---

## Conteúdo

| # | Seção |
|---|--------|
| 1 | [Visão geral e escopo](#1-visão-geral-e-escopo) |
| 2 | [Stack e versões](#2-stack-e-versões) |
| 3 | [Arquitetura do backend](#3-arquitetura-do-backend) |
| 4 | [Front-end](#4-front-end) |
| 5 | [Estrutura do repositório](#5-estrutura-do-repositório) |
| 6 | [Requisitos e portas](#6-requisitos-e-portas) |
| 7 | [Execução local](#7-execução-local) |
| 8 | [Variáveis de ambiente](#8-variáveis-de-ambiente) |
| 9 | [API HTTP](#9-api-http) |
| 10 | [Segurança e autenticação](#10-segurança-e-autenticação) |
| 11 | [Documentação de análise (UML)](#11-documentação-de-análise-uml) |
| 12 | [Git: commits e sprints](#12-git-commits-e-sprints) |
| 13 | [Autores e licença](#13-autores-e-licença) |

---

## 1. Visão geral e escopo

**Domínio:** instituição de ensino, professores, alunos e parceiros comerciais. Professores recebem crédito semestral (regra de negócio: 1.000 moedas / semestre) e transferem saldo a alunos com justificativa obrigatória. Alunos resgatam vantagens (custo em moedas); o sistema persiste transações, gera identificador de resgate (cupom) e pode notificar por e-mail conforme configuração.

**Entregas do repositório:** código (backend/frontend), `docker-compose` para banco de desenvolvimento, histórias e artefatos em `docs/uml`.

**Fronteiras do sistema (macro):** a SPA consome somente a API; não há lógica de negócio duplicada no client além de validação de formulário e chamadas agregadas em fachadas TypeScript em `frontend/src/api/`.

---

## 2. Stack e versões

| Camada | Tecnologia |
|--------|------------|
| runtime API | Java 17 |
| framework server | Spring Boot 3.2.x |
| persistência | Spring Data JPA, Hibernate, PostgreSQL |
| segurança | Spring Security (stateless), JWT (biblioteca jjwt) |
| e-mail | Spring `JavaMailSender` (desligável por configuração) |
| client | React 18, TypeScript |
| build client | Vite 5, Tailwind CSS 3 |
| banco (dev) | `postgres:16-alpine` via Docker Compose |

**Indicadores (opcional em CI):** ![Java](https://img.shields.io/badge/Java-17-437291?logo=openjdk) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)

---

## 3. Arquitetura do backend

Organização em pacotes sob `com.moedaestudantil`:

| Camada | Responsabilidade |
|--------|------------------|
| `domain` | Modelo de domínio, portas (interfaces) para persistência e serviços externos |
| `application` | Casos de uso, fachadas (`AutenticacaoFachada`, `TransacaoFachada`, etc.), fábricas (`TransacaoFabrica`), strategies de notificação, fluxo de resgate (Template Method) |
| `infrastructure` | Adapters JPA, segurança JWT, integração e-mail, seed opcional de dados |
| `web` | Controllers REST, DTOs de borda, tratamento global de exceções |

**Princípios explícitos:** separação domínio / aplicação / infraestrutura, dependência das implementações apontando para o núcleo (portas), DTOs na borda HTTP.

---

## 4. Front-end

- **Estrutura por feature** em `frontend/src/features` (auth, extrato, vantagens, envio de moedas).
- **Fachada HTTP** em `frontend/src/api` (`*Fachada.ts`): uma função de alto nível por agregado, abstraindo `fetch` e o header `Authorization`.
- **Proxy de desenvolvimento** em [frontend/vite.config.ts](frontend/vite.config.ts): requisições a `/api` encaminhadas a `http://localhost:8080` (evita CORS no dia a dia com um único origin no browser em dev).

**Build de produção:** `npm run build` gera `frontend/dist`. Se API e arquivos estáticos forem publicados em hosts diferentes, defina `VITE_API_BASE` apontando para a URL pública da API (veja tabela de variáveis abaixo).

---

## 5. Estrutura do repositório

```
sistema-moeda-estudantil/
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   └── src/main/java/com/moedaestudantil/
│       ├── MoedaEstudantilApplication.java
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── web/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/              # app, features, api
├── docs/uml/             # histórias de usuário, diagramas
└── docker-compose.yml    # Postgres 16 (dev)
```

---

## 6. Requisitos e portas

| Componente | Versão / nota | Porta padrão |
|------------|----------------|--------------|
| JDK | 17+ | — |
| Maven | 3.8+ (ou IDE com import do `pom.xml`) | — |
| Node.js | 18 LTS+ | — |
| PostgreSQL | 14+ (compatível com driver atual) | **5432** |
| API Spring | — | **8080** (`PORT` configurável) |
| Vite (dev) | — | **5173** |

Credenciais padrão do Compose: usuário `moeda`, senha `moeda`, database `moeda` ([docker-compose.yml](docker-compose.yml)).

---

## 7. Execução local

**Ordem recomendada:** banco → API → client.

1. **Banco**
   - `docker compose up -d` na raiz, **ou**
   - instância PostgreSQL local; ajuste `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` para o seu cluster.

2. **API** (diretório `backend`):
   ```bash
   mvn spring-boot:run
   ```
   Verifique health: `GET http://localhost:8080/api/v1/instituicoes` (rota pública, lista vazia ou com dados iniciais).

3. **Client** (diretório `frontend`):
   ```bash
   npm install
   npm run dev
   ```
   Aplicação: `http://localhost:5173` (proxy ativo para `/api` → `http://localhost:8080`).

4. **Produção (front only):**
   ```bash
   cd frontend && npm run build
   ```
   Sirva `dist/` com Nginx ou estático; configure `VITE_API_BASE` no build se a API estiver noutro origin.

O Spring **não** lê arquivos `.env` do disco por padrão. Variáveis devem ser exportadas no shell, definidas na run configuration da IDE ou no ambiente de deploy.

---

## 8. Variáveis de ambiente

Referência alinhada a [application.yaml](backend/src/main/resources/application.yaml) e [backend/.env.example](backend/.env.example).

| Variável | Escopo | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | API | JDBC, ex. `jdbc:postgresql://localhost:5432/moeda` |
| `DATABASE_USER` / `DATABASE_PASSWORD` | API | Credenciais PostgreSQL |
| `JWT_SECRET` | API | String forte (produção); deriva chave HMAC no serviço JWT |
| `JWT_EXPIRATION_MIN` / `app.jwt.expiration-minutes` | API | Validade do token (minutos) |
| `MAIL_ENABLED` | API | `true` ativa envio; exige SMTP válido |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | API | Parâmetros SMTP |
| `PORT` | API | Porta do servidor (default 8080) |
| `VITE_API_BASE` | build front | Base URL da API; vazio = mesma origem (útil com proxy) |

Em produção: rotacione `JWT_SECRET`, desative `show-sql` e defina `ddl-auto` apropriado (não usar `update` sem controle de migração).

---

## 9. API HTTP

Rotas de referência; prefixo: **`/api/v1`**. Código-fonte: pacote `com.moedaestudantil.web`.

| Recurso (HTTP) | Acesso / papel | Observação |
|----------------|----------------|------------|
| `GET /api/v1/instituicoes` | Público | Lista para cadastro |
| `POST /api/v1/auth/registrar` · `POST /api/v1/auth/entrar` | Público | Resposta com `accessToken` (JWT) |
| `GET /api/v1/auth/eu` | Autenticado | Sessão atual |
| `GET /api/v1/professores/meu-saldo` | `PROFESSOR` | Crédito semestral consolidado na leitura |
| `POST /api/v1/professores/enviar-moedas` | `PROFESSOR` | JSON: `alunoId`, `quantidade`, `mensagemJustificativa` |
| `GET /api/v1/alunos-na-mesma-institucao` | `PROFESSOR` | `page`, `size`, `sort` (Spring Data) |
| `GET /api/v1/transacoes/extrato` | `ALUNO` ou `PROFESSOR` | Extrato conforme o papel do token |
| `GET /api/v1/vantagens` | Público | Catálogo; paginação padrão Spring |
| Vantagens parceiro (`/api/v1/parceiro/...`) | `PARCEIRO` | Métodos: ver [ControleVantagensResgate.java](backend/src/main/java/com/moedaestudantil/web/ControleVantagensResgate.java) |
| `POST /api/v1/alunos/resgatar-vantagem/{id}` | `ALUNO` | Débito, registro, notificação conforme regras |

**Erros de regra de negócio:** tipicamente HTTP 422 (corpo com `{ "erro": "…" }` via handler global). Credenciais inválidas: 401.

---

## 10. Segurança e autenticação

- **Mecanismo:** JWT no header `Authorization: Bearer <token>`.
- **Filtro:** leitura do token e população do `SecurityContext` (ver `infrastructure.security`).
- **Métodos protegidos** com `@PreAuthorize` por papel (`ALUNO`, `PROFESSOR`, `PARCEIRO` mapeados a `hasRole`).

CORS: em dev o proxy do Vite reduz a necessidade de requisições cross-origin; em deploy separado, ajuste `ConfiguracaoHttpSecurity` e origens conforme o domínio público.

---

## 11. Documentação de análise (UML)

- Histórias de usuário: [docs/uml/historias_de_usuario.md](docs/uml/historias_de_usuario.md)
- **Diagramas em PlantUML (fonte `.puml`, exportáveis a PNG/SVG):** [docs/uml](docs/uml) — índice e instruções em [docs/uml/README.md](docs/uml/README.md) (casos de uso, domínio, componentes, portas/adaptadores, sequência envio e resgate).

---

## 12. Git: commits e sprints

- **Padrão de assunto (Conventional Commits + rastreabilidade de sprint):**  
  `tipo(escopo): descrição [SprintNN][USmm]`
- Exemplos: `feat(auth): registro aluno e instituição [Sprint01][US01]`, `fix(extrato): paginação default [Sprint02][US04]`.
- **Estratégia de branch/tag:** `sprint-0N` com merge em `main` e/ou tag `sprint-0N` no commit de entrega; evite monocommits que misturem múltiplas histórias sem rastreio.

Referência: [Conventional Commits](https://www.conventionalcommits.org/).

---

## 13. Autores e licença

**Autores:** equipe do projeto (preencher nomes, turma e repositórios, conforme exigência da disciplina).

**Licença:** a definir (sugerir explicitar, ex. MIT ou licença institucional).
