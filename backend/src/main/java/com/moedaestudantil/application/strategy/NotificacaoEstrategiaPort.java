package com.moedaestudantil.application.strategy;

import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Vantagem;
import com.moedaestudantil.domain.model.Usuario;

/**
 * Padrão Strategy: trocar implementação (log no dev, e-mail com MailSender) sem alterar o
 * fluxo de negócio.
 */
public interface NotificacaoEstrategiaPort {

  void notificarEnvioMoedas(Usuario aluno, Usuario professor, long quantidade, String mensagem);

  void notificarResgate(Usuario aluno, Vantagem vantagem, String codigoCupom, TransacaoResumo t);
}
