import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  getDocs,
  doc,
  updateDoc,
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

const usuariosRef = collection(db, "usuarios");
const mesasRef = collection(db, "mesas");

const telaLista = document.getElementById("telaLista");
const telaCadastro = document.getElementById("telaCadastro");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const btnCancelar = document.getElementById("btnCancelar");
const tabelaUsuarios = document.getElementById("tabelaUsuarios");
const formNovoUsuario = document.getElementById("formNovoUsuario");
const inputTelefone = document.getElementById("cadTelefone");

// Novos Elementos para Modais de Edição e Reset de Senha
const modalEditarUsuario = document.getElementById("modalEditarUsuario");
const fecharModalEditar = document.getElementById("fecharModalEditar");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");
const formEditarUsuario = document.getElementById("formEditarUsuario");

const editId = document.getElementById("editId");
const editNome = document.getElementById("editNome");
const editEmail = document.getElementById("editEmail");
const editPerfil = document.getElementById("editPerfil");
const editTelefone = document.getElementById("editTelefone");
const editAtivo = document.getElementById("editAtivo");

// Elementos de Designação de Mesas
const containerMesasGarcom = document.getElementById("containerMesasGarcom");
const cadRedivisao = document.getElementById("cadRedivisao");
const gridMesasCadastro = document.getElementById("gridMesasCadastro");

const containerMesasGarcomEdicao = document.getElementById("containerMesasGarcomEdicao");
const editRedivisao = document.getElementById("editRedivisao");
const gridMesasEdicao = document.getElementById("gridMesasEdicao");

const modalResetSenha = document.getElementById("modalResetSenha");
const fecharModalReset = document.getElementById("fecharModalReset");
const btnCancelarReset = document.getElementById("btnCancelarReset");
const formResetSenha = document.getElementById("formResetSenha");
const resetId = document.getElementById("resetId");
const resetNomeUsuario = document.getElementById("resetNomeUsuario");

// Formatar Telefone
function aplicarMascaraTelefone(input) {
  input.addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");
    valor = valor.substring(0, 11);
    if (valor.length > 2) {
      valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    }
    if (valor.length > 9) {
      valor = `${valor.substring(0, 10)}-${valor.substring(10)}`;
    }
    e.target.value = valor;
  });
}
aplicarMascaraTelefone(inputTelefone);
aplicarMascaraTelefone(editTelefone);

// Gerar Checkboxes das Mesas (1 a 20)
function gerarCheckboxesMesa(gridEl, prefixo) {
  gridEl.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const label = document.createElement("label");
    label.className = "mesa-item";
    label.innerHTML = `
      <input type="checkbox" id="${prefixo}_mesa_${i}" value="${i}">
      Mesa ${i}
    `;
    gridEl.appendChild(label);
  }
}
gerarCheckboxesMesa(gridMesasCadastro, "cad");
gerarCheckboxesMesa(gridMesasEdicao, "edit");

// Alternar Visibilidade dos Campos do Garçom
function toggleCadastroGarcomFields() {
  if (document.getElementById("cadPerfil").value === "Garçom") {
    containerMesasGarcom.style.display = "block";
    toggleCadastroGrid();
  } else {
    containerMesasGarcom.style.display = "none";
  }
}
function toggleCadastroGrid() {
  if (cadRedivisao.checked) {
    gridMesasCadastro.style.display = "none";
  } else {
    gridMesasCadastro.style.display = "grid";
  }
}

function toggleEdicaoGarcomFields() {
  if (editPerfil.value === "Garçom") {
    containerMesasGarcomEdicao.style.display = "block";
    toggleEdicaoGrid();
  } else {
    containerMesasGarcomEdicao.style.display = "none";
  }
}
function toggleEdicaoGrid() {
  if (editRedivisao.checked) {
    gridMesasEdicao.style.display = "none";
  } else {
    gridMesasEdicao.style.display = "grid";
  }
}

document.getElementById("cadPerfil").addEventListener("change", toggleCadastroGarcomFields);
cadRedivisao.addEventListener("change", toggleCadastroGrid);
editPerfil.addEventListener("change", toggleEdicaoGarcomFields);
editRedivisao.addEventListener("change", toggleEdicaoGrid);

