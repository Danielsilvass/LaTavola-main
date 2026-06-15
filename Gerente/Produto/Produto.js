import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. LÓGICA DO CABEÇALHO DINÂMICO
// ==========================================
const nomeLogado = localStorage.getItem('usuarioLogado');
const perfilLogado = localStorage.getItem('perfilLogado');

const elNome = document.getElementById('headerNomeUsuario');
const elPerfil = document.getElementById('headerPerfilUsuario');

if (elNome && elPerfil) {
    if (nomeLogado && perfilLogado) {
        elNome.innerText = nomeLogado;
        elPerfil.innerText = perfilLogado;
    } else {
        elNome.innerText = "Visitante";
        elPerfil.innerText = "Sem Perfil";
    }
}
// ==========================================

// SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBayur0I7uCelwae7NVXot19cYOD2fa0ro",
  authDomain: "latavola-99df2.firebaseapp.com",
  projectId: "latavola-99df2",
  storageBucket: "latavola-99df2.firebasestorage.app",
  messagingSenderId: "336225970527",
  appId: "1:336225970527:web:5f60e799c507931143aeea",
  measurementId: "G-XF8PMT0KGV",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const produtosRef = collection(db, "produtos");
const pedidosRef = collection(db, "pedidos");
const configRef = doc(db, "configuracoes", "geral");

const listaProdutos = document.getElementById("listaProdutos");

// Modais e Botoes
const modalNovo = document.getElementById("modalNovo");
const modalEditar = document.getElementById("modalEditar");
const formNovo = document.getElementById("formNovo");
const formEditar = document.getElementById("formEditar");

document.getElementById("btnNovoProduto").onclick = () => {
  modalNovo.style.display = "block";
};
document.getElementById("btnCancelarNovo").onclick = () => {
  modalNovo.style.display = "none";
};
document.getElementById("fecharModalNovo").onclick = () => {
  modalNovo.style.display = "none";
};

document.getElementById("btnCancelarEditar").onclick = () => {
  modalEditar.style.display = "none";
};
document.getElementById("fecharModalEditar").onclick = () => {
  modalEditar.style.display = "none";
};

// Imagem Upload & Preview Elements
const novaImagemInput = document.getElementById("novaImagem");
const previewNovoContainer = document.getElementById("previewNovoContainer");
const previewNovoImg = document.getElementById("previewNovo");

const editImagemInput = document.getElementById("editImagem");
const previewEditarContainer = document.getElementById("previewEditarContainer");
const previewEditarImg = document.getElementById("previewEditar");

let novoImagemBase64 = "";
let editImagemBase64 = "";

// MEMÓRIA DE DADOS
let produtosTemp = [];
let pedidosTemp = [];
let categoriasLocais = ["Entradas", "Pratos Principais", "Saladas", "Sobremesas", "Bebidas"];

// 1. ESCUTAR PRODUTOS EM TEMPO REAL
onSnapshot(produtosRef, (snapshot) => {
  produtosTemp = [];
  snapshot.forEach((documento) => {
    produtosTemp.push({ id: documento.id, ...documento.data() });
  });
  renderizarTabela();
});

// 2. ESCUTAR PEDIDOS (Para contar Vendas)
onSnapshot(pedidosRef, (snapshot) => {
  pedidosTemp = [];
  snapshot.forEach((doc) => {
    pedidosTemp.push(doc.data());
  });
  renderizarTabela();
});

// Carregar Categorias Dinâmicas do Firestore para os Dropdowns
async function carregarCategorias() {
  try {
    const docSnap = await getDoc(configRef);
    if (docSnap.exists() && docSnap.data().categorias) {
      categoriasLocais = docSnap.data().categorias;
    }
  } catch (e) {
    console.error("Erro ao carregar categorias:", e);
  }

  const preencherSelect = (selectEl) => {
    selectEl.innerHTML = '<option value="">Selecione uma categoria...</option>';
    categoriasLocais.forEach((cat) => {
      selectEl.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  };

  preencherSelect(document.getElementById("novaCategoria"));
  preencherSelect(document.getElementById("editCategoria"));
}
carregarCategorias();

// Redimensionar e Comprimir Imagem
function processarImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 600;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(arquivo);
  });
}

novaImagemInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      novoImagemBase64 = await processarImagem(file);
      previewNovoImg.src = novoImagemBase64;
      previewNovoContainer.style.display = "block";
    } catch (err) {
      console.error(err);
      alert("Erro ao processar imagem");
    }
  }
});

editImagemInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      editImagemBase64 = await processarImagem(file);
      previewEditarImg.src = editImagemBase64;
      previewEditarContainer.style.display = "block";
    } catch (err) {
      console.error(err);
      alert("Erro ao processar imagem");
    }
  }
});

