package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.domain.model.TipoPerfil;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UsuarioSpringDataRepository extends JpaRepository<UsuarioJpaEntity, Long> {

  Optional<UsuarioJpaEntity> findByEmail(String email);

  boolean existsByEmail(String email);

  Page<UsuarioJpaEntity> findByPerfilAndInstituicao_Id(
      TipoPerfil perfil, long instituicaoId, Pageable pageable);

  @Modifying
  @Query(
      """
      update UsuarioJpaEntity p set p.saldoMoedas = :nProf where p.id = :pid
      """)
  int setSaldoProfessor(
      @Param("pid") Long professorId, @Param("nProf") long novo);

  @Modifying
  @Query(
      """
      update UsuarioJpaEntity a set a.saldoMoedas = :nAluno where a.id = :aid
      """)
  int setSaldoAluno(
      @Param("aid") Long alunoId, @Param("nAluno") long novo);
}
