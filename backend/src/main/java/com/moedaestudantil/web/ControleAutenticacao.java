package com.moedaestudantil.web;

import com.moedaestudantil.application.facade.AutenticacaoFachada;
import com.moedaestudantil.application.facade.AutenticacaoFachada.UsuarioSessaoPublica;
import com.moedaestudantil.application.facade.AutenticacaoRespostaDados;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.infrastructure.security.ContaSessao;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
        c.email, c.senha, c.nome, c.perfil, c.instituicaoId, c.telefone);
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
      @Email @NotBlank @Size(max = 180) String email,
      @NotBlank @Size(min = 4, max = 72) String senha,
      @NotBlank @Size(max = 200) String nome,
      @NotNull TipoPerfil perfil,
      Long instituicaoId,
      @Pattern(
              regexp = "^\\s*(?:[+\\d().-][+\\d\\s().-]{7,31})?\\s*$",
              message = "deve conter um telefone valido")
          String telefone) {}

  public record EntradaSolicitacao(
      @Email @NotBlank @Size(max = 180) String email,
      @NotBlank @Size(max = 72) String senha) {}
}
