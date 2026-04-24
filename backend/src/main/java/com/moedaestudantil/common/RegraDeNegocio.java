package com.moedaestudantil.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class RegraDeNegocio extends RuntimeException {
  public RegraDeNegocio(String m) {
    super(m);
  }
}
