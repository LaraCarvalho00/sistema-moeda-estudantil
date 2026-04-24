package com.moedaestudantil.web;

import com.moedaestudantil.application.resgate.ResgateAplicacao;
import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Vantagem;
import com.moedaestudantil.domain.port.VantagemPort;
import com.moedaestudantil.infrastructure.security.ContaSessao;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
class ControleVantagensResgate {

  private final VantagemPort vantagens;
  private final ResgateAplicacao resgateAplicacao;

  @GetMapping("/vantagens")
  Page<Vantagem> publicas(@PageableDefault(size = 20) Pageable p) {
    return vantagens.listarTodas(p);
  }

  @GetMapping("/parceiro/minhas-vantagens")
  @PreAuthorize("hasRole('PARCEIRO')")
  List<Vantagem> doParceiro(@AuthenticationPrincipal ContaSessao s) {
    return vantagens.listarDoParceiro(s.getUsuarioId());
  }

  @PostMapping("/parceiro/vantagens")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('PARCEIRO')")
  Vantagem criar(
      @AuthenticationPrincipal ContaSessao s, @RequestBody @jakarta.validation.Valid VantCri c) {
    return vantagens.salvar(
        s.getUsuarioId(), c.titulo, c.descricao, c.custoEmMoedas, c.fotoUrl == null ? "" : c.fotoUrl);
  }

  @PutMapping("/parceiro/vantagens/{id}")
  @PreAuthorize("hasRole('PARCEIRO')")
  Vantagem put(
      @AuthenticationPrincipal ContaSessao s,
      @PathVariable long id,
      @RequestBody @jakarta.validation.Valid VantCri c) {
    return vantagens.atualizar(
        id, s.getUsuarioId(), c.titulo, c.descricao, c.custoEmMoedas, c.fotoUrl == null ? "" : c.fotoUrl);
  }

  @DeleteMapping("/parceiro/vantagens/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('PARCEIRO')")
  void excl(@AuthenticationPrincipal ContaSessao s, @PathVariable long id) {
    vantagens.remover(id, s.getUsuarioId());
  }

  @PostMapping("/alunos/resgatar-vantagem/{id}")
  @PreAuthorize("hasRole('ALUNO')")
  TransacaoResumo resgatar(
      @AuthenticationPrincipal ContaSessao s, @PathVariable("id") long vantId) {
    if (s.getPerfil() != TipoPerfil.ALUNO) {
      throw new RegraDeNegocio("Operação reservada a alunos.");
    }
    return resgateAplicacao.resgatar(s.getUsuarioId(), vantId);
  }

  public record VantCri(
      @NotBlank String titulo, @NotBlank String descricao, @jakarta.validation.constraints.Positive long custoEmMoedas, String fotoUrl) {}
}
