package com.moedaestudantil.application.facade;

import com.moedaestudantil.common.CredenciaisIncorretas;
import com.moedaestudantil.common.RegraDeNegocio;
import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.port.UsuarioDadosAcessoPort;
import com.moedaestudantil.domain.port.UsuarioPersistenciaPort;
import com.moedaestudantil.domain.port.UsuarioPersistenciaPort.UsuarioCriacao;
import com.moedaestudantil.infrastructure.persistence.UsuarioSpringDataRepository;
import com.moedaestudantil.infrastructure.security.JwtServico;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Padrão Facade: ponto único de entrada p/ registro e login, escondendo persistência, hash e
 * geração de token.
 */
@Service
@RequiredArgsConstructor
public class AutenticacaoFachada {

  private final UsuarioPersistenciaPort persistencia;
  private final UsuarioDadosAcessoPort credenciais;
  private final UsuarioSpringDataRepository repositorio;
  private final PasswordEncoder passwordEncoder;
  private final JwtServico jwt;

  @Value("${app.jwt.expiration-minutes:1440}")
  private int minutosToken;

  @Transactional
  public AutenticacaoRespostaDados registrar(
      String email, String senha, String nome, TipoPerfil perfil, Long instituicaoId) {
    if (repositorio.existsByEmail(email.trim().toLowerCase())) {
      throw new RegraDeNegocio("E-mail já cadastrado.");
    }
    var c =
        UsuarioCriacao.builder()
            .email(email.trim().toLowerCase())
            .hashSenha(passwordEncoder.encode(senha))
            .nome(nome.trim())
            .perfil(perfil)
            .saldoInicial(0)
            .instituicaoId(instituicaoId)
            .build();
    var u = persistencia.salvarNovo(c);
    return emissor(u.getId());
  }

  @Transactional(readOnly = true)
  public AutenticacaoRespostaDados login(String email, String senha) {
    var opt = credenciais.buscarComSenhaPorEmail(email.trim().toLowerCase());
    if (opt.isEmpty() || !passwordEncoder.matches(senha, opt.get().getHashSenha())) {
      throw new CredenciaisIncorretas("Credenciais inválidas.");
    }
    return emissor(opt.get().getId());
  }

  @Transactional(readOnly = true)
  public UsuarioSessaoPublica meuPerfilPublico(long usuarioId) {
    return UsuarioSessaoPublica.aPartir(
        persistencia
            .buscarPorId(usuarioId)
            .orElseThrow(() -> new RegraDeNegocio("Usuário não encontrado.")));
  }

  private AutenticacaoRespostaDados emissor(long id) {
    var u = persistencia.buscarPorId(id).orElseThrow();
    return AutenticacaoRespostaDados.de(
        jwt.gerarToken(id, u.getEmail(), u.getPerfil()), minutosToken, u);
  }

  public record UsuarioSessaoPublica(
      long id,
      String email,
      String nome,
      TipoPerfil perfil,
      long instituicaoId,
      String nomeInstituicao,
      long saldoMoedas) {

    static UsuarioSessaoPublica aPartir(Usuario u) {
      return new UsuarioSessaoPublica(
          u.getId(),
          u.getEmail(),
          u.getNome(),
          u.getPerfil(),
          u.getInstituicaoId() != null ? u.getInstituicaoId() : 0L,
          u.getNomeInstituicao() != null ? u.getNomeInstituicao() : "",
          u.getSaldoMoedas());
    }
  }
}
