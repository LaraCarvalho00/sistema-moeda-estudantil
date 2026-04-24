package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.port.UsuarioPersistenciaPort;
import com.moedaestudantil.infrastructure.persistence.jpa.InstituicaoJpaEntity;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
class UsuarioPersistenciaAdapter implements UsuarioPersistenciaPort {

  private final UsuarioSpringDataRepository repo;
  private final InstituicaoSpringDataRepository instituicoes;
  private final JpaMapeadorUsuario mapeador;

  @Override
  @Transactional
  public Usuario salvarNovo(UsuarioCriacao dados) {
    if (dados.getPerfil() != TipoPerfil.PARCEIRO) {
      if (dados.getInstituicaoId() == null) {
        throw new RegraDeNegocio("Instituição é obrigatória para aluno e professor.");
      }
    } else if (dados.getInstituicaoId() != null) {
      throw new RegraDeNegocio("Parceiro não vincula instituição de ensino no cadastro.");
    }
    var u = new UsuarioJpaEntity();
    u.setEmail(dados.getEmail().trim().toLowerCase());
    u.setSenhaHash(dados.getHashSenha());
    u.setNome(dados.getNome().trim());
    u.setPerfil(dados.getPerfil());
    u.setSaldoMoedas(dados.getSaldoInicial());
    if (dados.getInstituicaoId() != null) {
      InstituicaoJpaEntity inst =
          instituicoes
              .findById(dados.getInstituicaoId())
              .orElseThrow(() -> new RegraDeNegocio("Instituição inexistente."));
      u.setInstituicao(inst);
    }
    return mapeador.paraDominio(repo.save(u));
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<Usuario> buscarPorId(Long id) {
    return repo.findById(id).map(mapeador::paraDominio);
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<Usuario> buscarPorIdComPerfil(Long id, TipoPerfil... perfis) {
    Set<TipoPerfil> ok = Arrays.stream(perfis).collect(Collectors.toSet());
    return repo
        .findById(id)
        .filter(e -> ok.contains(e.getPerfil()))
        .map(mapeador::paraDominio);
  }

  @Override
  @Transactional
  public void definirSaldo(long usuarioId, long saldoNovo) {
    var u =
        repo.findById(usuarioId).orElseThrow(() -> new RegraDeNegocio("Usuário inexistente."));
    u.setSaldoMoedas(saldoNovo);
  }

  @Override
  @Transactional
  public void atualizarSaldos(
      Long professorId, long professorNovo, Long alunoId, long alunoNovo) {
    if (professorId != null) {
      int n = repo.setSaldoProfessor(professorId, professorNovo);
      if (n == 0) {
        throw new RegraDeNegocio("Professor inexistente.");
      }
    }
    if (alunoId != null) {
      int n = repo.setSaldoAluno(alunoId, alunoNovo);
      if (n == 0) {
        throw new RegraDeNegocio("Aluno inexistente.");
      }
    }
  }

  @Override
  @Transactional
  public void atualizarSemestreProfessor(Long id, String chaveSemestre) {
    var u = repo.findById(id).orElseThrow();
    u.setSemestreUltimaDistribuicao(chaveSemestre);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Usuario> listarPorInstituicao(
      Long instituicaoId, TipoPerfil perfil, Pageable pageable) {
    return repo
        .findByPerfilAndInstituicao_Id(perfil, instituicaoId, pageable)
        .map(mapeador::paraDominio);
  }
}
