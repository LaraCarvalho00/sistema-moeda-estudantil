import { mkdirSync, writeFileSync } from "node:fs";

const outDir = "docs/uml";

const colors = {
  ink: "#0f172a",
  muted: "#475569",
  line: "#334155",
  blue: "#dbeafe",
  blueLine: "#2563eb",
  purple: "#ede9fe",
  purpleLine: "#7c3aed",
  green: "#dcfce7",
  greenLine: "#16a34a",
  amber: "#fef3c7",
  amberLine: "#d97706",
  rose: "#ffe4e6",
  roseLine: "#e11d48",
  gray: "#f8fafc",
  grayLine: "#94a3b8",
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(value, max = 22) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function text(x, y, value, options = {}) {
  const {
    size = 18,
    weight = 500,
    fill = colors.ink,
    anchor = "middle",
    max = 26,
    lineHeight = Math.round(size * 1.28),
    family = "Inter, Arial, sans-serif",
  } = options;
  const lines = Array.isArray(value) ? value : wrap(value, max);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  return `<text x="${x}" y="${startY}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function rect(x, y, w, h, options = {}) {
  const { fill = "#fff", stroke = colors.line, rx = 14, sw = 2, dash = "" } = options;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function ellipse(cx, cy, rx, ry, options = {}) {
  const { fill = "#fff", stroke = colors.line, sw = 2 } = options;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function line(x1, y1, x2, y2, label = "", options = {}) {
  const { dashed = false, stroke = colors.line, sw = 2, arrow = true, labelFill = "#fff" } = options;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dash = dashed ? 'stroke-dasharray="8 7"' : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${dash} ${arrow ? 'marker-end="url(#arrow)"' : ""}/>${
    label
      ? `<rect x="${midX - 118}" y="${midY - 23}" width="236" height="28" rx="8" fill="${labelFill}" opacity="0.92"/>${text(midX, midY - 4, label, { size: 14, max: 32 })}`
      : ""
  }`;
}

function poly(points, label = "", options = {}) {
  const { dashed = false, stroke = colors.line, sw = 2, arrow = true } = options;
  const dash = dashed ? 'stroke-dasharray="8 7"' : "";
  const coords = points.map(([x, y]) => `${x},${y}`).join(" ");
  const [lx, ly] = points[Math.floor(points.length / 2)];
  return `<polyline points="${coords}" fill="none" stroke="${stroke}" stroke-width="${sw}" ${dash} ${arrow ? 'marker-end="url(#arrow)"' : ""}/>${
    label ? text(lx, ly - 12, label, { size: 14, max: 28 }) : ""
  }`;
}

function actor(x, y, label) {
  return [
    `<circle cx="${x}" cy="${y}" r="20" fill="#fff" stroke="${colors.line}" stroke-width="2"/>`,
    `<line x1="${x}" y1="${y + 20}" x2="${x}" y2="${y + 80}" stroke="${colors.line}" stroke-width="2"/>`,
    `<line x1="${x - 38}" y1="${y + 45}" x2="${x + 38}" y2="${y + 45}" stroke="${colors.line}" stroke-width="2"/>`,
    `<line x1="${x}" y1="${y + 80}" x2="${x - 34}" y2="${y + 125}" stroke="${colors.line}" stroke-width="2"/>`,
    `<line x1="${x}" y1="${y + 80}" x2="${x + 34}" y2="${y + 125}" stroke="${colors.line}" stroke-width="2"/>`,
    text(x, y + 162, label, { size: 18, weight: 700, max: 18 }),
  ].join("");
}

function usecase(cx, cy, w, h, label) {
  return ellipse(cx, cy, w / 2, h / 2, { fill: "#fff", stroke: colors.purpleLine }) + text(cx, cy + 6, label, { size: 16, max: 22 });
}

function group(x, y, w, h, title, body, options = {}) {
  const { fill = colors.gray, stroke = colors.grayLine } = options;
  return [
    rect(x, y, w, h, { fill, stroke, rx: 18, sw: 2 }),
    text(x + 22, y + 30, title, { anchor: "start", size: 20, weight: 800, max: 32 }),
    body,
  ].join("");
}

function box(x, y, w, h, title, subtitle = "", options = {}) {
  const { fill = "#fff", stroke = colors.line, titleSize = 18 } = options;
  return [
    rect(x, y, w, h, { fill, stroke, rx: 12, sw: 2 }),
    text(x + w / 2, y + (subtitle ? h / 2 - 12 : h / 2 + 6), title, { size: titleSize, weight: 800, max: Math.floor(w / 10) }),
    subtitle ? text(x + w / 2, y + h / 2 + 24, subtitle, { size: 14, fill: colors.muted, max: Math.floor(w / 9) }) : "",
  ].join("");
}

function classBox(x, y, w, title, attrs = [], methods = [], options = {}) {
  const row = 24;
  const h = 54 + attrs.length * row + (methods.length ? 12 + methods.length * row : 0);
  const headerFill = options.headerFill ?? colors.blue;
  const stroke = options.stroke ?? colors.blueLine;
  const lines = [
    rect(x, y, w, h, { fill: "#fff", stroke, rx: 10, sw: 2 }),
    `<rect x="${x}" y="${y}" width="${w}" height="48" rx="10" fill="${headerFill}" stroke="${stroke}" stroke-width="2"/>`,
    text(x + w / 2, y + 31, title, { size: 17, weight: 800, max: Math.floor(w / 10) }),
  ];
  let yy = y + 72;
  for (const attr of attrs) {
    lines.push(text(x + 18, yy, attr, { anchor: "start", size: 14, fill: colors.ink, max: 64 }));
    yy += row;
  }
  if (methods.length) {
    lines.push(`<line x1="${x}" y1="${yy - 10}" x2="${x + w}" y2="${yy - 10}" stroke="${stroke}" stroke-width="1.5"/>`);
    for (const method of methods) {
      lines.push(text(x + 18, yy + 6, method, { anchor: "start", size: 14, fill: colors.ink, max: 64 }));
      yy += row;
    }
  }
  return { svg: lines.join(""), h };
}

function entityBox(x, y, w, title, rows, options = {}) {
  const row = 28;
  const h = 58 + rows.length * row;
  const stroke = options.stroke ?? colors.greenLine;
  const headerFill = options.headerFill ?? colors.green;
  const body = [
    rect(x, y, w, h, { fill: "#fff", stroke, rx: 10, sw: 2 }),
    `<rect x="${x}" y="${y}" width="${w}" height="48" rx="10" fill="${headerFill}" stroke="${stroke}" stroke-width="2"/>`,
    text(x + w / 2, y + 31, title, { size: 18, weight: 900, max: 26 }),
  ];
  rows.forEach((rowText, i) => {
    body.push(text(x + 18, y + 72 + i * row, rowText, { anchor: "start", size: 14, max: 54 }));
  });
  return { svg: body.join(""), h };
}

function svgDoc(width, height, title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
      <path d="M2,2 L10,6 L2,10 Z" fill="${colors.line}"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${text(width / 2, 46, title, { size: 30, weight: 900, max: 80 })}
  ${body}
</svg>`;
}

function write(name, width, height, title, body) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/${name}.svg`, svgDoc(width, height, title, body));
}

