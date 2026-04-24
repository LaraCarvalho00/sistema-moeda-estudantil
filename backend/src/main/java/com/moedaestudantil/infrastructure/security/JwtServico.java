package com.moedaestudantil.infrastructure.security;

import com.moedaestudantil.domain.model.TipoPerfil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

@Component
public class JwtServico {

  private final JwtPropriedades props;
  private final SecretKey chave;

  public JwtServico(JwtPropriedades props) {
    this.props = props;
    this.chave = chaveHmac256(props.secret());
  }

  private static SecretKey chaveHmac256(String secret) {
    try {
      var md = MessageDigest.getInstance("SHA-256");
      return Keys.hmacShaKeyFor(md.digest(secret.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException("Não foi possível derivar a chave JWT.", e);
    }
  }

  public String gerarToken(long usuarioId, String email, TipoPerfil perfil) {
    var agora = Instant.now();
    var exp = agora.plusSeconds(props.expirationMinutes() * 60L);
    return Jwts.builder()
        .subject(String.valueOf(usuarioId))
        .claim("email", email)
        .claim("perfil", perfil.name())
        .issuedAt(Date.from(agora))
        .expiration(Date.from(exp))
        .signWith(chave)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(chave).build().parseSignedClaims(token).getPayload();
  }
}
