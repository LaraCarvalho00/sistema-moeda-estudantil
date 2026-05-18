package com.moedaestudantil.application.strategy;

import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.model.Vantagem;
import com.moedaestudantil.infrastructure.notification.EmailNotificationMessage;
import com.moedaestudantil.infrastructure.notification.EmailNotificationPublisher;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
public class NotificacaoAplicada implements NotificacaoEstrategiaPort {

  private final EmailNotificationPublisher publisher;

  @Override
  public void notificarEnvioMoedas(
      Usuario aluno, Usuario professor, long quantidade, String mensagem) {
    publicarDepoisDoCommit(emailEnvioParaAluno(aluno, professor, quantidade, mensagem));
    publicarDepoisDoCommit(emailEnvioParaProfessor(aluno, professor, quantidade, mensagem));
  }

  @Override
  public void notificarResgate(
      Usuario aluno, Vantagem vantagem, String codigoCupom, TransacaoResumo t) {
    publicarDepoisDoCommit(emailResgateParaAluno(aluno, vantagem, codigoCupom, t));
  }

  private EmailNotificationMessage emailEnvioParaAluno(
      Usuario aluno, Usuario professor, long quantidade, String mensagem) {
    var params = parametrosBase(aluno);
    params.put("aluno_nome", aluno.getNome());
    params.put("professor_nome", professor.getNome());
    params.put("professor_email", professor.getEmail());
    params.put("quantidade", quantidade);
    params.put("justificativa", mensagem);
    params.put("saldo_atualizado", aluno.getSaldoMoedas());
    return new EmailNotificationMessage(
        "ENVIO_MOEDAS_ALUNO",
        aluno.getEmail(),
        aluno.getTelefone(),
        aluno.getNome(),
        "Voce recebeu moedas PUC Coin",
        "Voce recebeu "
            + quantidade
            + " moedas de "
            + professor.getNome()
            + ". Saldo atualizado: "
            + aluno.getSaldoMoedas()
            + ". Justificativa: "
            + mensagem,
        params);
  }

  private EmailNotificationMessage emailEnvioParaProfessor(
      Usuario aluno, Usuario professor, long quantidade, String mensagem) {
    var params = parametrosBase(professor);
    params.put("aluno_nome", aluno.getNome());
    params.put("aluno_email", aluno.getEmail());
    params.put("professor_nome", professor.getNome());
    params.put("quantidade", quantidade);
    params.put("justificativa", mensagem);
    params.put("saldo_atualizado", professor.getSaldoMoedas());
    return new EmailNotificationMessage(
        "ENVIO_MOEDAS_PROFESSOR",
        professor.getEmail(),
        professor.getTelefone(),
        professor.getNome(),
        "Moedas enviadas com sucesso",
        "Voce enviou "
            + quantidade
            + " moedas para "
            + aluno.getNome()
            + ". Saldo atualizado: "
            + professor.getSaldoMoedas()
            + ". Justificativa: "
            + mensagem,
        params);
  }

  private EmailNotificationMessage emailResgateParaAluno(
      Usuario aluno, Vantagem vantagem, String codigoCupom, TransacaoResumo t) {
    var params = parametrosBase(aluno);
    params.put("aluno_nome", aluno.getNome());
    params.put("item_retirado", vantagem.getTitulo());
    params.put("premio", vantagem.getTitulo());
    params.put("parceiro_nome", valor(vantagem.getParceiroNome()));
    params.put("custo_moedas", vantagem.getCustoEmMoedas());
    params.put("cupom", codigoCupom);
    params.put("saldo_atualizado", aluno.getSaldoMoedas());
    params.put("transacao_id", t.getId());
    return new EmailNotificationMessage(
        "RESGATE_PREMIO_ALUNO",
        aluno.getEmail(),
        aluno.getTelefone(),
        aluno.getNome(),
        "Resgate confirmado: " + vantagem.getTitulo(),
        "Voce resgatou "
            + vantagem.getTitulo()
            + ". Cupom: "
            + codigoCupom
            + ". Saldo atualizado: "
            + aluno.getSaldoMoedas()
            + ".",
        params);
  }

  private static Map<String, Object> parametrosBase(Usuario usuario) {
    var params = new LinkedHashMap<String, Object>();
    params.put("usuario_id", usuario.getId());
    params.put("nome", usuario.getNome());
    params.put("email", usuario.getEmail());
    params.put("telefone", usuario.getTelefone() != null ? usuario.getTelefone() : "");
    return params;
  }

  private static String valor(String valor) {
    return valor == null ? "" : valor;
  }

  private void publicarDepoisDoCommit(EmailNotificationMessage mensagem) {
    if (!TransactionSynchronizationManager.isSynchronizationActive()) {
      publisher.publicar(mensagem);
      return;
    }
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            publisher.publicar(mensagem);
          }
        });
  }
}