function diagramUseCases() {
  const u = {
    cadastro: [560, 150], login: [840, 150], saldo: [560, 280], enviar: [840, 280],
    extrato: [1120, 280], alunos: [840, 410], criar: [560, 540], manter: [840, 540],
    listar: [1120, 540], resgatar: [840, 680], registrar: [560, 780],
    qr: [820, 800], email: [1060, 650], notificar: [1040, 780],
    cupomParceiro: [1280, 650], whats: [1280, 780],
  };
  const associations = [
    line(180, 240, 450, 150, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 260, 730, 280, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 280, 450, 280, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 300, 1010, 280, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 600, 450, 150, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 620, 730, 680, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 640, 1010, 540, "", { arrow: false, stroke: colors.grayLine }),
    line(180, 660, 1010, 280, "", { arrow: false, stroke: colors.grayLine }),
    line(1395, 290, 670, 540, "", { arrow: false, stroke: colors.grayLine }),
    line(1395, 310, 950, 540, "", { arrow: false, stroke: colors.grayLine }),
    line(1395, 330, 730, 150, "", { arrow: false, stroke: colors.grayLine }),
    line(1395, 350, 1360, 650, "", { arrow: false, stroke: colors.grayLine }),
    line(1415, 640, 1170, 650, "", { arrow: false, stroke: colors.grayLine }),
    line(1415, 700, 1360, 780, "", { arrow: false, stroke: colors.grayLine }),
    line(840, 321, 840, 369, "", { dashed: true }),
    line(800, 321, 605, 744, "", { dashed: true }),
    line(900, 321, 1080, 744, "", { dashed: true }),
    line(840, 722, 600, 760, "", { dashed: true }),
    line(840, 722, 820, 760, "", { dashed: true }),
    line(900, 722, 1080, 780, "", { dashed: true }),
    line(900, 700, 1210, 650, "", { dashed: true }),
    line(1040, 744, 1060, 692, "", { dashed: true }),
    line(1190, 650, 1170, 650, "", { dashed: true }),
    line(1150, 780, 1170, 780, "", { dashed: true }),
  ].join("");
  const labels = [
    text(855, 350, "<<include>>", { size: 14 }),
    text(720, 515, "<<include>>", { size: 14 }),
    text(1020, 520, "<<include>>", { size: 14 }),
    text(720, 735, "<<include>>", { size: 14 }),
    text(785, 760, "<<include>>", { size: 14 }),
    text(1015, 735, "<<include>>", { size: 14 }),
    text(1080, 662, "<<include>>", { size: 14 }),
    text(1095, 720, "<<include>>", { size: 14 }),
    text(1175, 620, "<<include>>", { size: 14 }),
    text(1205, 748, "<<extend>>", { size: 14 }),
  ].join("");
  const body = [
    rect(300, 90, 1100, 760, { fill: "#fafafa", stroke: colors.grayLine, rx: 22 }),
    associations,
    text(330, 118, "PUC Coin", { anchor: "start", size: 22, weight: 900 }),
    ...Object.entries(u).map(([key, [x, y]]) => usecase(x, y, 220, 82, {
      cadastro: "Cadastrar usuario", login: "Entrar no sistema", saldo: "Consultar saldo",
      enviar: "Enviar moedas", extrato: "Consultar extrato", alunos: "Listar alunos da instituicao",
      criar: "Cadastrar vantagem", manter: "Editar/remover vantagem", listar: "Listar vantagens",
      resgatar: "Resgatar vantagem", registrar: "Registrar transacao", notificar: "Publicar notificacao",
      qr: "Gerar QR Code", email: "Enviar e-mail",
      cupomParceiro: "Enviar cupom ao parceiro", whats: "Enviar WhatsApp",
    }[key])),
    labels,
    actor(115, 160, "Professor"), actor(115, 520, "Aluno"), actor(1490, 220, "Empresa Parceira"),
    actor(1490, 610, "EmailJS / ZapSender"),
  ].join("");
  write("casos_de_uso", 1600, 920, "Diagrama de Casos de Uso", body);
}

