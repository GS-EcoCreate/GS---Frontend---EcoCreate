/* -------------------------------------------------------------------
   script.js
   Comportamentos gerais: FAQ, validação de formulários, gestão de desastres
   ------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  ativarFAQ();
  validarContatoForm();
  validarDisasterForm();
  carregarListaDesastres();
  configurarBotoesLista();
});

/* -------------------------------------------------------------------
Funcionalidade FAQ (expandir/ocultar resposta)
---------------------------------------------------------------------- */
function ativarFAQ() {
  const perguntas = document.querySelectorAll(".faq-question");
  perguntas.forEach((botao) => {
    botao.addEventListener("click", () => {
      const resposta = botao.nextElementSibling;
      if (resposta.style.display === "block") {
        resposta.style.display = "none";
      } else {
        // Fecha todas as outras antes de abrir
        document.querySelectorAll(".faq-answer").forEach((ans) => {
          ans.style.display = "none";
        });
        resposta.style.display = "block";
      }
    });
  });
}

/* -------------------------------------------------------------------
Validação do formulário de Contato
---------------------------------------------------------------------- */
function validarContatoForm() {
  const formContato = document.getElementById("contact-form");
  if (!formContato) return;

  formContato.addEventListener("submit", (e) => {
    e.preventDefault();

    // Limpa mensagens de erro
    limparErro("erro-nome");
    limparErro("erro-email");
    limparErro("erro-mensagem");
    document.getElementById("sucesso-contato").textContent = "";

    let valido = true;
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    // Valida Nome
    if (nome === "") {
      exibirErro("erro-nome", "O nome é obrigatório.");
      valido = false;
    }

    // Valida Email
    if (email === "") {
      exibirErro("erro-email", "O e-mail é obrigatório.");
      valido = false;
    } else if (!validarEmail(email)) {
      exibirErro("erro-email", "Formato de e-mail inválido.");
      valido = false;
    }

    // Valida Mensagem
    if (mensagem === "") {
      exibirErro("erro-mensagem", "A mensagem não pode ficar em branco.");
      valido = false;
    }

    if (valido) {
      document.getElementById("sucesso-contato").textContent =
        "Obrigado! Sua mensagem foi enviada com sucesso.";
      formContato.reset();
    }
  });
}

/* -------------------------------------------------------------------
Validação do formulário de Registro de Desastre (solucao.html)
---------------------------------------------------------------------- */
function validarDisasterForm() {
  const formDisaster = document.getElementById("disaster-form");
  if (!formDisaster) return;

  formDisaster.addEventListener("submit", (e) => {
    e.preventDefault();

    // Limpa erros e mensagem anterior
    limparErro("erro-tipo");
    limparErro("erro-descricao");
    limparErro("erro-urgencia");
    document.getElementById("sucesso-disaster").textContent = "";

    let valido = true;
    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value.trim();
    const urgencia = document.getElementById("urgencia").value.trim();

    // Valida Tipo
    if (tipo === "") {
      exibirErro("erro-tipo", "Selecione o tipo de desastre.");
      valido = false;
    }

    // Valida Descrição
    if (descricao === "") {
      exibirErro("erro-descricao", "A descrição é obrigatória.");
      valido = false;
    }

    // Valida Urgência
    if (urgencia === "") {
      exibirErro("erro-urgencia", "Informe o nível de urgência.");
      valido = false;
    } else {
      const nivel = parseInt(urgencia, 10);
      if (isNaN(nivel) || nivel < 1 || nivel > 10) {
        exibirErro("erro-urgencia", "Urgência deve ser número entre 1 e 10.");
        valido = false;
      }
    }

    if (valido) {
      // Monta objeto de desastre
      const novoDesastre = {
        id: Date.now(),
        tipo,
        descricao,
        urgencia: parseInt(urgencia, 10),
        dataRegistro: new Date().toISOString(), // para ordenar cronologicamente
      };

      salvarDesastre(novoDesastre);
      formDisaster.reset();
      document.getElementById("sucesso-disaster").textContent =
        "Desastre cadastrado com sucesso!";
    }
  });

  // Botão “Ver Lista de Desastres”
  document.getElementById("ver-lista").addEventListener("click", () => {
    window.location.href = "lista.html";
  });
}

