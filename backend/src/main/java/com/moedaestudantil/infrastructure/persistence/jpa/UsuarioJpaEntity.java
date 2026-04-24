package com.moedaestudantil.infrastructure.persistence.jpa;

import com.moedaestudantil.domain.model.TipoPerfil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class UsuarioJpaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 180)
  private String email;

  @Column(nullable = false, name = "senha_hash", length = 200)
  private String senhaHash;

  @Column(nullable = false, length = 200)
  private String nome;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TipoPerfil perfil;

  @Column(name = "saldo_moedas", nullable = false)
  private long saldoMoedas = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "instituicao_id")
  private InstituicaoJpaEntity instituicao;

  @Column(name = "semestre_ultima_distribuicao", length = 9)
  private String semestreUltimaDistribuicao;
}