// 3. RENDERIZAR TABELA
function renderizarTabela() {
  listaProdutos.innerHTML = "";

  if (produtosTemp.length === 0) {
    listaProdutos.innerHTML =
      '<tr><td colspan="8" style="text-align: center; color: #777; padding: 30px;">Nenhum produto cadastrado no cardápio.</td></tr>';
    return;
  }

  produtosTemp.forEach((produto) => {
    let preco = Number(produto.preco) || 0;
    let custo = Number(produto.custo) || 0;
    let margem = preco > 0 ? ((preco - custo) / preco) * 100 : 0;

    // Contar Vendas
    let qtdVendida = 0;
    pedidosTemp.forEach((pedido) => {
      if (
        pedido.status !== "Recusado" &&
        pedido.status !== "Aguardando Aprovação"
      ) {
        if (pedido.itens) {
          pedido.itens.forEach((item) => {
            if (item.nome === produto.nome) {
              qtdVendida += Number(item.quantidade);
            }
          });
        }
      }
    });

    const statusHTML = produto.ativo
      ? '<span class="badge-ativo">Ativo</span>'
      : '<span class="badge-inativo">Inativo</span>';

    const imgHTML = produto.imagemBase64
      ? `<img src="${produto.imagemBase64}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid #333;" />`
      : `<div style="width: 35px; height: 35px; border-radius: 50%; background: #222; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #333; font-size: 1.1em;">🍽️</div>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="td-nome">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${imgHTML}
                <span>${produto.nome}</span>
              </div>
            </td>
            <td class="td-cat">${produto.categoria}</td>
            <td class="td-preco">R$ ${preco.toFixed(2)}</td>
            <td class="td-custo">R$ ${custo.toFixed(2)}</td>
            <td class="td-margem">${margem.toFixed(1)}%</td>
            <td class="td-vendas" style="text-align: center;">${qtdVendida}</td>
            <td>${statusHTML}</td>
            <td>
                <div class="acoes-container">
                    <button class="icon-btn btn-editar" title="Editar Produto" data-id="${
                      produto.id
                    }">📝</button>
                    <button class="icon-btn btn-excluir" title="Desativar/Excluir" data-id="${
                      produto.id
                    }">⏻</button>
                </div>
            </td>
        `;
    listaProdutos.appendChild(tr);
  });

  adicionarEventosBotoesAcao();
}

// 4. AÇÕES CRUD (CRIAR, EDITAR, DELETAR)
formNovo.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btnSubmit = formNovo.querySelector('button[type="submit"]');
  btnSubmit.innerText = "Salvando...";
  btnSubmit.disabled = true;

  try {
    const novoProduto = {
      nome: document.getElementById("novoNome").value,
      categoria: document.getElementById("novaCategoria").value,
      preco: parseFloat(document.getElementById("novoPreco").value) || 0,
      custo: parseFloat(document.getElementById("novoCusto").value) || 0,
      descricao: document.getElementById("novaDescricao").value,
      imagemBase64: novoImagemBase64,
      ativo: document.getElementById("novoStatus").checked,
    };
    await addDoc(produtosRef, novoProduto);
    formNovo.reset();
    novoImagemBase64 = "";
    previewNovoImg.src = "";
    previewNovoContainer.style.display = "none";
    modalNovo.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Erro ao criar produto");
  } finally {
    btnSubmit.innerText = "Criar Produto";
    btnSubmit.disabled = false;
  }
});

formEditar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btnSubmit = formEditar.querySelector('button[type="submit"]');
  btnSubmit.innerText = "Salvando...";
  btnSubmit.disabled = true;

  try {
    const id = document.getElementById("editId").value;
    const docRef = doc(db, "produtos", id);
    const dadosAtualizados = {
      nome: document.getElementById("editNome").value,
      categoria: document.getElementById("editCategoria").value,
      preco: parseFloat(document.getElementById("editPreco").value) || 0,
      custo: parseFloat(document.getElementById("editCusto").value) || 0,
      descricao: document.getElementById("editDescricao").value,
      imagemBase64: editImagemBase64,
      ativo: document.getElementById("editStatus").checked,
    };
    await updateDoc(docRef, dadosAtualizados);
    editImagemBase64 = "";
    previewEditarImg.src = "";
    previewEditarContainer.style.display = "none";
    modalEditar.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar produto");
  } finally {
    btnSubmit.innerText = "Salvar Alterações";
    btnSubmit.disabled = false;
  }
});

function adicionarEventosBotoesAcao() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest("button").getAttribute("data-id");
      const produtoParaEditar = produtosTemp.find((p) => p.id === id);

      if (produtoParaEditar) {
        document.getElementById("editId").value = id;
        document.getElementById("editNome").value = produtoParaEditar.nome;
        document.getElementById("editCategoria").value =
          produtoParaEditar.categoria;
        document.getElementById("editPreco").value = produtoParaEditar.preco;
        document.getElementById("editCusto").value = produtoParaEditar.custo || 0;
        document.getElementById("editDescricao").value = produtoParaEditar.descricao || "";
        editImagemBase64 = produtoParaEditar.imagemBase64 || "";
        if (editImagemBase64) {
          previewEditarImg.src = editImagemBase64;
          previewEditarContainer.style.display = "block";
        } else {
          previewEditarImg.src = "";
          previewEditarContainer.style.display = "none";
        }
        document.getElementById("editStatus").checked = produtoParaEditar.ativo;
        modalEditar.style.display = "block";
      }
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("button").getAttribute("data-id");
      if (confirm("Tem certeza que deseja excluir este produto do sistema?")) {
        await deleteDoc(doc(db, "produtos", id));
      }
    });
  });
}