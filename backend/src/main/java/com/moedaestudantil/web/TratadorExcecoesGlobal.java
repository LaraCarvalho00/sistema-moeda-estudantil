package com.moedaestudantil.web;

import com.moedaestudantil.common.CredenciaisIncorretas;
import com.moedaestudantil.common.RegraDeNegocio;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class TratadorExcecoesGlobal {

  @ExceptionHandler(RegraDeNegocio.class)
  ResponseEntity<Map<String, String>> regra(RegraDeNegocio e) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
        .body(Map.of("erro", e.getMessage()));
  }

  @ExceptionHandler(CredenciaisIncorretas.class)
  ResponseEntity<Map<String, String>> naoLogado(CredenciaisIncorretas e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("erro", e.getMessage()));
  }
}
