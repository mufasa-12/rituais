// sigilos.js

// Este array contém os caminhos para as imagens dos sigilos iniciais.
// Substitua os URLs de placeholder pelos caminhos para seus arquivos de imagem locais,
// por exemplo: "assets/sigils/meu_sigilo_1.png"
// Certifique-se de que as imagens existam nesses caminhos.

const initialSigils = [
    { id: "sigil_001", name: "Bola", src: "bola.png" },
    { id: "sigil_002", name: "Circulo", src: "circulo.png" },
    { id: "sigil_003", name: "garra", src: "garra.png" },
    { id: "sigil_004", name: "linhas", src: "linhas.png" },
    { id: "sigil_005", name: "Meio Circulo", src: "meio circulo.png" },
    { id: "sigil_006", name: "Quadrado", src: "quadrado.png" },
    // Adicione mais objetos de sigilos aqui, cada um com id, name, e src
];

// Se você não estiver usando módulos ES6 (como no exemplo atual do index.html),
// esta variável 'initialSigils' estará disponível globalmente para script.js,
// desde que sigilos.js seja carregado ANTES de script.js.
