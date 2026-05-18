# Sistema de Moeda Estudantil

> Atualizacao: o projeto agora usa RabbitMQ para fila de notificacoes e um worker para enviar e-mail via EmailJS e WhatsApp via ZapSender.

**Monorepo** de **API REST (Spring Boot)** + **SPA (React, Vite, TypeScript)** com **PostgreSQL** e **RabbitMQ**: moedas virtuais emitidas por professores, resgate de vantagens por alunos e cadastro/gestão por parceiros. Autenticação **JWT** (stateless) e notificações assíncronas via **EmailJS** e **ZapSender**. Projeto de **laboratório de software** com histórias e diagramas em `docs/uml/`.

<div align="center">

[![Java](https://img.shields.io/badge/Java-17-437291?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-a%20definir-lightgrey)](#-autores-e-licença)

[Funcionalidades](#-funcionalidades) · [Tecnologias](#-tecnologias) · [Dependências (Maven)](#-dependências-maven) · [Estrutura](#-estrutura-do-repositório) · [Como o backend funciona](#-como-o-backend-funciona) · [API](#-endpoints-da-api) · [Como rodar](#-como-rodar-o-projeto)

</div>

---

> **TL;DR** | **O quê:** fidelidade acadêmica com saldo, extrato e vantagens. | **Quem:** professores, alunos, parceiros (RBAC). | **Dados:** PostgreSQL; crédito semestral e chave de semestre em `America/Sao_Paulo`. | **Mensagens:** RabbitMQ + worker para EmailJS/ZapSender. | **Lógica de negócio** só no servidor.

---

## Conteúdo

1. [Visão e domínio](#-visão-de-produto-e-domínio)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura (resumo)](#-arquitetura-resumo)
4. [Tecnologias](#-tecnologias)
5. [Dependências (Maven)](#-dependências-maven)
6. [Estrutura do repositório](#-estrutura-do-repositório)
7. [Como o backend funciona](#-como-o-backend-funciona)
8. [Endpoints da API](#-endpoints-da-api)
9. [Como rodar o projeto](#-como-rodar-o-projeto)
10. [Variáveis de ambiente](#-variáveis-de-ambiente)
11. [Segurança e autenticação](#-segurança-e-autenticação)
12. [Produção e cuidados](#-produção-e-cuidados)
13. [Documentação UML e Git](#-documentação-uml)
14. [Links úteis](#-links-úteis)
15. [Autores e licença](#-autores-e-licença)

---

## Visão de produto e domínio

- **Regra central:** a cada **novo semestre lógico**, o professor recebe **+1.000 moedas** (atualização de saldo ao consultar enviar, conforme `TransacaoFachada` e [`SemestreUtil`](backend/src/main/java/com/moedaestudantil/application/SemestreUtil.java)).
- **Semestre** no código: chave `AAAA-S` (ex.: `2026-1` jan–jun, `2026-2` jul–dez) no fuso `America/Sao_Paulo`.
- **Envio de moedas:** apenas para **aluno da mesma instituição**; **justificativa obrigatória**; validação de saldo.
- **Resgate:** aluno consome vantagem de parceiro; sistema registra trânsito e identificador de resgate; e-mail se `MAIL_ENABLED=true` e SMTP válido.

**Glossário**

| Termo | Descrição |
|-------|------------|
| Moeda | Unidade inteira de crédito (`long`). |
| Extrato | Listagem conforme o **papel** do token (aluno x professor). |
| Vantagem / resgate | Oferta de parceiro; débito do aluno e rastreabilidade. |

A SPA chama somente a API; regras críticas **não** dependem de validação exclusiva do browser.

---

## Funcionalidades

Atualizacao de notificacoes: envio de moedas e resgate de premio agora publicam eventos no RabbitMQ. O worker envia e-mail via EmailJS e WhatsApp via ZapSender quando as respectivas credenciais estao configuradas.

- **Registro e login** – Cadastro por perfil, instituição, JWT no client (`accessToken`).
- **Crédito semestral (professor)** – Garantia automática de **1.000 moedas** por semestre ao trocar a chave; saldo e extrato.
- **Envio de moedas** – Professor seleciona aluno da mesma instituição, quantidade e justificativa; notificação opcional ao aluno.
- **Catálogo de vantagens** – Listagem (páginas Spring); parceiros mantêm ofertas conforme controladores de parceiro.
- **Resgate (aluno)** – Débito e registro de resgate (cupom); regras no backend.
- **E-mail (opcional)** – *Feature flag* `MAIL_ENABLED`; desligado no dev sem SMTP.
- **Interface SPA** – React + Vite, rotas, fachadas TypeScript em `frontend/src/api` (fetch + `Authorization`).

*Sugestão de README:* adicione em `docs/` capturas da home, login, extrato e tela de envio — o repositório ainda não versiona *screenshots* (opcional, como no projeto de referência).

---

## Arquitetura (resumo)

### Atores e sistema

```mermaid
flowchart LR
  P[Professor] --> SPA[SPA React]
  A[Aluno] --> SPA
  C[Parceiro] --> SPA
  SPA --> API[API Spring Boot]
  API --> DB[(PostgreSQL)]
  API --> MQ[(RabbitMQ)]
  MQ --> W[Worker notificacoes]
  W --> E[EmailJS]
  W --> Z[ZapSender WhatsApp]
```

### Contêineres

```mermaid
flowchart LR
  B[Browser] -->|"/api vía proxy dev"| S[Spring Boot 8080]
  S --> PG[(Postgres 5432)]
  S --> MQ[(RabbitMQ 5672)]
  MQ --> RUI[RabbitMQ UI 15672]
```

### Camadas (`com.moedaestudantil`)

| Camada | Papel |
|--------|--------|
| `domain` | Modelo, portas (interfaces). |
| `application` | Fachadas, fábricas, regras de transação, notificação. |
| `infrastructure` | JPA, JWT, RabbitMQ, EmailJS/ZapSender, seed. |
| `web` | REST, DTOs, `@PreAuthorize`, erros 422. |

**Front** – *features* em `frontend/src/features`, proxy Vite: `/api` → `http://localhost:8080` ([`vite.config.ts`](frontend/vite.config.ts)).

| Decisão | Motivo breve |
|---------|----------------|
| JWT stateless | Escalabilidade horizontal sem *sticky session*. |
| JPA + PostgreSQL | Consistência transacional para saldo e extrato. |
| DTOs na borda | Contrato HTTP estável, domínio isolado. |

---

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Java 17** | Linguagem do backend. |
| **Spring Boot 3.2.5** | Web, JPA, Security, Validation e AMQP. |
| **Spring Security + jjwt 0.12.5** | Autenticação e parsing JWT. |
| **PostgreSQL** | Persistência (dev: Docker Compose 16). |
| **RabbitMQ** | Fila de notificações e worker assíncrono. |
| **EmailJS** | Envio de e-mails via API REST. |
| **ZapSender** | Envio opcional de mensagens WhatsApp. |
| **Lombok** | `domain` e redução de *boilerplate* (imutáveis, etc.). |
| **React 18 + TypeScript + Vite 5** | SPA e build. |
| **Tailwind CSS 3** | Estilos. |
| **React Router 6** | Navegação. |
| **Maven** | Build do backend. |
| **npm** | Build do *front*. |

---

## Dependências (Maven)

Versões de starters gerenciadas pelo **POM parent** `spring-boot-starter-parent:3.2.5` ([`backend/pom.xml`](backend/pom.xml)).

| Grupo | Artefato | Descrição |
|-------|----------|------------|
| `org.springframework.boot` | `spring-boot-starter-web` | Controllers REST, JSON. |
| `org.springframework.boot` | `spring-boot-starter-data-jpa` | JPA, Hibernate, repositórios. |
| `org.springframework.boot` | `spring-boot-starter-security` | Filtros, `@PreAuthorize`. |
| `org.springframework.boot` | `spring-boot-starter-validation` | Bean Validation (`@Valid`, etc.). |
| `org.springframework.boot` | `spring-boot-starter-amqp` | RabbitMQ, publisher e worker com `@RabbitListener`. |
| `org.springframework.boot` | `spring-boot-starter-mail` | Dependência histórica de e-mail; notificações novas usam EmailJS via REST. |
| `org.postgresql` | `postgresql` | Driver JDBC. |
| `io.jsonwebtoken` | `jjwt-api` / `jjwt-impl` / `jjwt-jackson` | **0.12.5** – JWT. |
| `org.projectlombok` | `lombok` | Anotações. |
| `org.springframework.boot` | `spring-boot-starter-test` | Testes (escopo *test*). |

---

## Estrutura do repositório

```text
sistema-moeda-estudantil/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── .env.example
│   └── src/main/java/com/moedaestudantil/
│       ├── MoedaEstudantilApplication.java
│       ├── domain/           # modelos, portas
│       ├── application/      # fachadas, SemestreUtil, fabricas, estratégias
│       ├── infrastructure/   # JPA, segurança JWT, mail, seed
│       └── web/              # REST, DTOs, handlers
│   └── src/main/resources/
│       ├── application.yaml
│       └── db/migration/       # Flyway (schema + seed)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── nginx.docker.conf   # proxy /api no contêiner web
│   ├── vite.config.ts
│   └── src/                  # app, features, api, assets
├── docs/uml/                 # histórias, PlantUML, índice
└── docker-compose.yml        # Postgres + API + SPA (`docker compose up -d db` = só o banco)
```

---

## Como o backend funciona

O fluxo central de **envio de moedas** está em [`TransacaoFachada`](backend/src/main/java/com/moedaestudantil/application/facade/TransacaoFachada.java):

1. **Garantir crédito de semestre** – Lê a chave atual (`SemestreUtil.chaveSemestre()`); se mudou em relação à última distribuição, **soma 1.000** ao saldo e atualiza a chave.
2. **Validar ligação professor–aluno** – `instituicaoId` deve coincidir; caso contrário, `RegraDeNegocio` (erro 422 no handler).
3. **Criar lote de envio** – `TransacaoFabrica` com quantidade e justificativa; checagem de saldo suficiente.
4. **Atualizar saldos** – Débito no professor, crédito no aluno (transação).
5. **Auditoria e notificação** – Registro de transação + *strategy* de notificação se e-mail ativo.

**Resgate e parceiro** – Controladores no pacote `web` (ex.: [`ControleVantagensResgate`](backend/src/main/java/com/moedaestudantil/web/ControleVantagensResgate.java)) aplicam o mesmo padrão: regra na aplicação, persistência em portas, autorização por perfil.

---

## Notificacoes: RabbitMQ, EmailJS e ZapSender

O backend publica eventos de notificacao depois que a transacao de negocio confirma no banco. Isso evita enviar e-mail/WhatsApp para uma operacao que falhou ou sofreu rollback.

### Fluxo

```mermaid
flowchart LR
  API[API Spring Boot] -->|publica evento| MQ[(RabbitMQ)]
  MQ -->|consome fila| W[Worker Spring]
  W -->|email| E[EmailJS]
  W -->|WhatsApp| Z[ZapSender]
```

### Eventos enviados

| Evento | Destinatario | Conteudo principal |
|--------|--------------|--------------------|
| Professor envia moedas | Aluno | Quantidade recebida, professor, justificativa e saldo atualizado |
| Professor envia moedas | Professor | Quantidade enviada, aluno, justificativa e saldo atualizado |
| Aluno resgata premio | Aluno | Item retirado, cupom e saldo atualizado |

### RabbitMQ

O `docker-compose.yml` sobe o RabbitMQ com management UI:

- AMQP: `localhost:5672`
- Painel: `http://localhost:15672`
- Usuario/senha: `moeda` / `moeda`

Configuracao padrao da fila:

```env
NOTIFICATIONS_RABBIT_ENABLED=true
NOTIFICATIONS_RABBIT_EXCHANGE=moeda.notifications
NOTIFICATIONS_RABBIT_QUEUE=moeda.notifications.email
NOTIFICATIONS_RABBIT_ROUTING_KEY=email
```

### EmailJS

Para enviar e-mails reais, configure:

```env
EMAILJS_ENABLED=true
EMAILJS_API_URL=https://api.emailjs.com/api/v1.0/email/send
EMAILJS_SERVICE_ID=seu_service_id
EMAILJS_TEMPLATE_ID=seu_template_id
EMAILJS_PUBLIC_KEY=sua_public_key
EMAILJS_PRIVATE_KEY=sua_private_key_opcional
```

No template do EmailJS, use variaveis como:

```text
{{to_email}}
{{to_name}}
{{subject}}
{{message}}
{{quantidade}}
{{saldo_atualizado}}
{{item_retirado}}
{{cupom}}
```

### ZapSender / WhatsApp

Para WhatsApp, o usuario precisa ter telefone cadastrado. O campo `WhatsApp` foi adicionado no cadastro e salvo em `usuarios.telefone`.

Configure:

```env
ZAPSENDER_ENABLED=true
ZAPSENDER_API_URL=https://seu-endpoint-zapsender
ZAPSENDER_TOKEN=seu_token
```

O cliente atual envia um `POST` com:

```json
{
  "phone": "31999998888",
  "text": "mensagem"
}
```

e header:

```text
Authorization: Bearer <ZAPSENDER_TOKEN>
```

Se o provedor ZapSender usado pela equipe exigir outro formato, ajuste `ZapSenderClient`.

---

## Endpoints da API

**Base path:** `http://localhost:8080/api/v1` (ou sua URL de deploy + `/api/v1`).

| Método | Rota | Acesso | Descrição |
|--------|------|--------|------------|
| `GET` | `/instituicoes` | Público | Lista de instituições. |
| `POST` | `/auth/registrar` | Público | Cadastro. |
| `POST` | `/auth/entrar` | Público | Retorna `accessToken`. |
| `GET` | `/auth/eu` | Autenticado | Usuário corrente. |
| `GET` | `/professores/meu-saldo` | `PROFESSOR` | Saldo (inclui lógica de semestre). |
| `POST` | `/professores/enviar-moedas` | `PROFESSOR` | JSON: `alunoId`, `quantidade`, `mensagemJustificativa`. |
| `GET` | `/alunos-na-mesma-institucao` | `PROFESSOR` | Paginação Spring. |
| `GET` | `/transacoes/extrato` | `ALUNO` ou `PROFESSOR` | Extrato conforme o papel. |
| `GET` | `/vantagens` | Público | Catálogo paginado. |
| *várias* | rotas `parceiro/…` | `PARCEIRO` | Vantagens — ver `ControleVantagensResgate`. |
| `POST` | `/alunos/resgatar-vantagem/{id}` | `ALUNO` | Resgate. |

**Erros:** muitas violações de regra retornam **422** com `{ "erro": "…" }`; token inválido / ausente → **401**.

### Exemplos (cURL)

*Instituições (público):*

```bash
curl -s http://localhost:8080/api/v1/instituicoes
```

*Login (obtenha o token do JSON de resposta):*

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/entrar \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"professor@exemplo.com\",\"senha\":\"sua-senha\"}"
```

*Chamada autenticada (substitua `SEU_JWT`):*

```bash
curl -s http://localhost:8080/api/v1/auth/eu \
  -H "Authorization: Bearer SEU_JWT"
```

---

## Como rodar o projeto

### Pré-requisitos

- **Java 17+**
- **Maven 3.8+** (ou IDE com import do `pom.xml`)
- **Node.js 18+** (LTS) e **npm**
- **Docker** (opcional: só Postgres em dev **ou** stack completo — ver [Tudo no Docker](#tudo-no-docker-postgres-api-e-spa)) **ou** PostgreSQL 14+ local

### Passos (ordem: banco → API → *front*)

1. **Banco**

   ```bash
   docker compose up -d
   ```

   Credenciais padrão do [docker-compose.yml](docker-compose.yml): `moeda` / `moeda`, database `moeda`, porta **5432**.

2. **API** (pasta `backend/`)

   ```bash
   mvn spring-boot:run
   ```

3. **Front** (pasta `frontend/`)

   ```bash
   npm install
   npm run dev
   ```

4. **Acesse** a SPA: **http://localhost:5173** (em dev, proxy envia `/api` para a API na **8080**).

### Tudo no Docker: Postgres, API e SPA

Com o **Docker Desktop** (ou daemon) em execução, na raiz do repositório:

```bash
docker compose up --build -d
```

- **Interface:** http://localhost:5173 — o Nginx do contêiner `web` serve o build estático e encaminha `/api` para a API (mesmo fluxo relativo do `VITE_API_BASE` vazio).
- **API direta (opcional):** http://localhost:8080  
- **Postgres:** porta **5432** no host (`moeda` / `moeda`, base `moeda`).

Para encerrar: `docker compose down`. Logs: `docker compose logs -f api` ou `web`.

- **Schema e dados de desenvolvimento** — [Flyway](backend/src/main/resources/db/migration/): `V1__initial_schema.sql` cria tabelas; `V2__seed_dev.sql` insere 2 instituições, **14 utilizadores** (todos com senha **`senha123`**) e 2 vantagens. Hibernate em **`ddl-auto: validate`** (não altera o schema em runtime).
- **`docker compose down -v`** — apaga o volume do Postgres; útil se mudares migrações e precisares reaplicar do zero (evita conflito com bases antigas criadas só pelo Hibernate).

### Contas de demonstração (seed)

| E-mail | Perfil |
|--------|--------|
| `parceiro1@demo.com`, `parceiro2@demo.com` | PARCEIRO |
| `aluno1@demo.com` … `aluno8@demo.com` | ALUNO |
| `prof1@demo.com` … `prof4@demo.com` | PROFESSOR |

Senha comum: **`senha123`**.

### Build para deploy

**API (JAR):**

```bash
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Front (estáticos em `dist/`):**

```bash
cd frontend
npm run build
```

Se a API estiver em **outro host/origem**, defina `VITE_API_BASE` **no build** (variável do Vite).

> O **`docker-compose`** na raiz sobe **Postgres**, **API** (imagem Maven + JRE) e **front** (Nginx com proxy `/api`). Para cloud, o padrão costuma ser: API (JAR ou imagem) + banco gerenciado + *front* em *object storage* ou *CDN*, ou um *platform PaaS* com variáveis listadas abaixo.

---

## Variáveis de ambiente

Fonte: [`application.yaml`](backend/src/main/resources/application.yaml) e [`.env.example`](backend/.env.example).

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | API | JDBC, ex. `jdbc:postgresql://localhost:5432/moeda` |
| `DATABASE_USER` / `DATABASE_PASSWORD` | API | Acesso ao Postgres |
| `JWT_SECRET` | API | HMAC; **troque** em produção |
| `JWT_EXPIRATION_MIN` / `app.jwt.expiration-minutes` | API | Validade (min) |
| `API_BASE_URL` | API | Base pública, default `http://localhost:8080` |
| `PORT` | API | Porta do servlet (padrão **8080**; muitas plataformas injetam `PORT`) |
| `MAIL_ENABLED` | API | `true` liga e-mail |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | API | SMTP |
| `VITE_API_BASE` | *Build* do front | URL base da API em produção (cross-origin) |

O Spring **não** lê `.env` automaticamente; use shell, IDE ou o provedor de *deploy*.

---

## Segurança e autenticação

- **Header:** `Authorization: Bearer <accessToken>`.
- **Papéis Spring:** `ALUNO`, `PROFESSOR`, `PARCEIRO` (`@PreAuthorize`).
- **CORS / produção:** com *front* e *API* em origens distintas, configure origens permitidas no backend e alinhe `VITE_API_BASE` (não use `*` com credenciais reais em produção).

---

## Produção e cuidados

- Rotação e segredo forte para **`JWT_SECRET`**.
- **Migrações Flyway** — o repositório versiona o DDL e o seed de dev; em produção, continue a evoluir com novas versões `V3__…` em vez de alterar migrações já aplicadas.
- Escalar a API = mais instâncias *stateless* + Postgres dimensionado; reutilizar o mesmo padrão de *pool* de conexões.
- **Testes:** o POM inclui `spring-boot-starter-test`; evoluir com `src/test` para fluxos de saldo e resgate.

---

## Documentação UML

- [Histórias de usuário](docs/uml/historias_de_usuario.md)
- [Índice PlantUML e exportação](docs/uml/README.md) — casos de uso, domínio, componentes, sequência.

### Git: commits e sprints

- Formato: `tipo(escopo): descrição [SprintNN][USmm]`
- Ex.: `feat(auth): registro aluno [Sprint01][US01]`
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Links úteis

| Recurso | URL |
|---------|-----|
| Spring Boot | https://spring.io/projects/spring-boot |
| Spring Security | https://spring.io/projects/spring-security |
| jjwt | https://github.com/jwtk/jjwt |
| PostgreSQL | https://www.postgresql.org/ |
| Vite | https://vitejs.dev/ |
| React | https://react.dev/ |
| Conventional Commits | https://www.conventionalcommits.org/ |

---

## Autores e licença

**Alunos (equipe de desenvolvimento):**

- **Lara Andrade**
- **Allan Mateus**
- **Gabriel Peçanha**

*Turma e repositório oficial da disciplina:* preencha aqui se o curso exigir identificação adicional.

**Licença:** a definir no repositório (sugestão: **MIT** ou exigência institucional).

---

<div align="center">
  <sub>README no estilo de documentação rica (funcionalidades, tabelas, dependências, fluxo do serviço, cURL) — alinhado ao padrão do projeto de referência <strong>PdfTranslator</strong>, com conteúdo específico deste monorepo.</sub>
</div>
