package com.moedaestudantil.web;

import com.moedaestudantil.domain.model.EmpresaParceira;
import com.moedaestudantil.infrastructure.persistence.EmpresaParceiraDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/empresas-parceiras")
public class EmpresaParceiraController {

    @Autowired
    private EmpresaParceiraDAO empresaParceiraDAO;

    @PostMapping
    public ResponseEntity<EmpresaParceira> createEmpresaParceira(@RequestBody EmpresaParceira empresaParceira) {
        EmpresaParceira savedEmpresa = empresaParceiraDAO.save(empresaParceira);
        return ResponseEntity.ok(savedEmpresa);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaParceira>> getAllEmpresasParceiras() {
        List<EmpresaParceira> empresas = empresaParceiraDAO.findAll();
        return ResponseEntity.ok(empresas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaParceira> getEmpresaParceiraById(@PathVariable Long id) {
        Optional<EmpresaParceira> empresa = empresaParceiraDAO.findById(id);
        return empresa.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaParceira> updateEmpresaParceira(@PathVariable Long id, @RequestBody EmpresaParceira empresaDetails) {
        return empresaParceiraDAO.findById(id).map(empresa -> {
            empresa.setNome(empresaDetails.getNome());
            empresa.setDescricao(empresaDetails.getDescricao());
            empresa.setCnpj(empresaDetails.getCnpj());
            empresa.setContato(empresaDetails.getContato());
            EmpresaParceira updatedEmpresa = empresaParceiraDAO.save(empresa);
            return ResponseEntity.ok(updatedEmpresa);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmpresaParceira(@PathVariable Long id) {
        if (empresaParceiraDAO.existsById(id)) {
            empresaParceiraDAO.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}