import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const nomeLogado = localStorage.getItem("usuarioLogado");
const perfilLogado = localStorage.getItem("perfilLogado");

const elNome = document.getElementById("headerNomeUsuario");
const elPerfil = document.getElementById("headerPerfilUsuario");

if (elNome && elPerfil) {
  if (nomeLogado && perfilLogado) {
    elNome.innerText = nomeLogado;
    elPerfil.innerText = perfilLogado;
  } else {
    elNome.innerText = "Visitante";
    elPerfil.innerText = "Sem Perfil";
  }
}

const elInfo = document.querySelector(".usuario-info, .user-info");
if (elInfo) {
  const btnLogout = document.createElement("a");
  btnLogout.innerText = "Sair";
  btnLogout.style =
    "color: #e74c3c; cursor: pointer; font-size: 0.85em; font-weight: bold; margin-top: 4px; display: inline-block; text-decoration: none;";
  btnLogout.onclick = () => {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
      localStorage.clear();
      window.location.href = "../../Login/index.html";
    }
  };
  elInfo.appendChild(document.createElement("br"));
  elInfo.appendChild(btnLogout);
}

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

const configRef = doc(db, "configuracoes", "geral");

const inTaxaEntrega = document.getElementById("cfgTaxaEntrega");
const inMinimoDelivery = document.getElementById("cfgMinimoDelivery");
const inDistanciaMax = document.getElementById("cfgDistanciaMax");
const chkAceitarDelivery = document.getElementById("cfgAceitarDelivery");
const inHoraAbertura = document.getElementById("cfgHoraAbertura");
const inHoraFechamento = document.getElementById("cfgHoraFechamento");
const chkAceitarNovos = document.getElementById("cfgAceitarNovos");
const btnSalvarConfig = document.getElementById("btnSalvarConfig");

const containerCategorias = document.getElementById("containerCategorias");
const btnAdicionarCategoria = document.getElementById("btnAdicionarCategoria");
const modalCategoria = document.getElementById("modalCategoria");
const fecharModalCategoria = document.getElementById("fecharModalCategoria");
const btnCancelarCategoria = document.getElementById("btnCancelarCategoria");
const btnSalvarCategoria = document.getElementById("btnSalvarCategoria");
const tituloModalCategoria = document.getElementById("tituloModalCategoria");
const inputNomeCategoria = document.getElementById("inputNomeCategoria");

const chkPagDinheiro = document.getElementById("chkPagDinheiro");
const chkPagDebito = document.getElementById("chkPagDebito");
const chkPagCredito = document.getElementById("chkPagCredito");
const chkPagPix = document.getElementById("chkPagPix");
const chkPagVR = document.getElementById("chkPagVR");

let categoriasLocais = ["Entradas", "Pratos Principais", "Saladas", "Sobremesas", "Bebidas"];
let categoriaEditandoIndex = null;

