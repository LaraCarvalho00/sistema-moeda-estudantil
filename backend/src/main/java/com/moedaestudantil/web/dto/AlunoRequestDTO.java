package com.moedaestudantil.web.dto;

public record AlunoRequestDTO(
        String nome,
        String email,
        String senha
) {}