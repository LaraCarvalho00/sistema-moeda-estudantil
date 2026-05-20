# Historias de Usuario

## Lab03 e Release 02

* **US01:** Como **Aluno**, eu quero me cadastrar no sistema informando meus dados, instituicao e WhatsApp, para que eu possa receber moedas, resgatar vantagens e ser notificado.
* **US02:** Como **Professor**, eu quero visualizar meu saldo de moedas, que inicia com 1.000 a cada semestre, para saber quanto ainda posso distribuir.
* **US03:** Como **Professor**, eu quero enviar moedas a um aluno com uma mensagem justificativa, para reconhecer seu merito.
* **US04:** Como **Aluno** e **Professor**, eu quero consultar meu extrato de transacoes, para ter controle do historico de envios, recebimentos e trocas.
* **US05:** Como **Empresa Parceira**, eu quero cadastrar vantagens com descricao, foto e custo em moedas, para oferece-las aos alunos.
* **US06:** Como **Aluno**, eu quero resgatar uma vantagem usando meu saldo, para obter um cupom de desconto e atualizar meu saldo.
* **US07:** Como **Sistema**, eu quero publicar eventos de notificacao em uma fila RabbitMQ, para que os envios de e-mail e WhatsApp nao bloqueiem as operacoes principais.
* **US08:** Como **Usuario** (Aluno, Professor ou Empresa Parceira), eu quero realizar login com e-mail e senha, para acessar as funcionalidades do sistema de forma segura.
* **US09:** Como **Empresa Parceira**, eu quero me cadastrar no sistema informando meus dados basicos, para que eu possa disponibilizar beneficios na plataforma.
* **US10:** Como **Aluno**, eu quero receber notificacao ao ganhar moedas, para ter ciencia imediata do reconhecimento recebido.
* **US11:** Como **Professor**, eu quero receber confirmacao quando envio moedas, para saber que a transacao foi registrada e meu saldo foi atualizado.
* **US12:** Como **Aluno**, eu quero selecionar minha instituicao de ensino a partir de uma lista pre-cadastrada, para garantir que meus dados estejam vinculados corretamente.
* **US13:** Como **Aluno**, eu quero receber notificacao apos resgatar uma vantagem, com o item retirado, cupom e saldo atualizado, para acompanhar o uso das minhas moedas.
* **US14:** Como **Empresa Parceira**, eu quero receber e-mail com o codigo de conferencia e QR Code do cupom resgatado, para conferir a troca presencial.
* **US15:** Como **Sistema**, eu quero gerar um QR Code unico para cada cupom de resgate, para reduzir erros na conferencia do premio.

## Criterios gerais

* Regras de saldo, semestre e permissao devem ser validadas no backend.
* Operacoes de envio de moedas e resgate devem registrar transacao no banco.
* Notificacoes devem ser disparadas somente depois da confirmacao da transacao principal.
* O front deve mostrar feedback claro de sucesso ou erro em cada fluxo.
