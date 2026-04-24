package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.infrastructure.persistence.jpa.InstituicaoJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstituicaoSpringDataRepository
    extends JpaRepository<InstituicaoJpaEntity, Long> {}
