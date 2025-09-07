// app.js

// --- INÍCIO: CÓDIGO DE INICIALIZAÇÃO DO FIREBASE ---
// Importante: estas funções vêm dos scripts que adicionamos no HTML.
// O "defer" no seu <script src="app.js" defer> garante que isso funcione.
const { initializeApp } = firebase.app;
const { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } = firebase.firestore;

// Inicializa o Firebase com as credenciais do seu projeto
const firebaseConfig = {
        apiKey: "AIzaSyAT0xzVpU1Rh29m5QFUf0D9ob4tTsloIe8",
        authDomain: "jogo-numero-secreto-ranking.firebaseapp.com",
        projectId: "jogo-numero-secreto-ranking",
        storageBucket: "jogo-numero-secreto-ranking.firebasestorage.app",
        messagingSenderId: "484416436213",
        appId: "1:484416436213:web:a1f9dbea9529f44cde12bc"
    };

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rankingCol = collection(db, 'ranking'); // 'ranking' será o nome da nossa "tabela"

// --- FIM: CÓDIGO DE INICIALIZAÇÃO DO FIREBASE ---


//Variaveis
let listaDeNumerosSorteados = [];
let numeroMaximo = 100;
let numeroSecreto = gerarNumeroAleatorio();
let tentativas = 1;
let chuteAnteriores = [];


// Função para exibir texto na tela
function exibirTextoNaTela(tag, texto) {
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;
    responsiveVoice.speak(texto, 'Brazilian Portuguese Female', {rate:1.2});
}

// Função para exibir a mensagem inicial
function exibirMensagemInicial() {
    exibirTextoNaTela('h1', 'Jogo do número secreto');
    exibirTextoNaTela('p', 'Escolha um número entre 1 e 100');
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
        console.log(listaDeNumerosSorteados);
        return numeroEscolhido;
    }
}

// Função para verificar o número secreto na tela
function verificarChute() {
    let chute = document.querySelector('input').value;
    console.log(chute == numeroSecreto);

    if(!chute) {
        return;
    }

    if (chute != '' && !chuteAnteriores.includes(chute)) {
        chuteAnteriores.push(chute);
        let palavraChutes = chuteAnteriores.length > 1 ? 'Seus chutes' : 'Seu chute';
        let textoChutes = `${palavraChutes}: ${chuteAnteriores.join(', ')}`;
        let historicoChutes = document.getElementById('historico-chutes');
        historicoChutes.innerHTML = textoChutes; // Atualiza o histórico de chutes na tela
    }

    if (chute == numeroSecreto) {
        exibirTextoNaTela('h1', 'Parabéns! Você acertou!');        
        let palavraTentativa = tentativas > 1 ? 'tentativas' : 'tentativa';
        let textoTentativas = `Você descobriu o número secreto ${numeroSecreto} com ${tentativas} ${palavraTentativa}.`;
        exibirTextoNaTela('p', textoTentativas); // Atualiza o parágrafo com o número de tentativas
        document.getElementById('reiniciar').removeAttribute('disabled'); // Habilita o botão de reiniciar

        let nomeJogador = prompt('Você entrou para o ranking! Qual é o seu nome?'); // Solicita o nome do jogador
        if (nomeJogador) {
            salvarPontuacao(nomeJogador, tentativas); // Salva a pontuação no Firestore
        }
    } else {
        if (chute < numeroSecreto) {
            exibirTextoNaTela('p', 'Tente um número maior!');
        } else {
            exibirTextoNaTela('p', 'Tente um número menor!');
        }
        tentativas++;
        limparCampo();
    }
}

// Função para salvar a pontuação no Firestore
async function salvarPontuacao(nome, pontuacao) {
    try {
        const docRef = await addDoc(rankingCol, {
            nome: nome,
            pontuacao: pontuacao,
            timesTamp: new Date() // Guarda a data e hora do registro
        });
        console.log("Pontuação salva com ID: ", docRef.id);
        alert('Pontuação salva com sucesso!');
    } catch (e) {
        console.error("Erro ao salvar pontuação: ", e);
    }
}

// Função para exibir o ranking
async function exibirRanking() {
    const lista = document.getElementById('ranking-lista');
    lista.innerHTML = '<li>Carregando ranking...</li>'; // Limpa a lista antes de exibir o ranking atualizado

    const rankingQuery = query(rankingCol, orderBy('pontuacao', 'asc'), limit(10));

    try {
        const querySnapshot = await getDocs(rankingQuery);
        lista.innerHTML = ''; // Limpa a lista antes de exibir o ranking atualizado

        if (querySnapshot.empty) {
            lista.innerHTML = '<li>Nenhum registro no ranking.</li>'; // Se não houver registros, exibe uma mensagem
            return;
        }
        let posicao = 1;
        querySnapshot.forEach((doc) => { 
            const jogador = doc.data();
            const item = document.createElement('li');
            item.textContent = `${posicao}º - ${jogador.nome}: ${jogador.pontuacao} ${jogador.pontuacao > 1 ? 'tentativas' : 'tentativa'}`;
            lista.appendChild(item);
            posicao++;
        }); // Incrementa a posição para o próximo jogador o bloco de codigo acima
    } catch (error) {
        console.error("Erro ao buscar ranking: ", error);
        lista.innerHTML = '<li>Erro ao carregar o ranking.</li>'; // Exibe uma mensagem de erro na lista
    }
}

// Função para mostrar o modal de ranking
function mostrarRanking() {
    exibirRanking();
    document.getElementById('modal-ranking').style.display = 'flex';
}

// Função para fechar o modal de ranking
function fecharRanking() {
    document.getElementById('modal-ranking').style.display = 'none';

}

// Limpar o campo de entrada do número do chute
function limparCampo() {
    chute = document.querySelector('input');
    chute.value = '';
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    numeroSecreto = gerarNumeroAleatorio();
    limparCampo();
    tentativas = 1;
    exibirMensagemInicial();
    document.getElementById('reiniciar').setAttribute('disabled', 'true');

    chuteAnteriores = [];
    let historicoChutes = document.getElementById('historico-chutes');
    historicoChutes.innerHTML = '';
}

