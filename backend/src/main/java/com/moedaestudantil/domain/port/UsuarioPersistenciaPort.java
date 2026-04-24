package com.moedaestudantil.domain.port;

import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.model.Usuario;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioPersistenciaPort {

  Usuario salvarNovo(UsuarioCriacao dados);

  Optional<Usuario> buscarPorId(Long id);

  Optional<Usuario> buscarPorIdComPerfil(Long id, TipoPerfil... perfis);

  void definirSaldo(long usuarioId, long saldoNovo);

  void atualizarSaldos(
      Long professorId, long professorNovo, Long alunoId, long alunoNovo);

  void atualizarSemestreProfessor(Long id, String chaveSemestre);

  Page<Usuario> listarPorInstituicao(Long instituicaoId, TipoPerfil perfil, Pageable pageable);

  @lombok.Value
  @lombok.Builder
  class UsuarioCriacao {
    String email;
    String hashSenha;
    String nome;
    com.moedaestudantil.domain.model.TipoPerfil perfil;
    long saldoInicial;
    /** Obrigatório para aluno e professor. */
    Long instituicaoId;
  }
}
