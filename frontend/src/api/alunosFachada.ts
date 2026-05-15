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
  
  criar: (dados: Partial<Aluno>) => 
    apiFetch<Aluno>('/api/v1/alunos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  listar: () => 
    apiFetch<Aluno[]>('/api/v1/alunos'),

  obterPorId: (id: number) => 
    apiFetch<Aluno>(`/api/v1/alunos/${id}`),

  atualizar: (id: number, dados: Partial<Aluno>) => 
    apiFetch<Aluno>(`/api/v1/alunos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  deletar: (id: number) => 
    apiFetch<void>(`/api/v1/alunos/${id}`, {
      method: 'DELETE',
    }),
};