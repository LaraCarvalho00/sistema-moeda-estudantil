package com.moedaestudantil.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class CredenciaisIncorretas extends RuntimeException {
  public CredenciaisIncorretas(String m) {
    super(m);
  }
}
