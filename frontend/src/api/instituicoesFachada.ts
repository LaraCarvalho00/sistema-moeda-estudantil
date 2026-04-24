import { apiFetch } from "./http";
import type { Instituicao } from "./types";

export const instituicoesFachada = {
  listar() {
    return apiFetch<Instituicao[]>("/api/v1/instituicoes");
  },
};