function diagramComponents() {
  const apiBody = [
    box(535, 170, 250, 90, "Controllers REST", "HTTP /api/v1", { fill: colors.blue, stroke: colors.blueLine }),
    box(830, 170, 280, 90, "Seguranca JWT", "autenticacao e perfis", { fill: colors.purple, stroke: colors.purpleLine }),
    box(535, 310, 280, 100, "Application", "fachadas e casos de uso", { fill: colors.green, stroke: colors.greenLine }),
    box(850, 310, 250, 100, "Dominio", "modelos e portas", { fill: colors.amber, stroke: colors.amberLine }),
    box(535, 470, 250, 90, "Adaptadores JPA", "persistencia", { fill: "#fff", stroke: colors.line }),
    box(850, 470, 260, 90, "Publisher RabbitMQ", "eventos apos commit", { fill: "#fff7ed", stroke: "#ea580c" }),
    box(690, 610, 300, 90, "Worker de notificacoes", "EmailJS e ZapSender", { fill: colors.rose, stroke: colors.roseLine }),
    box(1010, 610, 150, 90, "ZXing", "QR Code", { fill: colors.amber, stroke: colors.amberLine }),
    line(785, 215, 830, 215), line(660, 260, 660, 310), line(675, 410, 660, 470), line(815, 360, 850, 360),
    line(815, 360, 1010, 655, "gera QR"),
    line(980, 410, 980, 470), line(980, 560, 850, 610),
  ].join("");
  const body = [
    box(70, 250, 240, 120, "Usuario", "aluno, professor, parceiro", { fill: colors.gray, stroke: colors.grayLine }),
    group(380, 120, 800, 620, "API Spring Boot", apiBody, { fill: "#ffffff", stroke: colors.blueLine }),
    box(80, 500, 220, 100, "SPA React/Vite", "rotas e fachadas", { fill: colors.blue, stroke: colors.blueLine }),
    box(1260, 170, 250, 100, "PostgreSQL", "Flyway + JPA", { fill: colors.green, stroke: colors.greenLine }),
    box(1260, 350, 250, 100, "RabbitMQ", "fila de notificacoes", { fill: "#fff7ed", stroke: "#ea580c" }),
    box(1260, 530, 250, 90, "EmailJS", "envio de e-mail", { fill: colors.purple, stroke: colors.purpleLine }),
    box(1260, 650, 250, 90, "ZapSender", "WhatsApp", { fill: colors.rose, stroke: colors.roseLine }),
    line(190, 370, 190, 500, "usa"), line(300, 550, 535, 215, "HTTP"),
    line(785, 515, 1260, 220, "JDBC"), line(1110, 515, 1260, 400, "AMQP"),
    line(990, 655, 1260, 575, "REST"), line(990, 655, 1260, 695, "REST"),
  ].join("");
  write("componentes", 1580, 820, "Diagrama de Componentes", body);
}

