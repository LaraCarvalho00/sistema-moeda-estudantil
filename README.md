<a href="#"><img src="https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg" width="200"/></a> <a href="#"><img src="https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg" width="250"/></a>

---

# 🪙 Sistema de Moeda Estudantil 👨‍💻

> [!NOTE]
> Sistema de mérito estudantil para distribuição de moedas virtuais por professores e troca por benefícios em empresas parceiras.  
> **Foco:** Estimular o engajamento acadêmico e recompensar o bom comportamento através de uma economia virtual gamificada.

<table>
  <tr>
    <td width="800px">
      <div align="justify">
        Este <b>README.md</b> documenta o desenvolvimento do <b>Sistema de Moeda Estudantil</b> (Release 1), concebido para a disciplina de Laboratório de Desenvolvimento de Software. O projeto adota a <b>Arquitetura MVC</b> e implementa um ecossistema completo onde alunos, professores e empresas parceiras interagem. O objetivo deste repositório é apresentar não apenas o código final desenvolvido, mas também toda a documentação UML produzida na <i>Sprint 01</i>, garantindo o alinhamento entre os modelos conceituais e a implementação prática.
      </div>
    </td>
    <td>
      <div align="center">
        <img src="https://joaopauloaramuni.github.io/image/logo_ES_vertical.png" alt="Logo do Projeto" width="120px"/>
      </div>
    </td>
  </tr> 
</table>

---

## 🚧 Status do Projeto

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento%20(Sprint%2001)-green)](#)
[![Versão](https://img.shields.io/badge/Versão-v1.0.0-blue)](#)
![Java](https://img.shields.io/badge/Java-17-007ec6?style=flat&logo=openjdk&logoColor=white) 
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-007ec6?style=flat&logo=springboot&logoColor=white) 
![React](https://img.shields.io/badge/React-18-007ec6?style=flat&logo=react&logoColor=white)

---

## 📚 Índice
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Autores](#-autores)
- [Licença](#-licença)

---

## 📝 Sobre o Projeto
O **Sistema de Moeda Estudantil** foi criado para solucionar a falta de incentivos tangíveis no ambiente acadêmico. Ele permite que instituições de ensino adotem uma moeda virtual distribuída pelos professores como forma de reconhecer o mérito de alunos (por bom comportamento, participação, etc.). 

Os alunos, por sua vez, podem acumular essas moedas e trocá-las por produtos ou descontos oferecidos por empresas parceiras previamente cadastradas (como restaurantes, lojas de materiais, etc.). O sistema gerencia saldos, gera cupons de troca e emite notificações por e-mail para garantir a segurança das transações.

---

## ✨ Funcionalidades Principais
- 🔐 **Cadastro e Autenticação:** Login exclusivo e seguro para Alunos, Professores e Empresas Parceiras.
- 💰 **Gestão de Saldo (Professores):** Recebimento semestral automático de 1.000 moedas, com saldo cumulativo.
- 🎁 **Distribuição de Mérito:** Envio de moedas aos alunos acompanhado de uma mensagem obrigatória de justificativa.
- 📊 **Extrato de Conta:** Consulta de transações em tempo real para alunos (recebimentos/trocas) e professores (envios).
- 🛍️ **Marketplace de Vantagens:** Empresas parceiras podem cadastrar produtos/descontos com foto, descrição e custo em moedas.
- 🎟️ **Resgate e Cupons:** Alunos trocam moedas por vantagens, gerando abatimento de saldo e envio de cupons via e-mail.
- 📨 **Notificações Automatizadas:** Alertas de recebimento de moedas e e-mails de conferência para parceiros e alunos durante as trocas.

---

## 🛠 Tecnologias Utilizadas

A solução foi projetada separando o Front-end e o Back-end, obedecendo ao padrão MVC exigido.

### 💻 Front-end (View)
* **Framework:** React v18
* **Estilização:** Tailwind CSS
* **Build Tool:** Vite

### 🖥️ Back-end (Model & Controller)
* **Linguagem:** Java 17
* **Framework:** Spring Boot 3.x
* **Banco de Dados:** PostgreSQL
* **ORM:** Hibernate/Spring Data JPA
* **Autenticação:** Spring Security + JWT
* **Envio de Emails:** JavaMailSender

---

## 🏗 Arquitetura

O sistema utiliza a **Arquitetura MVC (Model-View-Controller)**:
- **Model:** Entidades mapeadas via JPA (Aluno, Professor, Vantagem, Transação) e regras de negócio encapsuladas nos `Services`.
- **View:** Interface desenvolvida em React, consumindo as rotas RESTful.
- **Controller:** Controladores REST no Spring Boot gerenciando as requisições HTTP e validando os dados.

### Modelagem do Sistema (Lab03S01)
Os diagramas UML (Casos de Uso, Classes, Componentes) e as Histórias de Usuário estão localizados na pasta `/docs/uml` deste repositório.

---

## 🔧 Instalação e Execução

### Pré-requisitos
* **Java JDK:** 17 ou superior
* **Node.js:** v18.x LTS ou superior
* **PostgreSQL** rodando localmente na porta 5432.

### 📦 Clonando e Executando

1. **Clone o Repositório:**
```bash
git clone [https://github.com/SEU_USUARIO/sistema-moeda-estudantil.git](https://github.com/SEU_USUARIO/sistema-moeda-estudantil.git)
cd sistema-moeda-estudantil
├──
sistema-moeda-estudantil/
├── docs/                      # 📚 Diagramas UML e documentação da Sprint 01
│   └── uml/                   # Diagramas de Caso de Uso, Classes e Componentes
├── frontend/                  # 💻 Camada VIEW (React + Vite)
│   ├── src/
│   │   ├── components/        # Componentes visuais
│   │   ├── pages/             # Telas da aplicação (Login, Dashboard, Extrato)
│   │   └── services/          # Integração HTTP com a API
├── backend/                   # ⚙️ Camada MODEL e CONTROLLER (Spring Boot)
│   ├── src/main/java/mvc/
│   │   ├── controller/        # Endpoints REST (Auth, Transacao, Vantagem)
│   │   ├── model/             # Entidades de Domínio (Usuario, Aluno, Instituicao)
│   │   └── repository/        # Comunicação com o banco de dados
└── README.md