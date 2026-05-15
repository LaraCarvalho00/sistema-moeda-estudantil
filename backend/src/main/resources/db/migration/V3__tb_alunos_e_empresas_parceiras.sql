-- Tabelas das entidades JPA em domain/model (sprint / dashboard).
-- Necessário para Hibernate ddl-auto=validate.

CREATE TABLE IF NOT EXISTS tb_alunos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    instituicao_id BIGINT REFERENCES instituicoes (id)
);

CREATE TABLE IF NOT EXISTS tb_empresas_parceiras (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    cnpj VARCHAR(255) NOT NULL UNIQUE,
    contato VARCHAR(255)
);
