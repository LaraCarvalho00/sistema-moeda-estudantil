package com.moedaestudantil.web;

import com.moedaestudantil.application.facade.AutenticacaoFachada;
import com.moedaestudantil.application.facade.AutenticacaoFachada.UsuarioSessaoPublica;
import com.moedaestudantil.application.facade.AutenticacaoRespostaDados;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.infrastructure.security.ContaSessao;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
class ControleAutenticacao {

  private final AutenticacaoFachada autenticacaoFachada;

  @PostMapping("/registrar")
  AutenticacaoRespostaDados registrar(
      @RequestBody @jakarta.validation.Valid RegistroSolicitacao c) {
    return autenticacaoFachada.registrar(
        c.email, c.senha, c.nome, c.perfil, c.instituicaoId);
  }

  @PostMapping("/entrar")
  AutenticacaoRespostaDados login(@RequestBody @jakarta.validation.Valid EntradaSolicitacao c) {
    return autenticacaoFachada.login(c.email, c.senha);
  }

  @GetMapping("/eu")
  UsuarioSessaoPublica me(@AuthenticationPrincipal ContaSessao sess) {
    return autenticacaoFachada.meuPerfilPublico(sess.getUsuarioId());
  }

  public record RegistroSolicitacao(
      @Email @NotBlank String email,
      @NotBlank String senha,
      @NotBlank String nome,
      TipoPerfil perfil,
      Long instituicaoId) {}

  public record EntradaSolicitacao(@Email @NotBlank String email, @NotBlank String senha) {}
}