function renderizarCategorias() {
  containerCategorias.innerHTML = "";
  categoriasLocais.forEach((cat, index) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <strong>${cat}</strong>
      <div>
        <button type="button" class="btn-editar-mock btn-editar-categoria" style="margin-right: 5px;" data-index="${index}">Editar</button>
        <button type="button" class="btn-editar-mock btn-remover-categoria" style="background: #e74c3c;" data-index="${index}">Excluir</button>
      </div>
    `;
    containerCategorias.appendChild(div);
  });

  document.querySelectorAll(".btn-editar-categoria").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      abrirModalCategoria(Number(event.currentTarget.dataset.index));
    });
  });

  document.querySelectorAll(".btn-remover-categoria").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      removerCategoria(Number(event.currentTarget.dataset.index));
    });
  });
}

function abrirModalCategoria(index = null) {
  categoriaEditandoIndex = index;
  const editando = index !== null;
  tituloModalCategoria.innerText = editando ? "Editar Categoria" : "Nova Categoria";
  inputNomeCategoria.value = editando ? categoriasLocais[index] : "";
  modalCategoria.style.display = "block";
  inputNomeCategoria.focus();
}

function fecharModalDeCategoria() {
  modalCategoria.style.display = "none";
  categoriaEditandoIndex = null;
  inputNomeCategoria.value = "";
}

function removerCategoria(index) {
  if (confirm(`Tem certeza que deseja excluir a categoria "${categoriasLocais[index]}"?`)) {
    categoriasLocais.splice(index, 1);
    renderizarCategorias();
  }
}

btnAdicionarCategoria.addEventListener("click", () => {
  abrirModalCategoria();
});

btnSalvarCategoria.addEventListener("click", () => {
  const nomeCat = inputNomeCategoria.value.trim();
  if (!nomeCat) {
    alert("Informe o nome da categoria.");
    return;
  }

  const existe = categoriasLocais.some(
    (cat, index) =>
      cat.toLowerCase() === nomeCat.toLowerCase() &&
      index !== categoriaEditandoIndex
  );

  if (existe) {
    alert("Esta categoria ja existe!");
    return;
  }

  if (categoriaEditandoIndex !== null) {
    categoriasLocais[categoriaEditandoIndex] = nomeCat;
  } else {
    categoriasLocais.push(nomeCat);
  }

  renderizarCategorias();
  fecharModalDeCategoria();
});

fecharModalCategoria.addEventListener("click", fecharModalDeCategoria);
btnCancelarCategoria.addEventListener("click", fecharModalDeCategoria);
modalCategoria.addEventListener("click", (event) => {
  if (event.target === modalCategoria) {
    fecharModalDeCategoria();
  }
});

async function carregarConfiguracoes() {
  try {
    const docSnap = await getDoc(configRef);

    if (docSnap.exists()) {
      const dados = docSnap.data();

      if (dados.taxaEntrega !== undefined)
        inTaxaEntrega.value = dados.taxaEntrega;
      if (dados.minimoDelivery !== undefined)
        inMinimoDelivery.value = dados.minimoDelivery;
      if (dados.distanciaMax !== undefined)
        inDistanciaMax.value = dados.distanciaMax;
      if (dados.aceitarDelivery !== undefined)
        chkAceitarDelivery.checked = dados.aceitarDelivery;

      if (dados.horaAbertura) inHoraAbertura.value = dados.horaAbertura;
      if (dados.horaFechamento) inHoraFechamento.value = dados.horaFechamento;
      if (dados.restauranteAberto !== undefined)
        chkAceitarNovos.checked = dados.restauranteAberto;

      if (dados.categorias) {
        categoriasLocais = dados.categorias;
      }

      if (dados.formasPagamento) {
        chkPagDinheiro.checked = !!dados.formasPagamento.dinheiro;
        chkPagDebito.checked = !!dados.formasPagamento.debito;
        chkPagCredito.checked = !!dados.formasPagamento.credito;
        chkPagPix.checked = !!dados.formasPagamento.pix;
        chkPagVR.checked = !!dados.formasPagamento.vr;
      } else {
        chkPagDinheiro.checked = true;
        chkPagDebito.checked = true;
        chkPagCredito.checked = true;
        chkPagPix.checked = true;
        chkPagVR.checked = true;
      }
    } else {
      chkPagDinheiro.checked = true;
      chkPagDebito.checked = true;
      chkPagCredito.checked = true;
      chkPagPix.checked = true;
      chkPagVR.checked = true;
    }
    renderizarCategorias();
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
}

btnSalvarConfig.addEventListener("click", async () => {
  btnSalvarConfig.innerText = "Salvando...";
  btnSalvarConfig.disabled = true;

  const novasConfiguracoes = {
    taxaEntrega: parseFloat(inTaxaEntrega.value) || 0,
    minimoDelivery: parseFloat(inMinimoDelivery.value) || 0,
    distanciaMax: parseFloat(inDistanciaMax.value) || 0,
    aceitarDelivery: chkAceitarDelivery.checked,
    horaAbertura: inHoraAbertura.value,
    horaFechamento: inHoraFechamento.value,
    restauranteAberto: chkAceitarNovos.checked,
    categorias: categoriasLocais,
    formasPagamento: {
      dinheiro: chkPagDinheiro.checked,
      debito: chkPagDebito.checked,
      credito: chkPagCredito.checked,
      pix: chkPagPix.checked,
      vr: chkPagVR.checked
    }
  };

  try {
    await setDoc(configRef, novasConfiguracoes, { merge: true });

    alert("Configurações atualizadas com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    alert("Erro ao salvar configurações. Tente novamente.");
  } finally {
    btnSalvarConfig.innerText = "💾 Salvar Configurações";
    btnSalvarConfig.disabled = false;
  }
});

carregarConfiguracoes();

