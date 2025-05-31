// sigilos.js

// Este array contém os caminhos para as imagens dos sigilos iniciais.
// Substitua os URLs de placeholder pelos caminhos para seus arquivos de imagem locais,
// por exemplo: "assets/sigils/meu_sigilo_1.png"
// Certifique-se de que as imagens existam nesses caminhos.

const initialSigils = [
    { id: "sigil_001", name: "Sigilo Alfa", src: "https://placehold.co/150x150/1a1a2e/e0e0e0?text=Alfa&font=lora" },
    { id: "sigil_002", name: "Arcano Beta", src: "https://placehold.co/120x120/1a1a2e/c9a2f0?text=Beta&font=lora" },
    { id: "sigil_003", name: "Poder Gama", src: "https://placehold.co/180x180/1a1a2e/9370db?text=Gama&font=lora" },
    { id: "sigil_004", name: "Elixir Delta", src: "https://placehold.co/100x150/1a1a2e/e0e0e0?text=Delta&font=lora" },
    { id: "sigil_005", name: "Chave Ômega", src: "https://placehold.co/150x100/1a1a2e/c9a2f0?text=Ômega&font=lora" },
    // Adicione mais objetos de sigilos aqui, cada um com id, name, e src
];

// Se você não estiver usando módulos ES6 (como no exemplo atual do index.html),
// esta variável 'initialSigils' estará disponível globalmente para script.js,
// desde que sigilos.js seja carregado ANTES de script.js.
