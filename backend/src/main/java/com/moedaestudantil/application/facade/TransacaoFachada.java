package com.moedaestudantil.application.facade;

import com.moedaestudantil.application.SemestreUtil;
import com.moedaestudantil.application.factory.TransacaoFabrica;
import com.moedaestudantil.application.strategy.NotificacaoEstrategiaPort;
import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.port.TransacaoPort;
import com.moedaestudantil.domain.port.UsuarioPersistenciaPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Padrão Facade: orquestra envio de moedas, regra de semestre e notificações sem acoplar o
 * controlador a vários serviços.
 */
@Service
@RequiredArgsConstructor
public class TransacaoFachada {

  private final UsuarioPersistenciaPort usuarios;
  private final TransacaoPort transacoes;
  private final NotificacaoEstrategiaPort notificacao;

  @Transactional
  public long obterSaldoProfessorComSemestre(long professorId) {
    var p = professor(professorId);
    return garantirCreditoSemestreEObter(p);
  }

  private long garantirCreditoSemestreEObter(Usuario p) {
    var atual = SemestreUtil.chaveSemestre();
    var anter = p.getChaveSemestreUltimaDistribuicao();
    if (anter == null || !atual.equals(anter)) {
      long novo = p.getSaldoMoedas() + SemestreUtil.MOEDAS_CREDITO_SEMESTRAL;
      usuarios.definirSaldo(p.getId(), novo);
      usuarios.atualizarSemestreProfessor(p.getId(), atual);
      return novo;
    }
    return p.getSaldoMoedas();
  }

  @Transactional
  public void enviarMoedas(
      long professorId, long alunoId, long quantidade, String justificativa) {
    var p0 = professor(professorId);
    garantirCreditoSemestreEObter(p0);
    var p = professor(professorId);
    var a = aluno(alunoId);
    if (!a.getInstituicaoId().equals(p.getInstituicaoId())) {
      throw new RegraDeNegocio("Aluno deve ser da mesma instituição do professor.");
    }
    var lote = TransacaoFabrica.novoEnvio(quantidade, justificativa);
    if (p.getSaldoMoedas() < lote.getQuantidade()) {
      throw new RegraDeNegocio("Saldo do professor insuficiente para este envio.");
    }
    long pNovo = p.getSaldoMoedas() - lote.getQuantidade();
    long aNovo = a.getSaldoMoedas() + lote.getQuantidade();
    usuarios.atualizarSaldos(professorId, pNovo, a.getId(), aNovo);
    var pF = usuarios.buscarPorId(professorId).orElseThrow();
    var aF = usuarios.buscarPorId(a.getId()).orElseThrow();
    transacoes.registrarEnvio(
        professorId, a.getId(), lote.getQuantidade(), lote.getMensagem());
    notificacao.notificarEnvioMoedas(
        aF, pF, lote.getQuantidade(), lote.getMensagem());
  }

  @Transactional(readOnly = true)
  public Page<TransacaoResumo> extratoAluno(long alunoId, Pageable page) {
    return transacoes.listarExtratoAluno(alunoId, page);
  }

  @Transactional(readOnly = true)
  public Page<TransacaoResumo> extratoProfessor(long profId, Pageable page) {
    return transacoes.listarExtratoProfessor(profId, page);
  }

  private Usuario professor(long id) {
    return usuarios
        .buscarPorIdComPerfil(id, TipoPerfil.PROFESSOR)
        .orElseThrow(() -> new RegraDeNegocio("Usuário não é professor."));
  }

  private Usuario aluno(long id) {
    return usuarios
        .buscarPorIdComPerfil(id, TipoPerfil.ALUNO)
        .orElseThrow(() -> new RegraDeNegocio("Aluno inexistente ou inválido."));
  }
}
