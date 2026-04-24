package com.moedaestudantil.domain.port;

import com.moedaestudantil.domain.model.TransacaoResumo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransacaoPort {

  TransacaoResumo registrarEnvio(
      Long idProfessor, Long idAluno, long quantidade, String mensagem);

  TransacaoResumo registrarResgate(
      Long idAluno, Long vantagemId, long quantidade, String cupom, String notaOpcional);

  Page<TransacaoResumo> listarExtratoAluno(Long alunoId, Pageable pageable);

  Page<TransacaoResumo> listarExtratoProfessor(Long professorId, Pageable pageable);
}
