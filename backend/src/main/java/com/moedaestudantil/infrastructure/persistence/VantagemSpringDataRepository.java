package com.moedaestudantil.infrastructure.persistence;

import com.moedaestudantil.infrastructure.persistence.jpa.UsuarioJpaEntity;
import com.moedaestudantil.infrastructure.persistence.jpa.VantagemJpaEntity;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VantagemSpringDataRepository extends JpaRepository<VantagemJpaEntity, Long> {

  Page<VantagemJpaEntity> findByParceiro(UsuarioJpaEntity parceiro, Pageable pageable);

  java.util.List<VantagemJpaEntity> findAllByParceiro(UsuarioJpaEntity parceiro);
}
