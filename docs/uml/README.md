# Diagramas UML

Os arquivos `.puml` desta pasta sao os fontes dos diagramas usados nas entregas Lab03, Release 02 e Release 03. As imagens antigas continuam versionadas como referencia visual, mas a manutencao deve acontecer pelos arquivos PlantUML.

| Arquivo | Conteudo |
|---------|----------|
| [casos_de_uso.puml](casos_de_uso.puml) | Casos de uso principais: cadastro, login, moedas, extrato, vantagens, resgate e notificacoes |
| [classes_dominio.puml](classes_dominio.puml) | Modelo de dominio, portas, fachadas e integracao de notificacoes |
| [componentes.puml](componentes.puml) | Componentes: SPA, API, Postgres, RabbitMQ, EmailJS e ZapSender |
| [comunicacao.puml](comunicacao.puml) | Comunicacao da Release 3: resgate, cupom, QR Code, fila e e-mails |
| [implantacao.puml](implantacao.puml) | Implantacao da Release 3: web, API, worker, Postgres, RabbitMQ e provedores |
| [modelo_er.puml](modelo_er.puml) | Modelo ER com campos requeridos, chaves e relacionamentos do banco |
| [portas_e_adaptadores.puml](portas_e_adaptadores.puml) | Visao hexagonal: controllers, aplicacao, portas, adaptadores e provedores externos |
| [sequencia_envio_moedas.puml](sequencia_envio_moedas.puml) | Sequencia do envio de moedas e notificacao para aluno/professor |
| [sequencia_resgate.puml](sequencia_resgate.puml) | Sequencia do resgate de vantagem, QR Code e notificacao para aluno/parceiro |

**Texto:** [historias_de_usuario.md](historias_de_usuario.md)

## Imagens geradas

| Diagrama | PNG | SVG |
|----------|-----|-----|
| Casos de uso | [casos_de_uso.png](casos_de_uso.png) | [casos_de_uso.svg](casos_de_uso.svg) |
| Classes de dominio | [classes_dominio.png](classes_dominio.png) | [classes_dominio.svg](classes_dominio.svg) |
| Componentes | [componentes.png](componentes.png) | [componentes.svg](componentes.svg) |
| Comunicacao | [comunicacao.png](comunicacao.png) | [comunicacao.svg](comunicacao.svg) |
| Implantacao | [implantacao.png](implantacao.png) | [implantacao.svg](implantacao.svg) |
| Modelo ER | [modelo_er.png](modelo_er.png) | [modelo_er.svg](modelo_er.svg) |
| Portas e adaptadores | [portas_e_adaptadores.png](portas_e_adaptadores.png) | [portas_e_adaptadores.svg](portas_e_adaptadores.svg) |
| Sequencia: envio de moedas | [sequencia_envio_moedas.png](sequencia_envio_moedas.png) | [sequencia_envio_moedas.svg](sequencia_envio_moedas.svg) |
| Sequencia: resgate | [sequencia_resgate.png](sequencia_resgate.png) | [sequencia_resgate.svg](sequencia_resgate.svg) |

Nos diagramas de sequencia, o objeto de entrada de cada fluxo esta marcado como `<<objeto requerido>>`.

## Como gerar imagens

- **VS Code/Cursor:** instale a extensao PlantUML, abra um `.puml` e use o comando `PlantUML: Export Current Diagram`.
- **CLI:** rode `java -jar plantuml.jar docs/uml/casos_de_uso.puml`.
- **Online:** copie o conteudo do `.puml` para o editor oficial do PlantUML.
- **Local sem Java:** rode `node scripts/generate-uml-svg.mjs` e depois `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/svg-to-png-basic.ps1`.

Atualize estes diagramas sempre que o dominio, as telas ou as integracoes mudarem.