function diagramPorts() {
  const body = [
    group(70, 110, 270, 650, "Entrada", [
      box(105, 185, 200, 90, "SPA React", "Browser"),
      box(105, 350, 200, 110, "Controllers REST", "DTOs + @Valid"),
      line(205, 275, 205, 350, "HTTP"),
    ].join(""), { fill: colors.blue, stroke: colors.blueLine }),
    group(390, 110, 330, 650, "Aplicacao", [
      box(425, 180, 250, 85, "AutenticacaoFachada"),
      box(425, 315, 250, 85, "TransacaoFachada"),
      box(425, 450, 250, 85, "ResgateAplicacao"),
      box(425, 585, 250, 85, "NotificacaoAplicada"),
    ].join(""), { fill: colors.green, stroke: colors.greenLine }),
    group(770, 110, 340, 650, "Portas", [
      box(815, 165, 250, 60, "UsuarioPersistenciaPort"),
      box(815, 245, 250, 60, "UsuarioDadosAcessoPort"),
      box(815, 325, 250, 60, "TransacaoPort"),
      box(815, 405, 250, 60, "VantagemPort"),
      box(815, 485, 250, 60, "InstituicaoPort"),
      box(815, 585, 250, 60, "EmailNotificationPublisher"),
    ].join(""), { fill: colors.amber, stroke: colors.amberLine }),
    group(1160, 110, 330, 650, "Adaptadores", [
      box(1195, 165, 250, 60, "UsuarioPersistenciaAdapter"),
      box(1195, 245, 250, 60, "UsuarioAcessoAdapter"),
      box(1195, 325, 250, 60, "TransacaoAdapter"),
      box(1195, 405, 250, 60, "VantagemAdapter"),
      box(1195, 485, 250, 60, "InstituicaoAdapter"),
      box(1195, 585, 250, 60, "RabbitPublisher"),
      box(1195, 665, 250, 60, "CupomQrCodeServico"),
    ].join(""), { fill: colors.purple, stroke: colors.purpleLine }),
    box(1535, 165, 230, 80, "PostgreSQL"), box(1535, 580, 230, 80, "RabbitMQ"),
    box(1535, 690, 230, 70, "EmailJS / ZapSender"),
    line(305, 405, 425, 223), line(305, 405, 425, 358), line(305, 405, 425, 493),
    line(675, 223, 815, 195), line(675, 223, 815, 275), line(675, 358, 815, 355),
    line(675, 493, 815, 435), line(675, 628, 815, 615), line(675, 628, 1195, 695, "gera QR"),
    line(1065, 195, 1195, 195), line(1065, 275, 1195, 275), line(1065, 355, 1195, 355),
    line(1065, 435, 1195, 435), line(1065, 515, 1195, 515), line(1065, 615, 1195, 615),
    line(1445, 195, 1535, 205), line(1445, 275, 1535, 205), line(1445, 355, 1535, 205),
    line(1445, 435, 1535, 205), line(1445, 515, 1535, 205), line(1445, 615, 1535, 620),
    line(1650, 660, 1650, 690),
  ].join("");
  write("portas_e_adaptadores", 1830, 820, "Portas e Adaptadores", body);
}

