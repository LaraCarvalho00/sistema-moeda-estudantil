package com.moedaestudantil.application.strategy;

import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.model.Vantagem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Padrão Strategy: única ponto de notificação; e-mail ativo se {@code app.mail.enabled=true} e
 * smtp ok; senão, apenas registro (útil no desenvolvimento / sem servidor SMTP local).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificacaoAplicada implements NotificacaoEstrategiaPort {

  private final JavaMailSender javaMailSender;

  @Value("${app.mail.enabled:false}")
  private boolean emailAtivo;

  @Override
  public void notificarEnvioMoedas(
      Usuario aluno, Usuario professor, long quantidade, String mensagem) {
    if (!emailAtivo) {
      log.info(
          "[e-mail desligado] aluno={} recebeu {} de {}. Msg: {}",
          aluno.getEmail(),
          quantidade,
          professor.getEmail(),
          mensagem);
      return;
    }
    var m = new SimpleMailMessage();
    m.setTo(aluno.getEmail());
    m.setSubject("Você recebeu moedas de mérito");
    m.setText(
        "Olá, "
            + aluno.getNome()
            + ". O professor(a) "
            + professor.getNome()
            + " lhe enviou "
            + quantidade
            + " moedas. Justificativa: "
            + mensagem);
    javaMailSender.send(m);
  }

  @Override
  public void notificarResgate(Usuario aluno, Vantagem vantagem, String codigoCupom, TransacaoResumo t) {
    if (!emailAtivo) {
      log.info(
          "[e-mail desligado] resgate aluno={} vant={} cupom={}",
          aluno.getEmail(),
          vantagem.getTitulo(),
          codigoCupom);
      return;
    }
    var m = new SimpleMailMessage();
    m.setTo(aluno.getEmail());
    m.setSubject("Resgate: " + vantagem.getTitulo());
    m.setText(
        "Seu código de resgate: "
            + codigoCupom
            + "\nVantagem: "
            + vantagem.getTitulo()
            + "\nParceiro: "
            + (vantagem.getParceiroNome() != null ? vantagem.getParceiroNome() : "—")
            + "\n(Código de conferência para o parceiro: "
            + codigoCupom
            + ")");
    javaMailSender.send(m);
  }
}
