// script.js
document.addEventListener('DOMContentLoaded', () => {
    const drawingArea = document.getElementById('drawing-area');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const imageUpload = document.getElementById('imageUpload');
    const saveCompositionButton = document.getElementById('saveCompositionButton');
    const savedCompositionsPanel = document.getElementById('saved-compositions-panel');
    const drawingAreaPlaceholder = document.querySelector('.drawing-area-placeholder');
    const savedCompositionsPlaceholder = document.querySelector('#saved-compositions-panel .empty-panel-message');

    let activeImage = null;
    let offsetX, offsetY;
    let nextImageId = 0; // Para dar IDs únicos às imagens na área de desenho

    // --- Funções Auxiliares ---
    function updateDrawingAreaPlaceholder() {
        if (drawingArea.querySelector('img')) {
            if (drawingAreaPlaceholder) drawingAreaPlaceholder.style.display = 'none';
        } else {
            if (drawingAreaPlaceholder) drawingAreaPlaceholder.style.display = 'block';
        }
    }

    function updateSavedCompositionsPlaceholder() {
        if (savedCompositionsPanel.querySelector('.saved-composition-item, img')) { // Verifica se há itens ou imgs
             if (savedCompositionsPlaceholder) savedCompositionsPlaceholder.style.display = 'none';
        } else {
             if (savedCompositionsPlaceholder) savedCompositionsPlaceholder.style.display = 'block';
        }
    }


    // --- Manipulação de Imagens na Área de Desenho ---
    function addImageToDrawingArea(src, id = `drawn-${nextImageId++}`, x, y, scale) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = "Sigilo";
        img.dataset.id = id; // ID para rastreamento, especialmente para salvar/carregar
        img.style.transform = `scale(${scale || 1})`; // Aplica escala se fornecida
        let currentScale = scale || 1;

        // Posicionamento: centralizado se não especificado, ou na posição dada
        if (x === undefined || y === undefined) {
            const areaRect = drawingArea.getBoundingClientRect();
            // Espera a imagem carregar para ter dimensões corretas para centralizar
            img.onload = () => {
                img.style.left = `${(areaRect.width - img.offsetWidth) / 2}px`;
                img.style.top = `${(areaRect.height - img.offsetHeight) / 2}px`;
            };
        } else {
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
        }
        
        // Evento de pressionar o mouse (para arrastar)
        img.addEventListener('mousedown', (e) => {
            e.preventDefault();
            activeImage = img;
            activeImage.classList.add('dragging');
            const rect = activeImage.getBoundingClientRect();
            // Ajuste para o fato de que getBoundingClientRect() já considera o scale.
            // offsetX e offsetY devem ser em relação às coordenadas *não escaladas* do canto da imagem.
            // No entanto, para o movimento, clientX/Y e rect.left/top já estão no mesmo "espaço" de coordenadas (tela).
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            drawingArea.appendChild(activeImage); // Traz para frente
        });

        // Evento de scroll do mouse (para redimensionar/zoom)
        img.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.target !== img) return;

            const scaleAmount = 0.05; // Ajuste mais fino para zoom
            if (e.deltaY < 0) {
                currentScale += scaleAmount;
            } else {
                currentScale -= scaleAmount;
            }
            currentScale = Math.max(0.1, currentScale); // Limite mínimo de escala
            img.style.transform = `scale(${currentScale})`;
            img.dataset.scale = currentScale; // Armazena a escala no dataset para salvar
        });

        drawingArea.appendChild(img);
        img.dataset.scale = currentScale; // Armazena escala inicial
        updateDrawingAreaPlaceholder();
        return img;
    }

    // Mover imagem ativa
    drawingArea.addEventListener('mousemove', (e) => {
        if (!activeImage) return;
        e.preventDefault();
        const containerRect = drawingArea.getBoundingClientRect();
        let newX = e.clientX - offsetX - containerRect.left;
        let newY = e.clientY - offsetY - containerRect.top;

        // Limites da área de desenho (simplificado, pode ser melhorado)
        const imgWidth = activeImage.offsetWidth * parseFloat(activeImage.dataset.scale || 1);
        const imgHeight = activeImage.offsetHeight * parseFloat(activeImage.dataset.scale || 1);

        newX = Math.max(0, Math.min(newX, containerRect.width - imgWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - imgHeight));
        
        activeImage.style.left = `${newX}px`;
        activeImage.style.top = `${newY}px`;
    });

    // Soltar imagem
    document.addEventListener('mouseup', () => {
        if (activeImage) {
            activeImage.classList.remove('dragging');
        }
        activeImage = null;
    });


    // --- Carregar Sigilos Iniciais na Sidebar ---
    function loadInitialSigils() {
        if (typeof initialSigils !== 'undefined' && Array.isArray(initialSigils)) {
            initialSigils.forEach(sigil => {
                const thumb = document.createElement('img');
                thumb.src = sigil.src;
                thumb.alt = sigil.name;
                thumb.title = `Adicionar ${sigil.name}`;
                thumb.dataset.sigilId = sigil.id; // ID para referência
                thumb.addEventListener('click', () => {
                    addImageToDrawingArea(sigil.src, `initial-${sigil.id}`);
                });
                thumbnailContainer.appendChild(thumb);
            });
        } else {
            console.warn('Array initialSigils não encontrado. Verifique sigilos.js.');
        }
        updateDrawingAreaPlaceholder(); // Atualiza placeholder caso não haja sigilos iniciais
    }

    // --- Upload de Novas Imagens ---
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImageSrc = e.target.result;
                // Adiciona à área de desenho
                const addedImg = addImageToDrawingArea(newImageSrc, `uploaded-${nextImageId++}`);
                
                // Opcional: Adicionar miniatura do upload à sidebar "Meus Sigilos"
                const thumb = document.createElement('img');
                thumb.src = newImageSrc;
                thumb.alt = "Sigilo Carregado";
                thumb.title = "Adicionar sigilo carregado";
                thumb.addEventListener('click', () => {
                    // Re-adiciona a imagem à área de desenho. Poderia ser uma cópia.
                    addImageToDrawingArea(newImageSrc, `uploaded-${nextImageId++}`);
                });
                thumbnailContainer.appendChild(thumb);

            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc).');
        }
        imageUpload.value = ''; // Limpa para permitir carregar o mesmo arquivo
    });

    // --- Salvar e Carregar Composições (usando localStorage) ---
    const SAVED_COMPOSITIONS_KEY = 'sigilEditorCompositions';

    function saveComposition() {
        const compositionName = prompt("Digite um nome para esta composição:", `Composição ${Date.now()}`);
        if (!compositionName) return; // Usuário cancelou

        const imagesOnCanvas = Array.from(drawingArea.querySelectorAll('img'));
        const compositionData = {
            name: compositionName,
            timestamp: Date.now(),
            sigils: imagesOnCanvas.map(img => ({
                id: img.dataset.id || `img-${Date.now()}`, // Garante um ID
                src: img.src,
                x: parseFloat(img.style.left),
                y: parseFloat(img.style.top),
                scale: parseFloat(img.dataset.scale || 1), // Usa dataset.scale
                zIndex: img.style.zIndex || 0
            }))
        };

        const savedCompositions = JSON.parse(localStorage.getItem(SAVED_COMPOSITIONS_KEY)) || [];
        savedCompositions.push(compositionData);
        localStorage.setItem(SAVED_COMPOSITIONS_KEY, JSON.stringify(savedCompositions));

        addCompositionToPanel(compositionData);
        alert(`Composição "${compositionName}" salva!`);
    }

    function addCompositionToPanel(compositionData, atStart = true) {
        const item = document.createElement('div');
        item.classList.add('saved-composition-item');
        item.textContent = compositionData.name.substring(0, 20) + (compositionData.name.length > 20 ? '...' : ''); // Nome curto
        item.title = `${compositionData.name} (Salva em: ${new Date(compositionData.timestamp).toLocaleDateString()})`;
        
        // Adiciona uma pequena pré-visualização da primeira imagem, se houver
        if (compositionData.sigils && compositionData.sigils.length > 0) {
            const previewImg = document.createElement('img');
            previewImg.src = compositionData.sigils[0].src;
            previewImg.style.width = "30px";
            previewImg.style.height = "30px";
            previewImg.style.objectFit = "cover";
            previewImg.style.marginRight = "5px";
            previewImg.style.opacity = "0.7";
            item.prepend(previewImg); // Adiciona no início do div
        }


        item.addEventListener('click', () => {
            loadComposition(compositionData);
        });

        if (atStart && savedCompositionsPanel.firstChild) {
            savedCompositionsPanel.insertBefore(item, savedCompositionsPanel.firstChild);
        } else {
            savedCompositionsPanel.appendChild(item);
        }
        updateSavedCompositionsPlaceholder();
    }

    function loadComposition(compositionData) {
        // Limpa a área de desenho atual
        drawingArea.innerHTML = ''; 
        // Se você tiver um placeholder, precisa readicioná-lo ou controlá-lo
        if (drawingAreaPlaceholder) drawingArea.appendChild(drawingAreaPlaceholder);


        compositionData.sigils.forEach(sigilData => {
            const img = addImageToDrawingArea(sigilData.src, sigilData.id, sigilData.x, sigilData.y, sigilData.scale);
            img.style.zIndex = sigilData.zIndex;
        });
        updateDrawingAreaPlaceholder();
        alert(`Composição "${compositionData.name}" carregada.`);
    }

    function loadSavedCompositionsFromStorage() {
        const savedCompositions = JSON.parse(localStorage.getItem(SAVED_COMPOSITIONS_KEY)) || [];
        savedCompositions.sort((a,b) => b.timestamp - a.timestamp); // Mais recentes primeiro
        savedCompositions.forEach(compData => addCompositionToPanel(compData, false)); // Adiciona sem ser no início
        updateSavedCompositionsPlaceholder();
    }

    saveCompositionButton.addEventListener('click', saveComposition);
    
    // --- Inicialização ---
    loadInitialSigils();
    loadSavedCompositionsFromStorage();
    updateDrawingAreaPlaceholder(); // Chamada inicial
    updateSavedCompositionsPlaceholder(); // Chamada inicial

    // Opcional: Exportar como PNG (requer html2canvas ou similar para uma boa implementação)
    // Exemplo de como seria com html2canvas (NÃO FUNCIONARÁ SEM A BIBLIOTECA):
    /*
    const exportPNGButton = document.createElement('button');
    exportPNGButton.textContent = "Exportar como PNG";
    exportPNGButton.classList.add('sidebar-button');
    exportPNGButton.addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert("A biblioteca html2canvas é necessária para exportar como PNG. Adicione-a ao seu projeto.");
            console.warn("html2canvas não está definida. Inclua a biblioteca: <script src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'></script>");
            return;
        }
        html2canvas(drawingArea, {
            backgroundColor: null, // Para fundo transparente se a área for
            logging: true,
            useCORS: true // Tenta carregar imagens de outros domínios
        }).then(canvas => {
            const imageURL = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = imageURL;
            downloadLink.download = `composicao_sigilos_${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }).catch(error => {
            console.error("Erro ao gerar imagem com html2canvas:", error);
            alert("Ocorreu um erro ao tentar exportar a imagem.");
        });
    });
    // Adiciona o botão à seção de ferramentas na sidebar
    const toolsSection = imageUpload.closest('.sidebar-section'); // Encontra a seção de ferramentas
    if (toolsSection) {
        toolsSection.appendChild(exportPNGButton);
    }
    */
});
