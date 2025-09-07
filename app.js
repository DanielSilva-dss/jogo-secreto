// app.js

// --- CÓDIGO DE INICIALIZAÇÃO DO FIREBASE ---
// --- IMPORTAÇÃO DA CONFIGURAÇÃO DO FIREBASE ---
import { firebaseConfig } from './firebase-config.js';

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();
const rankingCol = db.collection("ranking");

// --- FIM: CÓDIGO DE INICIALIZAÇÃO DO FIREBASE ---

// Variáveis
let listaDeNumerosSorteados = [];
let numeroMaximo = 100;
let numeroSecreto = gerarNumeroAleatorio();
let tentativas = 1;
let chuteAnteriores = [];


// Função para exibir texto na tela
function exibirTextoNaTela(tag, texto) {
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;
    responsiveVoice.speak(texto, "Brazilian Portuguese Female", { rate: 1.2 });
}

// Função para exibir a mensagem inicial
function exibirMensagemInicial() {
    exibirTextoNaTela("h1", "Jogo do número secreto");
    exibirTextoNaTela("p", "Escolha um número entre 1 e 100");
}

exibirMensagemInicial();

// Função para gerar um número aleatório
function gerarNumeroAleatorio() {
    let numeroEscolhido = parseInt(Math.random() * numeroMaximo + 1);
    let quantidadeDeElementosNaLista = listaDeNumerosSorteados.length;

    if (quantidadeDeElementosNaLista == numeroMaximo) {
        listaDeNumerosSorteados = [];
    }

    if (listaDeNumerosSorteados.includes(numeroEscolhido)) {
        return gerarNumeroAleatorio();
    } else {
        listaDeNumerosSorteados.push(numeroEscolhido);
        return numeroEscolhido;
    }
}

// Função para verificar o número secreto
function verificarChute() {
    let chute = document.querySelector("input").value;

    if (!chute) {
        return;
    }

    if (chute != "" && !chuteAnteriores.includes(chute)) {
        chuteAnteriores.push(chute);
        document.getElementById("historico-chutes").innerHTML = `Seus chutes: ${chuteAnteriores.join(", ")}`;
    }

    if (chute == numeroSecreto) {
        exibirTextoNaTela("h1", "Parabéns! Você acertou!");
        let palavraTentativa = tentativas > 1 ? "tentativas" : "tentativa";
        let textoTentativas = `Você descobriu o número secreto ${numeroSecreto} com ${tentativas} ${palavraTentativa}.`;
        exibirTextoNaTela("p", textoTentativas);
        document.getElementById("reiniciar").removeAttribute("disabled");

        let nomeJogador = prompt("Você entrou para o ranking! Qual é o seu nome?");
        if (nomeJogador) {
            salvarPontuacao(nomeJogador, tentativas);
        }
    } else {
        if (chute < numeroSecreto) {
            exibirTextoNaTela("p", "Tente um número maior!");
        } else {
            exibirTextoNaTela("p", "Tente um número menor!");
        }
        tentativas++;
        limparCampo();
    }
}

// Função para salvar a pontuação no Firestore
async function salvarPontuacao(nome, pontuacao) {
    try {
        const docRef = await rankingCol.add({
            nome: nome,
            pontuacao: pontuacao,
            timestamp: new Date()
        });
        console.log("Pontuação salva com ID: ", docRef.id);
        alert("Pontuação salva com sucesso no ranking global!");
    } catch (e) {
        console.error("Erro ao salvar pontuação: ", e);
        alert("Houve um erro ao salvar sua pontuação.");
    }
}

// Função para exibir o ranking
async function exibirRanking() {
    const lista = document.getElementById("lista-ranking");
    lista.innerHTML = "<li>Carregando ranking...</li>";

    try {
        const querySnapshot = await rankingCol.orderBy("pontuacao").limit(10).get();
        lista.innerHTML = "";

        if (querySnapshot.empty) {
            lista.innerHTML = "<li>Nenhum registro no ranking. Seja o primeiro!</li>";
            return;
        }

        let posicao = 1;
        querySnapshot.forEach((doc) => {
            const jogador = doc.data();
            const item = document.createElement("li");
            item.textContent = `${posicao}º: ${jogador.nome} - ${jogador.pontuacao} tentativas`;
            lista.appendChild(item);
            posicao++;
        });
    } catch (error) {
        console.error("Erro ao buscar ranking: ", error);
        lista.innerHTML = "<li>Erro ao carregar o ranking.</li>";
    }
}

// Funções para abrir e fechar o ranking
function abrirRanking() {
    exibirRanking();
    document.getElementById("modal-ranking").style.display = "flex";
}

function fecharRanking() {
    document.getElementById("modal-ranking").style.display = "none";
}

// Função para limpar o campo de input
function limparCampo() {
    let chute = document.querySelector("input");
    chute.value = "";
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    numeroSecreto = gerarNumeroAleatorio();
    limparCampo();
    tentativas = 1;
    exibirMensagemInicial();
    document.getElementById("reiniciar").setAttribute("disabled", "true");

    chuteAnteriores = [];
    document.getElementById("historico-chutes").innerHTML = "";
}
