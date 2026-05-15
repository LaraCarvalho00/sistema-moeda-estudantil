-- Schema alinhado às entidades JPA (PostgreSQL).

CREATE TABLE instituicoes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL
);

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    senha_hash VARCHAR(200) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    perfil VARCHAR(20) NOT NULL,
    saldo_moedas BIGINT NOT NULL DEFAULT 0,
    instituicao_id BIGINT REFERENCES instituicoes (id),
    semestre_ultima_distribuicao VARCHAR(9)
);

CREATE TABLE vantagens (
    id BIGSERIAL PRIMARY KEY,
    parceiro_id BIGINT NOT NULL REFERENCES usuarios (id),
    titulo VARCHAR(200) NOT NULL,
    descricao VARCHAR(2000) NOT NULL,
    custo_moedas BIGINT NOT NULL,
    foto_url VARCHAR(2000)
);

CREATE TABLE transacoes (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    quantidade BIGINT NOT NULL,
    mensagem VARCHAR(2000),
    professor_id BIGINT REFERENCES usuarios (id),
    aluno_id BIGINT NOT NULL REFERENCES usuarios (id),
    vantagem_id BIGINT REFERENCES vantagens (id),
    codigo_cupom VARCHAR(64),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
