-- Dados de demonstração: 2 instituições, 14 utilizadores (senha: senha123), 2 vantagens.
-- Hash BCrypt (12 rounds), gerado com BCryptPasswordEncoder.

INSERT INTO instituicoes (id, nome)
VALUES (1, 'Universidade Demo Sul'),
       (2, 'Instituto Tecnológico Demo');

SELECT setval(
        pg_get_serial_sequence('instituicoes', 'id'),
        (SELECT COALESCE(MAX(id), 1) FROM instituicoes));

INSERT INTO usuarios (
    id,
    email,
    senha_hash,
    nome,
    perfil,
    saldo_moedas,
    instituicao_id,
    semestre_ultima_distribuicao
)
VALUES
    (1, 'parceiro1@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Parceiro Café Central', 'PARCEIRO', 0, NULL, NULL),
    (2, 'parceiro2@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Parceiro Livraria Demo', 'PARCEIRO', 0, NULL, NULL),
    (3, 'aluno1@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Ana', 'ALUNO', 800, 1, NULL),
    (4, 'aluno2@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Bruno', 'ALUNO', 350, 1, NULL),
    (5, 'aluno3@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Carla', 'ALUNO', 120, 1, NULL),
    (6, 'aluno4@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Diego', 'ALUNO', 2000, 2, NULL),
    (7, 'aluno5@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Elisa', 'ALUNO', 50, 2, NULL),
    (8, 'aluno6@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Felipe', 'ALUNO', 400, 1, NULL),
    (9, 'aluno7@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Gabriela', 'ALUNO', 900, 1, NULL),
    (10, 'prof1@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Prof. Helena', 'PROFESSOR', 1200, 1, '2026-1'),
    (11, 'prof2@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Prof. Igor', 'PROFESSOR', 500, 1, '2026-1'),
    (12, 'prof3@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Prof. Julia', 'PROFESSOR', 2000, 2, '2026-1'),
    (13, 'prof4@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Prof. Kevin', 'PROFESSOR', 300, 2, '2026-1'),
    (14, 'aluno8@demo.com', '$2a$12$HaVJodn15Lfv7.nKkh3KZOD8EjAiLfxoHI7KEGsxY3lhASJGHQORG', 'Aluno Laura', 'ALUNO', 150, 2, NULL);

SELECT setval(
        pg_get_serial_sequence('usuarios', 'id'),
        (SELECT COALESCE(MAX(id), 1) FROM usuarios));

INSERT INTO vantagens (parceiro_id, titulo, descricao, custo_moedas, foto_url)
VALUES (1, 'Café especial', 'Um café cortesia na Parceiro Café Central.', 80, NULL),
       (2, 'Desconto 10% em livros', 'Cupom válido para título selecionado na Livraria Demo.', 150, NULL);
