package com.moedaestudantil.domain.port;

import com.moedaestudantil.domain.model.Vantagem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VantagemPort {

  Vantagem salvar(
      long parceiroId, String titulo, String descricao, long custo, String fotoUrl);

  Vantagem atualizar(
      long id, long parceiroId, String titulo, String descricao, long custo, String fotoUrl);

  void remover(long id, long parceiroId);

  Optional<Vantagem> buscarPorId(long id);

  Page<Vantagem> listarTodas(Pageable pageable);

  List<Vantagem> listarDoParceiro(long parceiroId);
}
