package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.domain.model.TransacaoTipo;
import com.moedaestudantil.infrastructure.persistence.jpa.TransacaoJpaEntity;
import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransacaoSpringDataRepository extends JpaRepository<TransacaoJpaEntity, Long> {

  Page<TransacaoJpaEntity> findByAluno(UsuarioJpaEntity aluno, Pageable pageable);

  Page<TransacaoJpaEntity> findByAlunoAndTipo(UsuarioJpaEntity aluno, TransacaoTipo tipo, Pageable pageable);

  Page<TransacaoJpaEntity> findByProfessor(UsuarioJpaEntity professor, Pageable pageable);
}
