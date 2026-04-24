package com.moedaestudantil.domain.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class Instituicao {
  Long id;
  String nome;
}
