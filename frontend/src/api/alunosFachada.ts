import { apiFetch } from "./http";
import type { Aluno, Page } from "./types";

export const alunosFachada = {
  mesmaInstituicaoDoProfessor(
    page: number,
    opts?: { busca?: string; size?: number },
  ) {
    const size = opts?.size ?? 25;
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "nome,asc",
    });
    const b = opts?.busca?.trim();
    if (b) params.set("busca", b);
    return apiFetch<Page<Aluno>>(
      `/api/v1/alunos-na-mesma-institucao?${params.toString()}`,
    );
  },
};
