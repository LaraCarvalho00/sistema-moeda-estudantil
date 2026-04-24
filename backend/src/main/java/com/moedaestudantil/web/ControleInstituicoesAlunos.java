package com.moedaestudantil.web;

import com.moedaestudantil.domain.model.Instituicao;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.port.InstituicaoPort;
import com.moedaestudantil.domain.port.UsuarioPersistenciaPort;
import com.moedaestudantil.infrastructure.security.ContaSessao;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
class ControleInstituicoesAlunos {

  private final InstituicaoPort instituicoes;
  private final UsuarioPersistenciaPort usuarios;

  @GetMapping("/instituicoes")
  List<Instituicao> lista() {
    return instituicoes.listarTodas();
  }

  @GetMapping("/alunos-na-mesma-institucao")
  @PreAuthorize("hasRole('PROFESSOR')")
  Page<Usuario> alunosParaSelecao(
      @AuthenticationPrincipal ContaSessao s, @PageableDefault(size = 30) Pageable p) {
    var meu =
        usuarios
            .buscarPorId(s.getUsuarioId())
            .orElseThrow(
                () -> new com.moedaestudantil.common.RegraDeNegocio("Sessão inválida."));
    if (meu.getInstituicaoId() == null) {
      return Page.empty();
    }
    return usuarios.listarPorInstituicao(meu.getInstituicaoId(), TipoPerfil.ALUNO, p);
  }
}
