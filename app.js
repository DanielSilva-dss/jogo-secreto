// Variáveis globais
let listaDeNumerosSorteados = [];
let numeroMaximo = 100;
let numeroSecreto;
let tentativas = 1;
let chuteAnteriores = [];
let db;
let rankingCol;

// Inicialização do Firebase
function inicializarFirebase() {
    try {
        console.log("=== DEBUG AVANÇADO FIREBASE ===");
        console.log("Firebase global:", typeof firebase);
        console.log("Firestore global:", typeof firebase.firestore);
        console.log("Configuração completa:", window.firebaseConfig);
        console.log("Tem apiKey?", !!window.firebaseConfig?.apiKey);
        console.log("Tem projectId?", !!window.firebaseConfig?.projectId);
        console.log("===============================");
        
        console.log("Iniciando Firebase...");
        
        // 🎯 VERIFICA se a configuração foi carregada
        if (!window.firebaseConfig || !window.firebaseConfig.apiKey) {
            console.warn("Configuração do Firebase não encontrada. Modo offline ativado.");
            db = null;
            rankingCol = null;
            return;
        }

        console.log("Configuração encontrada:", window.firebaseConfig.projectId);
        
        // Verifica se o Firebase já foi inicializado (compatível com v12)
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
            console.log("Firebase inicializado com sucesso!");
        } else {
            // Se já foi inicializado, usa a instância existente
            console.log("Firebase já estava inicializado");
        }
        
        db = firebase.firestore();
        rankingCol = db.collection("ranking");
        console.log("Firestore configurado com sucesso!");
        
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
        console.warn("Modo offline ativado devido ao erro.");
        
        db = null;
        rankingCol = null;
    }
}

// Configuração do ResponsiveVoice
function configurarResponsiveVoice() {
    try {
        responsiveVoice.setDefaultVoice("Brazilian Portuguese Female");
        responsiveVoice.enableWindowClickHook();
    } catch (error) {
        console.error("Erro ao configurar ResponsiveVoice:", error);
    }
}

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

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // inicializamos o número secreto depois que a função está declarada
    numeroSecreto = gerarNumeroAleatorio();
    
    inicializarFirebase();
    configurarResponsiveVoice();
    exibirMensagemInicial();
});

// Função para exibir texto na tela
function exibirTextoNaTela(tag, texto) {
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;
    
    try {
        responsiveVoice.speak(texto, "Brazilian Portuguese Female", { rate: 1.2 });
    } catch (error) {
        console.error("Erro ao usar voz:", error);
    }
}

// Função para exibir a mensagem inicial
function exibirMensagemInicial() {
    exibirTextoNaTela("h1", "Jogo do número secreto");
    exibirTextoNaTela("p", "Escolha um número entre 1 e 100");
}

// Função para verificar o número secreto
function verificarChute() {
    let chute = document.getElementById("chute-input").value;

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
    // Se o Firebase não estiver disponível, não tenta salvar
    if (!db || !rankingCol) {
        alert("Firebase não inicializado. Pontuação não salva. Modo offline ativo.");
        return;
    } 
    
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
        alert("Houve um erro ao salvar sua pontuação. Modo offline ativo.");
    }
}

// Função para exibir o ranking
async function exibirRanking() {
    const lista = document.getElementById("lista-ranking");
    lista.innerHTML = "<li>Carregando ranking...</li>";

    // Se o Firebase não estiver disponível
    if (!db || !rankingCol) {
        lista.innerHTML = "<li>Firebase não inicializado. Ranking indisponível. Modo offline ativo.</li>";
        return;
    }

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
        lista.innerHTML = "<li>Erro ao carregar o ranking. Modo offline ativo.</li>";
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