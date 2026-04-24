package com.moedaestudantil.web;

import com.moedaestudantil.application.facade.TransacaoFachada;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.infrastructure.security.ContaSessao;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
class ControleMoedasERelatorio {

  private final TransacaoFachada transacaoFachada;

  @GetMapping("/professores/meu-saldo")
  @PreAuthorize("hasRole('PROFESSOR')")
  long saldoProfessor(@AuthenticationPrincipal ContaSessao s) {
    return transacaoFachada.obterSaldoProfessorComSemestre(s.getUsuarioId());
  }

  @PostMapping("/professores/enviar-moedas")
  @PreAuthorize("hasRole('PROFESSOR')")
  void enviar(
      @AuthenticationPrincipal ContaSessao s,
      @RequestBody @jakarta.validation.Valid EnvioCorpo c) {
    transacaoFachada.enviarMoedas(
        s.getUsuarioId(), c.alunoId, c.quantidade, c.mensagemJustificativa);
  }

  @GetMapping("/transacoes/extrato")
  @PreAuthorize("hasAnyRole('ALUNO','PROFESSOR')")
  Page<com.moedaestudantil.domain.model.TransacaoResumo> extrato(
      @AuthenticationPrincipal ContaSessao s, @PageableDefault(size = 20) Pageable page) {
    if (s.getPerfil() == TipoPerfil.PROFESSOR) {
      return transacaoFachada.extratoProfessor(s.getUsuarioId(), page);
    }
    return transacaoFachada.extratoAluno(s.getUsuarioId(), page);
  }

  public record EnvioCorpo(
      @jakarta.validation.constraints.Positive long alunoId,
      @jakarta.validation.constraints.Positive long quantidade,
      @NotBlank String mensagemJustificativa) {}
}
