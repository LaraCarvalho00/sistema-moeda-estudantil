package com.moedaestudantil.infrastructure.security;

import com.moedaestudantil.domain.model.TipoPerfil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
class JwtFiltroHttp extends OncePerRequestFilter {

  private final JwtServico jwtServico;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    var header = request.getHeader("Authorization");
    if (header == null
        || !header.startsWith("Bearer ")
        || SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }
    try {
      var token = header.substring(7);
      Claims c = jwtServico.parse(token);
      long id = Long.parseLong(c.getSubject());
      var email = c.get("email", String.class);
      var perfil = TipoPerfil.valueOf(c.get("perfil", String.class));
      var cont = new ContaSessao(id, email, perfil);
      var auth = new UsernamePasswordAuthenticationToken(cont, null, cont.getAuthorities());
      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch (Exception e) {
      // token inválido: segue anônimo; rotas que exigem auth vão 403/401
    }
    filterChain.doFilter(request, response);
  }
}
