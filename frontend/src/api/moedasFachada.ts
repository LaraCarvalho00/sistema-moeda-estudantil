import { apiFetch } from "./http";
import type { Page, TransacaoResumo } from "./types";

export const moedasFachada = {
  saldoProfessor() {
    return apiFetch<number>("/api/v1/professores/meu-saldo");
  },

  enviar(params: { alunoId: number; quantidade: number; mensagemJustificativa: string }) {
    return apiFetch<void>("/api/v1/professores/enviar-moedas", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  extrato(page: number) {
    return apiFetch<Page<TransacaoResumo>>(
      `/api/v1/transacoes/extrato?page=${page}&size=20&sort=criadoEm,desc`,
    );
  },
};
