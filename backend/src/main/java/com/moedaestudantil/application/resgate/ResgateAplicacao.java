package com.moedaestudantil.application.resgate;

import com.moedaestudantil.application.factory.TransacaoFabrica;
import com.moedaestudantil.application.strategy.NotificacaoEstrategiaPort;
import com.moedaestudantil.common.IdGenerator;
import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.model.Vantagem;
import com.moedaestudantil.domain.port.TransacaoPort;
import com.moedaestudantil.domain.port.UsuarioPersistenciaPort;
import com.moedaestudantil.domain.port.VantagemPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Padrão Template Method: a sequência {@link #resgatar(Long, long)} (carregar, validar,
 * movimentar saldo, persistir, notificar) é imutável; o detalhamento fica em métodos privados.
 */
@Service
@RequiredArgsConstructor
public class ResgateAplicacao {

  private final VantagemPort vantagemPort;
  private final UsuarioPersistenciaPort usuarioPersistenciaPort;
  private final TransacaoPort transacaoPort;
  private final NotificacaoEstrategiaPort notificacaoEstrategiaPort;

  @Transactional
  public TransacaoResumo resgatar(long alunoId, long vantagemId) {
    Usuario aluno =
        usuarioPersistenciaPort
            .buscarPorIdComPerfil(alunoId, TipoPerfil.ALUNO)
            .orElseThrow(() -> new RegraDeNegocio("Aluno inválido."));
    Vantagem vant = carregarVantagem(vantagemId);
    validarSaldo(aluno, vant);
    var lote = TransacaoFabrica.novoResgate(vant.getCustoEmMoedas());
    String cupom = IdGenerator.cupom();
    long novoSaldo = aluno.getSaldoMoedas() - vant.getCustoEmMoedas();
    movimentarSaldo(aluno.getId(), novoSaldo);
    TransacaoResumo r =
        transacaoPort.registrarResgate(
            aluno.getId(), vantagemId, vant.getCustoEmMoedas(), cupom, lote.getNota());
    notificacaoEstrategiaPort.notificarResgate(aluno, vant, cupom, r);
    return r;
  }

  private Vantagem carregarVantagem(long vantagemId) {
    return vantagemPort
        .buscarPorId(vantagemId)
        .orElseThrow(() -> new RegraDeNegocio("Vantagem inexistente."));
  }

  private void movimentarSaldo(long alunoId, long novo) {
    usuarioPersistenciaPort.definirSaldo(alunoId, novo);
  }

  private void validarSaldo(Usuario aluno, Vantagem v) {
    if (aluno.getSaldoMoedas() < v.getCustoEmMoedas()) {
      throw new RegraDeNegocio("Saldo insuficiente para o resgate.");
    }
  }
}
