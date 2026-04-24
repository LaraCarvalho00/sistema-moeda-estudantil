import { apiFetch } from "./http";
import type { Page, TransacaoResumo, Vantagem } from "./types";

export const vantagensFachada = {
  catalogo(page: number) {
    return apiFetch<Page<Vantagem>>(
      `/api/v1/vantagens?page=${page}&size=12&sort=titulo,asc`,
    );
  },

  minhasComoParceiro() {
    return apiFetch<Vantagem[]>("/api/v1/parceiro/minhas-vantagens");
  },

  criarVantagem(c: {
    titulo: string;
    descricao: string;
    custoEmMoedas: number;
    fotoUrl?: string;
  }) {
    return apiFetch<Vantagem>("/api/v1/parceiro/vantagens", {
      method: "POST",
      body: JSON.stringify(c),
    });
  },

  excluir(id: number) {
    return apiFetch<void>(`/api/v1/parceiro/vantagens/${id}`, { method: "DELETE" });
  },

  resgatarVantagem(id: number) {
    return apiFetch<TransacaoResumo>(`/api/v1/alunos/resgatar-vantagem/${id}`, {
      method: "POST",
    });
  },
};
