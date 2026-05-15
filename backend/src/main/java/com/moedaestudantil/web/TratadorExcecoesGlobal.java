package com.moedaestudantil.web;

import com.moedaestudantil.common.CredenciaisIncorretas;
import com.moedaestudantil.common.RegraDeNegocio;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
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

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, Object>> validacao(MethodArgumentNotValidException e) {
    var campos = new LinkedHashMap<String, String>();
    for (FieldError fe : e.getBindingResult().getFieldErrors()) {
      campos.put(
          fe.getField(),
          fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "inválido");
    }
    String resumo =
        campos.entrySet().stream()
            .map(en -> en.getKey() + ": " + en.getValue())
            .collect(Collectors.joining("; "));
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("erro", resumo.isEmpty() ? "Dados inválidos." : resumo);
    body.put("campos", campos);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<Map<String, String>> corpoJsonInvalido(HttpMessageNotReadableException ignored) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("erro", "Corpo JSON inválido ou incompleto."));
  }
}
