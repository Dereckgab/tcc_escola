const produtos = {
  "Drinks Pet": [
    { nome: "Mansão Maromba", preco: 20.0 },
    { nome: "Mansão Maromba Lata", preco: 12.0 }
  ],
  "Cervejas Lata": [
    { nome: "Skol", preco: 5.0 },
    { nome: "Brahma", preco: 5.0 },
    { nome: "Brahma Zero", preco: 5.0 },
    { nome: "Boa", preco: 5.0 },
    { nome: "Amstel", preco: 5.0 }
  ],
  "Cervejas 600ml": [
    { nome: "Antártica Boa", preco: 8.5 },
    { nome: "Original", preco: 10.0 },
    { nome: "Brahma", preco: 9.0 },
    { nome: "Skol", preco: 8.5 },
    { nome: "Amstel", preco: 9.0 },
    { nome: "Sol", preco: 12.0 }
  ],
  "Refrigerantes": [
    { nome: "Coca Cola Lata", preco: 5.0 },
    { nome: "Coca Cola Zero Lata", preco: 5.0 },
    { nome: "Fanta Lata", preco: 5.0 },
    { nome: "Fanta Uva Lata", preco: 5.0 },
    { nome: "Guaraná Lata", preco: 5.0 },
    { nome: "Sprite Lata", preco: 5.0 },
    { nome: "Coca Cola 2L", preco: 12.0 },
    { nome: "Coca Cola Zero 2L", preco: 12.0 },
    { nome: "Tubaína 2L", preco: 10.0 }
  ],
  "Porções": [
    { nome: "1kg de Frango a Passarinho + 200g de Batata Frita", preco: 40.0 },
    { nome: "800g de Filé de Frango + 200g de Batata Frita", preco: 45.0 }
  ],
  "Doces": [
    { nome: "Canudo Feito", preco: 1.0 },
    { nome: "Paçoca", preco: 1.0 },
    { nome: "Doce de Abóbora", preco: 1.0 },
    { nome: "Pirulito", preco: 1.0 },
    { nome: "Chiclete", preco: 0.2 },
    { nome: "Chipps", preco: 2.0 },
    { nome: "Energético Monster", preco: 11.0 },
    { nome: "Amendoim", preco: 2.0 },
    { nome: "Torresmo Chipps", preco: 3.0 },
    { nome: "Salame", preco: 20.0 }
  ]
};

const listaCategorias = document.getElementById("categorias");
const listaProdutos = document.getElementById("produtos-grid");
const campoBusca = document.getElementById("campoBusca");
const listaCarrinho = document.getElementById("lista-carrinho");
const resumoPedido = document.getElementById("resumo-pedido");

let categoriaAtual = "Todos";
let carrinho = [];

// --- Funções para categorias e produtos ---
function exibirCategorias() {
  listaCategorias.innerHTML = "";

  // Botão "Todos"
  const btnTodos = document.createElement("button");
  btnTodos.className = "btn btn-outline-primary active";
  btnTodos.textContent = "Todos";
  btnTodos.onclick = () => setCategoria("Todos");
  listaCategorias.appendChild(btnTodos);

  Object.keys(produtos).forEach(categoria => {
    const botao = document.createElement("button");
    botao.className = "btn btn-outline-primary";
    botao.textContent = categoria;
    botao.onclick = () => setCategoria(categoria);
    listaCategorias.appendChild(botao);
  });
}

function setCategoria(categoria) {
  categoriaAtual = categoria;
  atualizarBotaoAtivo();
  exibirProdutos(categoria);
  campoBusca.value = "";
}

function atualizarBotaoAtivo() {
  const botoes = listaCategorias.querySelectorAll("button");
  botoes.forEach(botao => {
    botao.classList.toggle("active", botao.textContent === categoriaAtual);
  });
}

function exibirProdutos(categoria) {
  listaProdutos.innerHTML = "";

  const container = document.createDocumentFragment();
  const categoriasParaExibir = categoria === "Todos" ? Object.keys(produtos) : [categoria];

  categoriasParaExibir.forEach(cat => {
    produtos[cat].forEach(prod => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body d-flex flex-column justify-content-between">
            <h5 class="card-title">${prod.nome}</h5>
            <p class="card-text">R$ ${prod.preco.toFixed(2).replace('.', ',')}</p>
            <button class="btn btn-success mt-auto" onclick="adicionarCarrinho('${prod.nome}', ${prod.preco})">
              Adicionar e Retirar no Balcão
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  });

  listaProdutos.appendChild(container);
}

// --- Funções para carrinho ---
function adicionarCarrinho(nome, preco) {
  const itemExistente = carrinho.find(item => item.nome === nome);
  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ nome, preco, quantidade: 1 });
  }
  atualizarCarrinho();
}

function removerCarrinho(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  listaCarrinho.innerHTML = "";

  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = `<li class="list-group-item">Carrinho vazio.</li>`;
    resumoPedido.classList.add("d-none");
    return;
  }

  let total = 0;

  carrinho.forEach(item => {
    total += item.preco * item.quantidade;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <div>
        ${item.nome} <span class="badge bg-primary rounded-pill ms-2">${item.quantidade}</span>
      </div>
      <div>
        R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
        <button class="btn btn-sm btn-danger ms-3" onclick="removerCarrinho('${item.nome}')">&times;</button>
      </div>
    `;
    listaCarrinho.appendChild(li);
  });

  resumoPedido.classList.remove("d-none");
  resumoPedido.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

// --- Função para finalizar pedido ---
function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  // Gera o JSON do pedido
  const dados = {
    itens: carrinho.map(item => ({
      produto: item.nome,
      quantidade: item.quantidade
    }))
  };

  // Envia o pedido para o backend em Go
  fetch("http://localhost:8080/pedido", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  })
    .then(res => {
      if (res.ok) {
        alert("✅ Pedido enviado com sucesso! Retire no balcão.");
        carrinho = [];
        atualizarCarrinho();
      } else {
        res.text().then(texto => {
          alert("Erro ao enviar pedido: " + texto);
        });
      }
    })
    .catch(err => {
      console.error(err);
      alert("❌ Erro na conexão com o servidor.");
    });
}


// --- Busca ---
campoBusca.addEventListener("input", () => {
  const termo = campoBusca.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');

  if (termo === "") {
    exibirProdutos(categoriaAtual);
    return;
  }

  listaProdutos.innerHTML = "";
  const container = document.createDocumentFragment();

  Object.values(produtos).forEach(itens => {
    itens.forEach(prod => {
      const nomeNormalizado = prod.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
      if (nomeNormalizado.includes(termo)) {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";
        col.innerHTML = `
          <div class="card h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">${prod.nome}</h5>
              <p class="card-text">R$ ${prod.preco.toFixed(2).replace('.', ',')}</p>
              <button class="btn btn-success mt-auto" onclick="adicionarCarrinho('${prod.nome}', ${prod.preco})">
                Adicionar e Retirar no Balcão
              </button>
            </div>
          </div>
        `;
        container.appendChild(col);
      }
    });
  });

  listaProdutos.appendChild(container);
});

// --- Inicialização ---
window.onload = () => {
  exibirCategorias();
  exibirProdutos("Todos");
  atualizarCarrinho();
};
