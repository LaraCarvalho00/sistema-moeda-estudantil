package com.moedaestudantil.infrastructure.persistence.jpa;

import com.moedaestudantil.domain.model.TransacaoTipo;
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
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "transacoes")
@Getter
@Setter
public class TransacaoJpaEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TransacaoTipo tipo;

  @Column(nullable = false)
  private long quantidade;

  @Column(length = 2000)
  private String mensagem;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "professor_id")
  private UsuarioJpaEntity professor;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "aluno_id")
  private UsuarioJpaEntity aluno;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vantagem_id")
  private VantagemJpaEntity vantagem;

  @Column(name = "codigo_cupom", length = 64)
  private String codigoCupom;

  @CreationTimestamp
  @Column(nullable = false, name = "criado_em", updatable = false)
  private Instant criadoEm;
}