// Abrir e fechar telas básicas
btnAbrirCadastro.addEventListener("click", () => {
  telaLista.style.display = "none";
  telaCadastro.style.display = "block";
  btnAbrirCadastro.style.display = "none";
  toggleCadastroGarcomFields();
});

btnCancelar.addEventListener("click", () => {
  telaLista.style.display = "block";
  telaCadastro.style.display = "none";
  btnAbrirCadastro.style.display = "flex";
  formNovoUsuario.reset();
});

fecharModalEditar.onclick = () => (modalEditarUsuario.style.display = "none");
btnCancelarEditar.onclick = () => (modalEditarUsuario.style.display = "none");

fecharModalReset.onclick = () => (modalResetSenha.style.display = "none");
btnCancelarReset.onclick = () => (modalResetSenha.style.display = "none");

let todosUsuarios = [];

// Escutar Usuários
onSnapshot(usuariosRef, (snapshot) => {
  tabelaUsuarios.innerHTML = "";
  todosUsuarios = [];

  snapshot.forEach((doc) => {
    const u = doc.data();
    todosUsuarios.push({ id: doc.id, ...u });

    const statusText = u.ativo !== false ? "Ativo" : "Inativo";
    const statusColor = u.ativo !== false ? "#2ecc71" : "#e74c3c";

    tabelaUsuarios.innerHTML += `
            <tr>
                <td>
                    <div class="user-name">
                        <div class="user-icon">👤</div>
                        ${u.nome}
                    </div>
                </td>
                <td>✉️ ${u.email}</td>
                <td><span class="badge-perfil">${u.perfil}</span></td>
                <td><span class="badge-status" style="color: ${statusColor}; font-weight: bold;">${statusText}</span></td>
                <td>
                    <button class="btn-link btn-editar-usr" data-id="${doc.id}">Editar</button>
                    <button class="btn-link btn-reset-usr" data-id="${doc.id}">Resetar Senha</button>
                </td>
            </tr>
        `;
  });

  // Mapear eventos dos botões na tabela
  document.querySelectorAll(".btn-editar-usr").forEach(btn => {
    btn.onclick = (e) => abrirEdicao(e.target.dataset.id);
  });
  document.querySelectorAll(".btn-reset-usr").forEach(btn => {
    btn.onclick = (e) => abrirReset(e.target.dataset.id);
  });

  if (todosUsuarios.length === 0) {
    tabelaUsuarios.innerHTML =
      '<tr><td colspan="5" style="text-align: center; color:#aaa;">Nenhum usuário cadastrado. Crie o primeiro!</td></tr>';
  }
});

// Ações dos Modais
function abrirEdicao(id) {
  const user = todosUsuarios.find((u) => u.id === id);
  if (!user) return;

  editId.value = id;
  editNome.value = user.nome;
  editEmail.value = user.email;
  editPerfil.value = user.perfil;
  editTelefone.value = user.telefone || "";
  editAtivo.checked = user.ativo !== false;

  if (user.perfil === "Garçom") {
    editRedivisao.checked = user.redivisaoAutomatica !== false;
    const mesasDesignadas = user.mesasDesignadas || [];
    for (let i = 1; i <= 20; i++) {
      const chk = document.getElementById(`edit_mesa_${i}`);
      if (chk) chk.checked = mesasDesignadas.includes(i);
    }
  }
  toggleEdicaoGarcomFields();
  modalEditarUsuario.style.display = "block";
}

function abrirReset(id) {
  const user = todosUsuarios.find((u) => u.id === id);
  if (!user) return;

  resetId.value = id;
  resetNomeUsuario.innerText = user.nome;
  modalResetSenha.style.display = "block";
}

