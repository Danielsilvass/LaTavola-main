import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
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

// Injetar Botão de Logout
const elInfoDB = document.querySelector('.usuario-info, .user-info');
if (elInfoDB) {
  const btnLogout = document.createElement('a');
  btnLogout.innerText = "Sair ↩";
  btnLogout.style = "color: #e74c3c; cursor: pointer; font-size: 0.85em; font-weight: bold; margin-top: 4px; display: inline-block; text-decoration: none;";
  btnLogout.onclick = () => {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
      localStorage.clear();
      window.location.href = "../Login/index.html";
    }
  };
  elInfoDB.appendChild(document.createElement('br'));
  elInfoDB.appendChild(btnLogout);
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

const produtosRef = collection(db, "produtos");
const pedidosRef = collection(db, "pedidos");

const valFaturamento = document.getElementById("valFaturamento");
const valVendas = document.getElementById("valVendas");
const valTicket = document.getElementById("valTicket");
const valProdutos = document.getElementById("valProdutos");

const topVendidoNome = document.getElementById("topVendidoNome");
const topVendidoCat = document.getElementById("topVendidoCat");
const topVendidoQtd = document.getElementById("topVendidoQtd");
const topVendidoReceita = document.getElementById("topVendidoReceita");

const topLucrativoNome = document.getElementById("topLucrativoNome");
const topLucrativoCat = document.getElementById("topLucrativoCat");
const topLucrativoLucro = document.getElementById("topLucrativoLucro");

const sugestaoNome = document.getElementById("sugestaoNome");
const sugestaoInfo = document.getElementById("sugestaoInfo");

let dictProdutos = {};
let totalProdutosAtivos = 0;
let listaDePedidos = [];

onSnapshot(produtosRef, (snapshot) => {
  totalProdutosAtivos = 0;

  snapshot.forEach((doc) => {
    const p = doc.data();
    if (p.ativo) {
      totalProdutosAtivos++;
    }

    if (!dictProdutos[p.nome]) {
      dictProdutos[p.nome] = {
        nome: p.nome,
        categoria: p.categoria || "Diversos",
        preco: Number(p.preco) || 0,
        custo: Number(p.custo) || 0,
        qtdVendida: 0,
        receita: 0,
      };
    } else {
      dictProdutos[p.nome].preco = Number(p.preco) || 0;
      dictProdutos[p.nome].custo = Number(p.custo) || 0;
    }
  });

  valProdutos.innerText = totalProdutosAtivos;
  calcularDashboard();
});

onSnapshot(pedidosRef, (snapshot) => {
  listaDePedidos = [];
  snapshot.forEach((doc) => {
    listaDePedidos.push(doc.data());
  });
  calcularDashboard();
});

function calcularDashboard() {
  if (Object.keys(dictProdutos).length === 0) return;

  let faturamento = 0;
  let vendasConcluidas = 0;

  Object.keys(dictProdutos).forEach((k) => {
    dictProdutos[k].text = ""; // clear
    dictProdutos[k].qtdVendida = 0;
    dictProdutos[k].receita = 0;
  });

  listaDePedidos.forEach((pedido) => {
    const isDelivery = !!pedido.cliente;
    const isMesa = !!pedido.mesaId;

    let vendaValida = false;

    if (isDelivery && pedido.status === "Entregue") vendaValida = true;

    if (isMesa && pedido.status === "Pago") vendaValida = true;

    if (!vendaValida) return;

    vendasConcluidas++;

    if (pedido.itens) {
      pedido.itens.forEach((item) => {
        let receitaDoItem = Number(item.preco) * Number(item.quantidade);
        faturamento += receitaDoItem;

        if (!dictProdutos[item.nome]) {
          dictProdutos[item.nome] = {
            nome: item.nome,
            categoria: item.categoria || "Sem categoria",
            preco: Number(item.preco),
            custo: 0,
            qtdVendida: 0,
            receita: 0,
          };
        }
        dictProdutos[item.nome].qtdVendida += Number(item.quantidade);
        dictProdutos[item.nome].receita += receitaDoItem;
      });
    }
  });
  valFaturamento.innerText = `R$ ${faturamento.toFixed(2)}`;
  valVendas.innerText = vendasConcluidas;

  let ticketMedio = vendasConcluidas > 0 ? faturamento / vendasConcluidas : 0;
  valTicket.innerText = `R$ ${ticketMedio.toFixed(2)}`;

  let arrayProdutos = Object.values(dictProdutos).filter(
    (p) => p.qtdVendida > 0
  );

  if (arrayProdutos.length > 0) {
    arrayProdutos.sort((a, b) => b.qtdVendida - a.qtdVendida);
    let maisVendido = arrayProdutos[0];

    topVendidoNome.innerText = maisVendido.nome;
    topVendidoCat.innerText = maisVendido.categoria;
    topVendidoQtd.innerText = maisVendido.qtdVendida;
    topVendidoReceita.innerText = `R$ ${maisVendido.receita.toFixed(2)}`;

    // Calcular Lucro e Margem reais para cada um
    arrayProdutos.forEach((p) => {
      p.lucroReal = p.receita - (p.qtdVendida * p.custo);
      p.margemReal = p.preco > 0 ? ((p.preco - p.custo) / p.preco) * 100 : 0;
    });

    arrayProdutos.sort((a, b) => b.lucroReal - a.lucroReal);
    let maisLucrativo = arrayProdutos[0];
    let lucroEstimado = maisLucrativo.lucroReal;
    let margemPercentual = maisLucrativo.margemReal;

    topLucrativoNome.innerText = maisLucrativo.nome;
    topLucrativoCat.innerText = maisLucrativo.categoria;
    topLucrativoLucro.innerText = `R$ ${lucroEstimado.toFixed(2)}`;

    sugestaoNome.innerText = maisLucrativo.nome;
    sugestaoInfo.innerText = `${
      maisLucrativo.categoria
    } • R$ ${maisLucrativo.preco.toFixed(2)} • Margem: ${margemPercentual.toFixed(1)}%`;
  } else {
    topVendidoNome.innerText = "Nenhuma venda registrada";
    topVendidoCat.innerText = "-";
    topVendidoQtd.innerText = "0";
    topVendidoReceita.innerText = "R$ 0.00";

    topLucrativoNome.innerText = "Nenhuma venda registrada";
    topLucrativoCat.innerText = "-";
    topLucrativoLucro.innerText = "R$ 0.00";

    sugestaoNome.innerText = "Aguardando Vendas";
    sugestaoInfo.innerText = "Faça o primeiro pedido para gerar sugestões.";
  }
}
