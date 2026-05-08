package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.domain.model.EmpresaParceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaParceiraDAO extends JpaRepository<EmpresaParceira, Long> {
}