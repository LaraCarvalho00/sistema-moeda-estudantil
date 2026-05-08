package com.moedaestudantil.web.dto;

import com.moedaestudantil.domain.model.Aluno;

public record AlunoResponseDTO(
        Long id,
        String nome,
        String email
) {
    public AlunoResponseDTO(Aluno aluno) {
        this(aluno.getId(), aluno.getNome(), aluno.getEmail());
    }
}