/* -------------------------------------------------------------------
Funções de manipulação de armazenamento local (localStorage)
---------------------------------------------------------------------- */
function salvarDesastre(obj) {
  const lista = JSON.parse(localStorage.getItem("desastres")) || [];
  lista.push(obj);
  localStorage.setItem("desastres", JSON.stringify(lista));
}

function obterDesastres() {
  return JSON.parse(localStorage.getItem("desastres")) || [];
}

/* -------------------------------------------------------------------
Carregamento e renderização da lista de desastres (lista.html)
---------------------------------------------------------------------- */
function carregarListaDesastres() {
  const container = document.getElementById("lista-container");
  if (!container) return;

  // Carrega do localStorage (podemos ordenar depois)
  let desastres = obterDesastres();

  if (desastres.length === 0) {
    container.innerHTML =
      "<p>Não há desastres cadastrados. Volte ao formulário para registrar um.</p>";
    return;
  }

  // Por padrão, exibe em ordem de registro (mais recente primeiro)
  desastres.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));
  montarTabela(container, desastres);
}

/* -------------------------------------------------------------------
Construção da tabela de desastres 
---------------------------------------------------------------------- */
function montarTabela(container, desastres) {
  // Limpa conteúdo
  container.innerHTML = "";

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Tipo", "Descrição", "Urgência", "Data de Registro"].forEach((titulo) => {
    const th = document.createElement("th");
    th.textContent = titulo;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  desastres.forEach((d) => {
    const tr = document.createElement("tr");
    // Tipo
    const tdTipo = document.createElement("td");
    tdTipo.textContent = d.tipo;
    tr.appendChild(tdTipo);
    // Descrição
    const tdDesc = document.createElement("td");
    tdDesc.textContent = d.descricao;
    tr.appendChild(tdDesc);
    // Urgência
    const tdUrg = document.createElement("td");
    tdUrg.textContent = d.urgencia;
    tr.appendChild(tdUrg);
    // Data de Registro (formatar de forma legível)
    const tdData = document.createElement("td");
    const dt = new Date(d.dataRegistro);
    tdData.textContent = dt.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
    tr.appendChild(tdData);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

/* -------------------------------------------------------------------
Botões de ordenação (lista.html)
---------------------------------------------------------------------- */
function configurarBotoesLista() {
  const botaoUrg = document.getElementById("sort-urgencia");
  const botaoData = document.getElementById("sort-data");
  const botaoVoltar = document.getElementById("voltar");
  const container = document.getElementById("lista-container");

  if (botaoUrg) {
    botaoUrg.addEventListener("click", () => {
      let desastres = obterDesastres();
      // Ordena do maior nível de urgência para o menor
      desastres.sort((a, b) => b.urgencia - a.urgencia);
      montarTabela(container, desastres);
    });
  }

  if (botaoData) {
    botaoData.addEventListener("click", () => {
      let desastres = obterDesastres();
      // Ordem cronológica: mais recente primeiro
      desastres.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));
      montarTabela(container, desastres);
    });
  }

  if (botaoVoltar) {
    botaoVoltar.addEventListener("click", () => {
      window.location.href = "solucao.html";
    });
  }
}

/* -------------------------------------------------------------------
Funções utilitárias para exibir/limpar erros
---------------------------------------------------------------------- */
function exibirErro(idSpan, mensagem) {
  const span = document.getElementById(idSpan);
  if (span) {
    span.textContent = mensagem;
  }
}

function limparErro(idSpan) {
  const span = document.getElementById(idSpan);
  if (span) {
    span.textContent = "";
  }
}

/* -------------------------------------------------------------------
Validação de e-mail simples (regex básica)
---------------------------------------------------------------------- */
function validarEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
