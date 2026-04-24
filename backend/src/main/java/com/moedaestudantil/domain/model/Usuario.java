package com.moedaestudantil.domain.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class Usuario {
  Long id;
  String email;
  String nome;
  TipoPerfil perfil;
  long saldoMoedas;
  Long instituicaoId;
  String nomeInstituicao;
  /** Professor: última chave de semestre com crédito 1000 moedas. */
  String chaveSemestreUltimaDistribuicao;
}
