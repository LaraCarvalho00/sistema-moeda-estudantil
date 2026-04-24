package com.moedaestudantil.domain.port;

import com.moedaestudantil.domain.model.Instituicao;
import java.util.List;

public interface InstituicaoPort {
  List<Instituicao> listarTodas();

  Instituicao buscarObrigatario(Long id);
}
