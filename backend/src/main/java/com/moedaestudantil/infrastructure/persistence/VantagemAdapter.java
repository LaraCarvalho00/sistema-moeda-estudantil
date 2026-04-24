package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.Vantagem;
import com.moedaestudantil.domain.port.VantagemPort;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import com.moedaestudantil.infrastructure.persistence.jpa.VantagemJpaEntity;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
class VantagemAdapter implements VantagemPort {

  private final VantagemSpringDataRepository repo;
  private final UsuarioSpringDataRepository usuarios;

  @Override
  @Transactional
  public Vantagem salvar(
      long parceiroId, String titulo, String descricao, long custo, String fotoUrl) {
    UsuarioJpaEntity p =
        usuarios
            .findById(parceiroId)
            .orElseThrow(() -> new RegraDeNegocio("Parceiro inexistente."));
    var e = new VantagemJpaEntity();
    e.setParceiro(p);
    e.setTitulo(titulo);
    e.setDescricao(descricao);
    e.setCustoEmMoedas(custo);
    e.setFotoUrl(fotoUrl);
    return map(repo.save(e));
  }

  @Override
  @Transactional
  public Vantagem atualizar(
      long id, long parceiroId, String titulo, String descricao, long custo, String fotoUrl) {
    VantagemJpaEntity e =
        repo
            .findById(id)
            .orElseThrow(() -> new RegraDeNegocio("Vantagem inexistente."));
    if (e.getParceiro() == null || e.getParceiro().getId() != parceiroId) {
      throw new RegraDeNegocio("Apenas o dono da vantagem pode alterar.");
    }
    e.setTitulo(titulo);
    e.setDescricao(descricao);
    e.setCustoEmMoedas(custo);
    e.setFotoUrl(fotoUrl);
    return map(e);
  }

  @Override
  @Transactional
  public void remover(long id, long parceiroId) {
    VantagemJpaEntity e =
        repo
            .findById(id)
            .orElseThrow(() -> new RegraDeNegocio("Vantagem inexistente."));
    if (e.getParceiro() == null || e.getParceiro().getId() != parceiroId) {
      throw new RegraDeNegocio("Apenas o dono da vantagem pode remover.");
    }
    repo.deleteById(id);
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<Vantagem> buscarPorId(long id) {
    return repo.findById(id).map(this::map);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Vantagem> listarTodas(Pageable pageable) {
    return repo.findAll(pageable).map(this::map);
  }

  @Override
  @Transactional(readOnly = true)
  public List<Vantagem> listarDoParceiro(long parceiroId) {
    return usuarios
        .findById(parceiroId)
        .map(
            p ->
                repo.findAllByParceiro(p).stream()
                    .map(this::map)
                    .collect(Collectors.toList()))
        .orElseGet(List::of);
  }

  private Vantagem map(VantagemJpaEntity e) {
    String parceiroNome = e.getParceiro() != null ? e.getParceiro().getNome() : null;
    long parceiroId = e.getParceiro() == null ? 0L : e.getParceiro().getId();
    return Vantagem.builder()
        .id(e.getId())
        .parceiroId(parceiroId)
        .titulo(e.getTitulo())
        .descricao(e.getDescricao())
        .custoEmMoedas(e.getCustoEmMoedas())
        .fotoUrl(e.getFotoUrl())
        .parceiroNome(parceiroNome)
        .build();
  }
}
