export type TipoPerfil = "ALUNO" | "PROFESSOR" | "PARCEIRO";

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuarioId: number;
  email: string;
  nome: string;
  perfil: TipoPerfil;
  instituicaoId: number;
  nomeInstituicao: string;
  saldoMoedas: number;
};

export type UsuarioSessao = {
  id: number;
  email: string;
  nome: string;
  perfil: TipoPerfil;
  instituicaoId: number;
  nomeInstituicao: string;
  saldoMoedas: number;
};

export type Instituicao = { id: number; nome: string };

export type Vantagem = {
  id: number;
  parceiroId: number;
  titulo: string;
  descricao: string;
  custoEmMoedas: number;
  fotoUrl: string;
  parceiroNome: string;
};

export type TransacaoResumo = {
  id: number;
  tipo: "ENVIO" | "RESGATE";
  quantidade: number;
  mensagem: string;
  contatoRelacionado: string;
  cupom: string | null;
  criadoEm: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
};

export type Aluno = UsuarioSessao;
