package com.moedaestudantil.infrastructure.persistence.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "vantagens")
@Getter
@Setter
public class VantagemJpaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "parceiro_id")
  private UsuarioJpaEntity parceiro;

  @Column(nullable = false, length = 200)
  private String titulo;

  @Column(nullable = false, length = 2000)
  private String descricao;

  @Column(name = "custo_moedas", nullable = false)
  private long custoEmMoedas;

  @Column(name = "foto_url", length = 2000)
  private String fotoUrl;
}
