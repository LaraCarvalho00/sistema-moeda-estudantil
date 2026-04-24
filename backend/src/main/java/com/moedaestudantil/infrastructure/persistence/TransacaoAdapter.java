package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.TransacaoTipo;
import com.moedaestudantil.domain.port.TransacaoPort;
import com.moedaestudantil.infrastructure.persistence.jpa.TransacaoJpaEntity;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
class TransacaoAdapter implements TransacaoPort {

  private final TransacaoSpringDataRepository repo;
  private final UsuarioSpringDataRepository usuarios;
  private final VantagemSpringDataRepository vantagens;

  @Override
  @Transactional
  public TransacaoResumo registrarEnvio(
      Long idProfessor, Long idAluno, long quantidade, String mensagem) {
    UsuarioJpaEntity prof =
        usuarios
            .findById(idProfessor)
            .orElseThrow(() -> new RegraDeNegocio("Professor inexistente."));
    UsuarioJpaEntity aluno =
        usuarios
            .findById(idAluno)
            .orElseThrow(() -> new RegraDeNegocio("Aluno inexistente."));
    var t = new TransacaoJpaEntity();
    t.setTipo(TransacaoTipo.ENVIO);
    t.setProfessor(prof);
    t.setAluno(aluno);
    t.setQuantidade(quantidade);
    t.setMensagem(mensagem);
    t.setVantagem(null);
    t.setCodigoCupom(null);
    t = repo.save(t);
    return mapearParaResumoComoAluno(t);
  }

  @Override
  @Transactional
  public TransacaoResumo registrarResgate(
      Long idAluno, Long vantagemId, long quantidade, String cupom, String notaOpcional) {
    UsuarioJpaEntity aluno =
        usuarios
            .findById(idAluno)
            .orElseThrow(() -> new RegraDeNegocio("Aluno inexistente."));
    var vant =
        vantagens
            .findById(vantagemId)
            .orElseThrow(() -> new RegraDeNegocio("Vantagem inexistente."));
    var t = new TransacaoJpaEntity();
    t.setTipo(TransacaoTipo.RESGATE);
    t.setProfessor(null);
    t.setAluno(aluno);
    t.setVantagem(vant);
    t.setQuantidade(quantidade);
    t.setMensagem(notaOpcional);
    t.setCodigoCupom(cupom);
    t = repo.save(t);
    return mapearParaResumoComoAluno(t);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<TransacaoResumo> listarExtratoAluno(Long alunoId, Pageable pageable) {
    var a =
        usuarios
            .findById(alunoId)
            .orElseThrow(() -> new RegraDeNegocio("Aluno inexistente."));
    return repo.findByAluno(a, pageable).map(TransacaoAdapter::mapearParaResumoComoAluno);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<TransacaoResumo> listarExtratoProfessor(Long professorId, Pageable pageable) {
    var p =
        usuarios
            .findById(professorId)
            .orElseThrow(() -> new RegraDeNegocio("Professor inexistente."));
    return repo.findByProfessor(p, pageable).map(TransacaoAdapter::mapearParaResumoComoProfessor);
  }

  private static TransacaoResumo mapearParaResumoComoAluno(TransacaoJpaEntity t) {
    String contato;
    if (t.getTipo() == TransacaoTipo.ENVIO) {
      contato = t.getProfessor() != null ? t.getProfessor().getEmail() : "";
    } else {
      if (t.getVantagem() != null) {
        var v = t.getVantagem();
        var pn = v.getParceiro() != null ? v.getParceiro().getNome() : "Parceiro";
        contato = pn + " — " + v.getTitulo();
      } else {
        contato = "";
      }
    }
    String msg = t.getMensagem() != null ? t.getMensagem() : "";
    if (t.getTipo() == TransacaoTipo.RESGATE && msg.isEmpty()) {
      msg = "Resgate de vantagem";
    }
    return TransacaoResumo.builder()
        .id(t.getId())
        .tipo(t.getTipo())
        .quantidade(t.getQuantidade())
        .mensagem(msg)
        .contatoRelacionado(contato)
        .cupom(t.getCodigoCupom())
        .criadoEm(t.getCriadoEm())
        .build();
  }

  private static TransacaoResumo mapearParaResumoComoProfessor(TransacaoJpaEntity t) {
    return TransacaoResumo.builder()
        .id(t.getId())
        .tipo(t.getTipo())
        .quantidade(t.getQuantidade())
        .mensagem(t.getMensagem() != null ? t.getMensagem() : "")
        .contatoRelacionado(t.getAluno() != null ? t.getAluno().getEmail() : "")
        .cupom(t.getCodigoCupom())
        .criadoEm(t.getCriadoEm())
        .build();
  }
}
