package com.moedaestudantil.application;

import com.moedaestudantil.domain.model.Aluno;
import com.moedaestudantil.infrastructure.persistence.AlunoDAO;
import com.moedaestudantil.web.dto.AlunoRequestDTO;
import com.moedaestudantil.web.dto.AlunoResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AlunoService {

    @Autowired
    private AlunoDAO alunoDAO;

    public AlunoResponseDTO criarAluno(AlunoRequestDTO dto) {
        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setSenha(dto.senha()); 
        
        Aluno salvo = alunoDAO.save(aluno);
        return new AlunoResponseDTO(salvo);
    }

    public List<AlunoResponseDTO> listarTodos() {
        return alunoDAO.findAll().stream()
                .map(AlunoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<AlunoResponseDTO> buscarPorId(Long id) {
        return alunoDAO.findById(id).map(AlunoResponseDTO::new);
    }

    public void deletarAluno(Long id) {
        if (alunoDAO.existsById(id)) {
            alunoDAO.deleteById(id);
        }
    }
}