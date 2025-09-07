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

    if (chute != '' && !chuteAnteriores.includes(chute)) {
        chuteAnteriores.push(chute);
        let palavraChutes = chuteAnteriores.length > 1 ? 'Seus chutes' : 'Seu chute';
        let textoChutes = `${palavraChutes}: ${chuteAnteriores.join(', ')}`;
        let historicoChutes = document.getElementById('historico-chutes');
        historicoChutes.innerHTML = textoChutes;
    }

    if (chute == numeroSecreto) {
        exibirTextoNaTela('h1', 'Parabéns! Você acertou!');        
        let palavraTentativa = tentativas > 1 ? 'tentativas' : 'tentativa';
        let textoTentativas = `Você descobriu o número secreto ${numeroSecreto} com ${tentativas} ${palavraTentativa}.`;
        exibirTextoNaTela('p', textoTentativas);
        document.getElementById('reiniciar').removeAttribute('disabled');
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

