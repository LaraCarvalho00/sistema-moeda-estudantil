import { apiFetch } from "./http";
import type { Aluno, Page } from "./types";

export const alunosFachada = {
  mesmaInstituicaoDoProfessor(page: number) {
    return apiFetch<Page<Aluno>>(
      `/api/v1/alunos-na-mesma-institucao?page=${page}&size=30&sort=nome,asc`,
    );
  },
};