function diagramEr() {
  const i = entityBox(90, 170, 300, "instituicoes", ["* id : BIGSERIAL <<PK>>", "* nome : VARCHAR(200)"]);
  const u = entityBox(520, 120, 420, "usuarios", [
    "* id : BIGSERIAL <<PK>>", "* email : VARCHAR(180) <<UNIQUE>>", "* senha_hash : VARCHAR(200)",
    "* nome : VARCHAR(200)", "* perfil : VARCHAR(20)", "* saldo_moedas : BIGINT",
    "telefone : VARCHAR(32)", "instituicao_id : BIGINT <<FK>>", "semestre_ultima_distribuicao : VARCHAR(9)",
  ]);
  const v = entityBox(1080, 150, 360, "vantagens", [
    "* id : BIGSERIAL <<PK>>", "* parceiro_id : BIGINT <<FK>>", "* titulo : VARCHAR(200)",
    "* descricao : VARCHAR(2000)", "* custo_moedas : BIGINT", "foto_url : VARCHAR(2000)",
  ]);
  const t = entityBox(650, 565, 460, "transacoes", [
    "* id : BIGSERIAL <<PK>>", "* tipo : VARCHAR(20)", "* quantidade : BIGINT", "mensagem : VARCHAR(2000)",
    "professor_id : BIGINT <<FK>>", "* aluno_id : BIGINT <<FK>>", "vantagem_id : BIGINT <<FK>>",
    "codigo_cupom : VARCHAR(64)", "* criado_em : TIMESTAMPTZ",
  ]);
  const body = [
    line(390, 260, 520, 260, "1:N", { arrow: false }),
    line(940, 255, 1080, 255, "parceiro 1:N", { arrow: false }),
    line(725, 372, 830, 565, "aluno/professor", { arrow: false }),
    line(1220, 318, 1110, 650, "vantagem", { arrow: false }),
    i.svg, u.svg, v.svg, t.svg,
    rect(100, 610, 420, 110, { fill: "#fff7ed", stroke: "#ea580c" }),
    text(310, 645, "Objeto requerido", { size: 20, weight: 900 }),
    text(310, 685, "Campos com * sao obrigatorios. telefone e opcional para WhatsApp.", { size: 16, max: 42 }),
  ].join("");
  write("modelo_er", 1520, 930, "Modelo ER", body);
}

