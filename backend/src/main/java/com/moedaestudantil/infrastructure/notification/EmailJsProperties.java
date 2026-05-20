package com.moedaestudantil.infrastructure.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications.emailjs")
public record EmailJsProperties(
    boolean enabled,
    String apiUrl,
    String serviceId,
    String templateId,
    String templateAlunoId,
    String templateProfessorId,
    String templateParceiroId,
    String templateResgateAlunoId,
    String templateResgateParceiroId,
    String publicKey,
    String privateKey) {

  public boolean configurado() {
    return texto(apiUrl)
        && texto(serviceId)
        && texto(publicKey)
        && (texto(templateId)
            || texto(templateAlunoId)
            || texto(templateProfessorId)
            || texto(templateParceiroId)
            || texto(templateResgateAlunoId)
            || texto(templateResgateParceiroId));
  }

  public boolean temTemplatePara(String tipoEvento) {
    return texto(templateIdPara(tipoEvento));
  }

  public String templateIdPara(String tipoEvento) {
    return switch (tipoEvento) {
      case "ENVIO_MOEDAS_ALUNO" -> primeiroTexto(templateAlunoId, templateId);
      case "ENVIO_MOEDAS_PROFESSOR" -> primeiroTexto(templateProfessorId, templateId);
      case "RESGATE_PREMIO_ALUNO" -> primeiroTexto(templateResgateAlunoId, templateAlunoId, templateId);
      case "RESGATE_PREMIO_PARCEIRO" -> primeiroTexto(
          templateResgateParceiroId, templateParceiroId, templateId);
      default -> templateId;
    };
  }

  public boolean temChavePrivada() {
    return texto(privateKey);
  }

  private static boolean texto(String valor) {
    return valor != null && !valor.isBlank();
  }

  private static String primeiroTexto(String... valores) {
    for (String valor : valores) {
      if (texto(valor)) {
        return valor;
      }
    }
    return "";
  }
}