// Cadastro de Usuários
formNovoUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const perfil = document.getElementById("cadPerfil").value;
  const redivisao = cadRedivisao.checked;

  const novoUser = {
    nome: document.getElementById("cadNome").value,
    email: document.getElementById("cadEmail").value.toLowerCase(),
    perfil: perfil,
    telefone: document.getElementById("cadTelefone").value,
    senha: document.getElementById("cadSenha").value,
    ativo: true,
  };

  if (perfil === "Garçom") {
    novoUser.redivisaoAutomatica = redivisao;
    if (!redivisao) {
      const selecionadas = [];
      for (let i = 1; i <= 20; i++) {
        const chk = document.getElementById(`cad_mesa_${i}`);
        if (chk && chk.checked) selecionadas.push(i);
      }
      novoUser.mesasDesignadas = selecionadas;
    } else {
      novoUser.mesasDesignadas = [];
    }
  }

  try {
    await addDoc(usuariosRef, novoUser);
    alert("Usuário criado com sucesso!");
    await redividirTodasMesas();
    btnCancelar.click();
  } catch (err) {
    console.error(err);
    alert("Erro ao criar usuário.");
  }
});

// Edição de Usuários
formEditarUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editId.value;
  const perfil = editPerfil.value;
  const redivisao = editRedivisao.checked;

  const dadosAtualizados = {
    nome: editNome.value,
    email: editEmail.value.toLowerCase(),
    perfil: perfil,
    telefone: editTelefone.value,
    ativo: editAtivo.checked,
  };

  if (perfil === "Garçom") {
    dadosAtualizados.redivisaoAutomatica = redivisao;
    if (!redivisao) {
      const selecionadas = [];
      for (let i = 1; i <= 20; i++) {
        const chk = document.getElementById(`edit_mesa_${i}`);
        if (chk && chk.checked) selecionadas.push(i);
      }
      dadosAtualizados.mesasDesignadas = selecionadas;
    } else {
      dadosAtualizados.mesasDesignadas = [];
    }
  }

  try {
    await updateDoc(doc(db, "usuarios", id), dadosAtualizados);
    alert("Usuário atualizado com sucesso!");
    await redividirTodasMesas();
    modalEditarUsuario.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar usuário.");
  }
});

// Reset de Senha
formResetSenha.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = resetId.value;
  try {
    await updateDoc(doc(db, "usuarios", id), { senha: "123456" });
    alert("Senha resetada com sucesso para 123456!");
    modalResetSenha.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Erro ao resetar senha.");
  }
});

// Redivisão de Mesas Robusta
async function redividirTodasMesas() {
  const snapUsers = await getDocs(usuariosRef);
  const todosGarcons = [];
  snapUsers.forEach((docSnap) => {
    const u = docSnap.data();
    if (u.perfil === "Garçom" && u.ativo !== false) {
      todosGarcons.push({ id: docSnap.id, ...u });
    }
  });

  const snapMesas = await getDocs(mesasRef);
  let mesasArray = [];
  snapMesas.forEach((docSnap) => mesasArray.push({ id: docSnap.id, ...docSnap.data() }));
  mesasArray.sort((a, b) => a.numero - b.numero);

  const garconsManuais = todosGarcons.filter(g => g.redivisaoAutomatica === false);
  const garconsAutomaticos = todosGarcons.filter(g => g.redivisaoAutomatica !== false);

  const atribuicoes = {};

  // 1. Atribuir mesas dos garçons manuais
  garconsManuais.forEach(garcom => {
    const mesas = garcom.mesasDesignadas || [];
    mesas.forEach(num => {
      atribuicoes[num] = garcom.nome;
    });
  });

  // 2. Mesas restantes a distribuir
  const mesasRestantes = mesasArray.filter(mesa => !atribuicoes[mesa.numero]);

  if (garconsAutomaticos.length > 0) {
    for (let i = 0; i < mesasRestantes.length; i++) {
      const mesa = mesasRestantes[i];
      const garcomResponsavel = garconsAutomaticos[i % garconsAutomaticos.length].nome;
      atribuicoes[mesa.numero] = garcomResponsavel;
    }
  }

  // 3. Atualizar no banco
  for (let i = 0; i < mesasArray.length; i++) {
    const mesa = mesasArray[i];
    const garcomResponsavel = atribuicoes[mesa.numero] || "Sem Garçom";
    await updateDoc(doc(db, "mesas", mesa.id), {
      garcom: garcomResponsavel,
    });
  }
  console.log("Mesas redistribuídas com sucesso!");
}