function diagramClasses() {
  const parts = [];
  const usuario = classBox(80, 130, 340, "Usuario", ["Long id", "String email", "String telefone", "String nome", "TipoPerfil perfil", "long saldoMoedas", "Long instituicaoId"]);
  const inst = classBox(500, 130, 260, "Instituicao", ["Long id", "String nome"]);
  const vantagem = classBox(840, 130, 340, "Vantagem", ["Long id", "long parceiroId", "String titulo", "String descricao", "long custoEmMoedas", "String fotoUrl", "String parceiroEmail", "String parceiroTelefone"]);
  const trans = classBox(1260, 130, 360, "TransacaoResumo", ["Long id", "TransacaoTipo tipo", "long quantidade", "String mensagem", "String cupom", "Instant criadoEm"]);
  const tx = classBox(80, 540, 380, "TransacaoFachada", [], ["enviarMoedas(...)", "extratoAluno(...)", "extratoProfessor(...)", "obterSaldoProfessorComSemestre(...)"], { headerFill: colors.green, stroke: colors.greenLine });
  const resgate = classBox(540, 540, 340, "ResgateAplicacao", [], ["resgatar(alunoId, vantagemId)", "listarVantagens(pageable)"], { headerFill: colors.green, stroke: colors.greenLine });
  const uport = classBox(960, 520, 360, "<<interface>> UsuarioPersistenciaPort", [], ["buscarPorId(...)", "atualizarSaldos(...)", "definirSaldo(...)"], { headerFill: colors.amber, stroke: colors.amberLine });
  const tport = classBox(1380, 520, 330, "<<interface>> TransacaoPort", [], ["registrarEnvio(...)", "registrarResgate(...)", "listarExtrato(...)"], { headerFill: colors.amber, stroke: colors.amberLine });
  const notif = classBox(520, 840, 400, "<<interface>> NotificacaoEstrategiaPort", [], ["notificarEnvioMoedas(...)", "notificarResgate(...)"], { headerFill: colors.purple, stroke: colors.purpleLine });
  const worker = classBox(1030, 840, 410, "RabbitNotificationWorker", [], ["consome fila RabbitMQ", "envia EmailJS", "envia ZapSender"], { headerFill: colors.rose, stroke: colors.roseLine });
  const qr = classBox(1490, 840, 250, "CupomQrCodeServico", [], ["gerar(...)", "svgDataUri"], { headerFill: colors.amber, stroke: colors.amberLine });
  parts.push(usuario.svg, inst.svg, vantagem.svg, trans.svg, tx.svg, resgate.svg, uport.svg, tport.svg, notif.svg, worker.svg, qr.svg);
  parts.push(
    line(420, 250, 500, 200, "instituicao"),
    line(420, 330, 840, 260, "parceiro"),
    line(1180, 330, 1260, 260, "resgate"),
    line(460, 610, 960, 600, "usa"),
    line(460, 670, 1380, 600, "usa"),
    line(880, 610, 960, 600, "usa"),
    line(880, 670, 1380, 600, "usa"),
    line(270, 710, 520, 900, "notifica"),
    line(710, 710, 720, 840, "notifica"),
    line(920, 900, 1030, 900, "publica/consome"),
    line(920, 940, 1490, 900, "gera QR"),
    line(1240, 840, 1240, 790, "RabbitMQ"),
  );
  write("classes_dominio", 1780, 1080, "Diagrama de Classes do Dominio", parts.join(""));
}

function sequence(name, title, participants, messages, note = "") {
  const width = 120 + participants.length * 150;
  const height = 180 + messages.length * 62 + (note ? 120 : 40);
  const top = 110;
  const xs = participants.map((_, i) => 80 + i * 150);
  const parts = participants.map((p, i) => {
    const x = xs[i];
    const fill = p.includes("objeto requerido") ? colors.amber : p.includes("RabbitMQ") ? "#fff7ed" : p.includes("EmailJS") || p.includes("ZapSender") ? colors.rose : colors.blue;
    const stroke = p.includes("objeto requerido") ? colors.amberLine : p.includes("RabbitMQ") ? "#ea580c" : p.includes("EmailJS") || p.includes("ZapSender") ? colors.roseLine : colors.blueLine;
    return box(x - 62, top, 124, 70, p, "", { fill, stroke, titleSize: 13 }) + `<line x1="${x}" y1="${top + 70}" x2="${x}" y2="${height - 70}" stroke="${colors.grayLine}" stroke-dasharray="8 8"/>`;
  });
  const index = Object.fromEntries(participants.map((p, i) => [p, xs[i]]));
  let y = top + 110;
  for (const m of messages) {
    const x1 = index[m.from];
    const x2 = index[m.to];
    parts.push(line(x1, y, x2, y, m.label, { dashed: m.dashed, stroke: m.dashed ? colors.muted : colors.line }));
    y += 62;
  }
  if (note) {
    parts.push(rect(90, height - 120, width - 180, 70, { fill: "#f8fafc", stroke: colors.grayLine, rx: 12 }));
    parts.push(text(width / 2, height - 78, note, { size: 16, max: 90 }));
  }
  write(name, width, height, title, parts.join(""));
}

