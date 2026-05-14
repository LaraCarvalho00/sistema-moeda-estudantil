package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.domain.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoDAO extends JpaRepository<Aluno, Long> {
}