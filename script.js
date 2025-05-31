// script.js
document.addEventListener('DOMContentLoaded', () => {
    const drawingArea = document.getElementById('drawing-area');
    const imageUpload = document.getElementById('imageUpload');

    let activeImage = null; // Imagem atualmente sendo arrastada ou redimensionada
    let offsetX, offsetY; // Para calcular a posição do mouse relativa à imagem

    // Função para criar e adicionar uma imagem interativa à área de desenho
    function addInteractiveImage(src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = "Sigilo"; // Adiciona um texto alternativo para acessibilidade

        // Define um tamanho inicial e posição aleatória para diversificar
        const initialSize = Math.random() * 100 + 80; // Tamanho entre 80px e 180px
        img.style.width = `${initialSize}px`;
        img.style.height = 'auto'; // Mantém a proporção

        // Posicionamento inicial aleatório dentro da área de desenho
        // Garante que a imagem não comece totalmente fora da área visível
        const areaRect = drawingArea.getBoundingClientRect();
        const maxLeft = areaRect.width - initialSize;
        const maxHeight = areaRect.height - (initialSize * (img.naturalHeight / img.naturalWidth || 1)); // Considera proporção

        img.style.left = `${Math.random() * Math.max(0, maxLeft)}px`;
        img.style.top = `${Math.random() * Math.max(0, maxHeight)}px`;
        
        let currentScale = 1; // Escala inicial para zoom

        // Evento de pressionar o mouse (para arrastar)
        img.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Previne o comportamento padrão de arrastar imagem
            activeImage = img;
            activeImage.classList.add('dragging'); // Adiciona classe para feedback visual
            
            // Calcula o offset do mouse em relação ao canto superior esquerdo da imagem
            // Usa getBoundingClientRect para posições precisas, mesmo com transformações
            const rect = activeImage.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            drawingArea.appendChild(activeImage); // Traz a imagem para o topo da pilha
        });

        // Evento de scroll do mouse (para redimensionar/zoom)
        img.addEventListener('wheel', (e) => {
            e.preventDefault(); // Previne o scroll da página
            if (activeImage !== img && e.target !== img) return; // Aplica zoom apenas na imagem sob o mouse

            const scaleAmount = 0.1; // Quanto aumentar/diminuir a escala
            if (e.deltaY < 0) {
                // Scroll para cima (zoom in)
                currentScale += scaleAmount;
            } else {
                // Scroll para baixo (zoom out)
                currentScale -= scaleAmount;
            }
            // Limita a escala mínima para evitar que a imagem desapareça ou fique negativa
            currentScale = Math.max(0.1, currentScale); 
            
            img.style.transform = `scale(${currentScale})`;
        });

        drawingArea.appendChild(img);
    }

    // Carregar sigilos iniciais definidos em sigilos.js
    if (typeof initialSigils !== 'undefined' && Array.isArray(initialSigils)) {
        initialSigils.forEach(src => addInteractiveImage(src));
    } else {
        console.warn('Array initialSigils não encontrado ou não é um array. Verifique sigilos.js.');
    }

    // Evento de soltar o mouse (em qualquer lugar da área de desenho ou do documento)
    document.addEventListener('mouseup', () => {
        if (activeImage) {
            activeImage.classList.remove('dragging'); // Remove classe de feedback
        }
        activeImage = null;
    });

    // Evento de mover o mouse (em qualquer lugar da área de desenho)
    drawingArea.addEventListener('mousemove', (e) => {
        if (!activeImage) return;
        e.preventDefault();

        // Posição do container (drawingArea)
        const containerRect = drawingArea.getBoundingClientRect();

        // Calcula a nova posição da imagem
        // Subtrai o offset do mouse e a posição do container
        let newX = e.clientX - offsetX - containerRect.left;
        let newY = e.clientY - offsetY - containerRect.top;

        // Limita o movimento da imagem dentro da drawingArea
        const imgRect = activeImage.getBoundingClientRect(); // Dimensões atuais da imagem (considerando scale)
        const imgWidth = imgRect.width;
        const imgHeight = imgRect.height;

        newX = Math.max(0, Math.min(newX, containerRect.width - imgWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - imgHeight));
        
        activeImage.style.left = `${newX}px`;
        activeImage.style.top = `${newY}px`;
    });
    
    // Lidar com o upload de novas imagens
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addInteractiveImage(e.target.result);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            // Idealmente, mostrar uma mensagem mais amigável ao usuário
            console.warn('Por favor, selecione um arquivo de imagem válido.');
            // Exemplo de como você poderia mostrar uma mensagem (requer um elemento no HTML):
            // const feedbackMessage = document.getElementById('uploadFeedback');
            // if (feedbackMessage) feedbackMessage.textContent = 'Arquivo inválido. Use PNG, JPG, etc.';
        }
        imageUpload.value = ''; // Limpa o input para permitir carregar o mesmo arquivo novamente
    });

    // Opcional: Lidar com o mouse saindo da área de desenho enquanto arrasta
    drawingArea.addEventListener('mouseleave', () => {
        // Se você quiser que o arraste pare se o mouse sair da área:
        // if (activeImage) {
        //     activeImage.classList.remove('dragging');
        // }
        // activeImage = null;
        // No entanto, o mouseup no document já deve cuidar disso.
    });

});