function diagramSequences() {
  sequence("sequencia_envio_moedas", "Sequencia: Envio de Moedas", [
    "Professor", "SPA React", "EnvioCorpo\n<<objeto requerido>>", "Controle\nMoedas", "Transacao\nFachada", "Usuario\nPort", "Transacao\nPort", "Notificacao", "RabbitMQ", "Worker", "EmailJS", "ZapSender",
  ], [
    ["Professor", "SPA React", "informa aluno, quantidade e justificativa"],
    ["SPA React", "EnvioCorpo\n<<objeto requerido>>", "monta objeto requerido"],
    ["SPA React", "Controle\nMoedas", "POST /professores/enviar-moedas(REQ)"],
    ["Controle\nMoedas", "Transacao\nFachada", "enviarMoedas(...)"],
    ["Transacao\nFachada", "Usuario\nPort", "buscar professor e aluno"],
    ["Transacao\nFachada", "Usuario\nPort", "garantir credito semestral"],
    ["Transacao\nFachada", "Usuario\nPort", "atualizar saldos"],
    ["Transacao\nFachada", "Transacao\nPort", "registrar envio"],
    ["Transacao\nFachada", "Notificacao", "notificar aluno/professor"],
    ["Notificacao", "RabbitMQ", "publicar eventos"],
    ["RabbitMQ", "Worker", "consumir mensagem"],
    ["Worker", "EmailJS", "enviar e-mail"],
    ["Worker", "ZapSender", "enviar WhatsApp se houver telefone"],
  ].map(([from, to, label]) => ({ from, to, label })), "Objeto requerido: EnvioCorpo { alunoId, quantidade, mensagemJustificativa }.");

  sequence("sequencia_resgate", "Sequencia: Resgate de Vantagem", [
    "Aluno", "SPA React", "ResgateReq\n<<objeto requerido>>", "Controle\nVantagens", "Resgate\nAplicacao", "Usuario\nPort", "Vantagem\nPort", "Transacao\nPort", "Notificacao", "QR Code", "RabbitMQ", "Worker", "EmailJS", "ZapSender",
  ], [
    ["Aluno", "SPA React", "escolhe vantagem"],
    ["SPA React", "ResgateReq\n<<objeto requerido>>", "monta objeto requerido"],
    ["SPA React", "Controle\nVantagens", "POST /alunos/resgatar-vantagem/{id}(REQ)"],
    ["Controle\nVantagens", "Resgate\nAplicacao", "resgatar(alunoId, vantagemId)"],
    ["Resgate\nAplicacao", "Usuario\nPort", "buscar aluno"],
    ["Resgate\nAplicacao", "Vantagem\nPort", "buscar vantagem"],
    ["Resgate\nAplicacao", "Usuario\nPort", "definir saldo atualizado"],
    ["Resgate\nAplicacao", "Transacao\nPort", "registrar resgate"],
    ["Resgate\nAplicacao", "Notificacao", "notificar item/cupom/saldo"],
    ["Notificacao", "QR Code", "gerar QR unico"],
    ["Notificacao", "RabbitMQ", "publicar eventos aluno/parceiro"],
    ["RabbitMQ", "Worker", "consumir mensagem"],
    ["Worker", "EmailJS", "enviar cupom + QR"],
    ["Worker", "ZapSender", "enviar WhatsApp se houver telefone"],
  ].map(([from, to, label]) => ({ from, to, label })), "Objeto requerido: ResgateVantagemRequest { alunoIdToken, vantagemId }.");
}

