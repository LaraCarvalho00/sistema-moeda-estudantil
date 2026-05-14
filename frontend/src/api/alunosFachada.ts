import { apiFetch } from "./http";
import type { Aluno, Page } from "./types";

export const alunosFachada = {
  mesmaInstituicaoDoProfessor(page: number) {
    return apiFetch<Page<Aluno>>(
      `/api/v1/alunos-na-mesma-institucao?page=${page}&size=30&sort=nome,asc`,
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