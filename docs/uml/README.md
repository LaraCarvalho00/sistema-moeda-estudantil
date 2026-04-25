# Diagramas UML (fonte PlantUML)

Arquivos `.puml` desta pasta podem ser renderizados com [PlantUML](https://plantuml.com/) (versão mínima compatível com `!theme` e sintaxe atual; se o tema falhar, remova a linha `!theme plain` do arquivo).

| Arquivo | Conteúdo |
|---------|----------|
| [casos_de_uso.puml](casos_de_uso.puml) | Casos de uso (herança de atores, include/extend), alinhado às US01–US12 |
| [classes_dominio.puml](classes_dominio.puml) | Modelo de domínio: **15+** classes, enums, **2 abstratas**, agreg/compos, herança |
| [componentes.puml](componentes.puml) | Visão de componentes (caixas/cores, ortogonal): cliente, API, domínio, DB, SMTP |
| [portas_e_adaptadores.puml](portas_e_adaptadores.puml) | Portas do domínio e adaptadores de infraestrutura |
| [sequencia_envio_moedas.puml](sequencia_envio_moedas.puml) | Sequência: envio de moedas (US03) |
| [sequencia_resgate.puml](sequencia_resgate.puml) | Sequência: resgate de vantagem (US06) |

**Texto (histórias de usuário):** [historias_de_usuario.md](historias_de_usuario.md)

## Como gerar imagens (PNG/SVG)

- **Extensão “PlantUML” no VS Code / Cursor:** abra o `.puml` e use o comando *PlantUML: Export Current Diagram*.
- **CLI (Java + plantuml.jar):** `java -jar plantuml.jar casos_de_uso.puml` na pasta `docs/uml/`.
- **Online (sem instalação):** copie o conteúdo do `.puml` para o [editor oficial](https://www.plantuml.com/plantuml/uml/) (atenção a dados sensíveis em repositórios privados).

Atualize os diagramas quando o domínio ou as integrações mudarem, para manter rastreio com a implementação.