function diagramCommunication() {
  const connectors = [
    line(250, 205, 330, 205, "1 seleciona"),
    line(550, 205, 650, 205, "2 POST resgate"),
    line(910, 205, 1020, 205, "3 resgatar"),
    line(1280, 190, 1350, 135, "3.1 aluno"),
    line(1280, 210, 1350, 255, "3.2 vantagem"),
    line(1280, 235, 1350, 375, "3.4 transacao"),
    line(1150, 250, 1150, 420, "3.5 notificar"),
    line(1020, 465, 900, 465, "3.5.1 QR"),
    line(1020, 480, 590, 465, "3.5.2 eventos"),
    line(475, 510, 475, 610, "4 consumir"),
    line(610, 655, 720, 655, "5 envia"),
    line(950, 655, 1060, 655, "7 parceiro"),
    line(720, 650, 250, 250, "6 aluno"),
  ];
  const boxes = [
    box(60, 160, 190, 90, "aluno:Aluno", "ator"),
    box(330, 160, 220, 90, "spa:SPA React"),
    box(650, 160, 260, 90, "controle:Vantagens"),
    box(1020, 160, 260, 90, "resgate:Aplicacao"),
    box(1350, 95, 260, 80, "usuarios:Port"),
    box(1350, 215, 260, 80, "vantagens:Port"),
    box(1350, 335, 260, 80, "transacoes:Port"),
    box(1020, 420, 280, 90, "notificacao:Aplicada"),
    box(650, 420, 250, 90, "qr:CupomQR", "objeto requerido", { fill: colors.amber, stroke: colors.amberLine }),
    box(360, 420, 230, 90, "rabbit:RabbitMQ", "fila", { fill: "#fff7ed", stroke: "#ea580c" }),
    box(360, 610, 250, 90, "worker:Rabbit", "consumidor"),
    box(720, 610, 230, 90, "emailjs:EmailJS", "e-mail", { fill: colors.purple, stroke: colors.purpleLine }),
    box(1060, 610, 230, 90, "parceiro:Empresa", "conferencia", { fill: colors.rose, stroke: colors.roseLine }),
  ];
  const body = [...connectors, ...boxes].join("");
  write("comunicacao", 1680, 780, "Diagrama de Comunicacao - Resgate com QR Code", body);
}

function diagramDeployment() {
  const body = [
    group(60, 145, 260, 170, "Cliente", box(95, 205, 190, 70, "Browser"), { fill: colors.gray, stroke: colors.grayLine }),
    group(420, 120, 300, 220, "Container Web", box(460, 205, 220, 80, "SPA React/Vite", "Nginx"), { fill: colors.blue, stroke: colors.blueLine }),
    group(840, 100, 420, 420, "Container API", [
      box(900, 180, 300, 80, "Spring Boot API", "REST + JWT"),
      box(900, 310, 300, 80, "Worker RabbitMQ", "notificacoes"),
      box(900, 430, 300, 60, "ZXing QR Code", "cupom unico", { fill: colors.amber, stroke: colors.amberLine }),
    ].join(""), { fill: colors.green, stroke: colors.greenLine }),
    box(1390, 120, 240, 90, "PostgreSQL", "Flyway/JPA", { fill: colors.green, stroke: colors.greenLine }),
    box(1390, 285, 240, 90, "RabbitMQ", "fila", { fill: "#fff7ed", stroke: "#ea580c" }),
    box(1390, 455, 240, 90, "EmailJS", "templates", { fill: colors.purple, stroke: colors.purpleLine }),
    box(1390, 595, 240, 90, "ZapSender", "opcional", { fill: colors.rose, stroke: colors.roseLine }),
    line(320, 235, 420, 245, "HTTP"),
    line(720, 245, 900, 220, "/api/v1"),
    line(1200, 220, 1390, 165, "JDBC"),
    line(1200, 350, 1390, 330, "AMQP"),
    line(1050, 260, 1050, 430, "gera"),
    line(1200, 350, 1390, 500, "REST"),
    line(1200, 350, 1390, 640, "REST"),
  ].join("");
  write("implantacao", 1700, 760, "Diagrama de Implantacao - Release 3", body);
}

diagramUseCases();
diagramComponents();
diagramPorts();
diagramEr();
diagramClasses();
diagramSequences();
diagramCommunication();
diagramDeployment();
