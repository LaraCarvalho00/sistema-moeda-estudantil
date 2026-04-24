package com.moedaestudantil.infrastructure.security;

import com.moedaestudantil.domain.model.TipoPerfil;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class ContaSessao implements UserDetails {

  private final long id;
  private final String email;
  private final TipoPerfil perfil;

  public ContaSessao(long id, String email, TipoPerfil perfil) {
    this.id = id;
    this.email = email;
    this.perfil = perfil;
  }

  public long getUsuarioId() {
    return id;
  }

  public TipoPerfil getPerfil() {
    return perfil;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Set.of("ROLE_" + perfil.name()).stream()
        .map(SimpleGrantedAuthority::new)
        .collect(Collectors.toSet());
  }

  @Override
  public String getPassword() {
    return "";
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
