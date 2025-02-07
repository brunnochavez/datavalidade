let products = []; // Lista de produtos carregada do Excel
let itemList = []; // Lista de itens adicionados pelo usuário
let scannerActive = false;

// 📂 Carregar arquivo Excel
document.getElementById('excelFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            products = data.slice(1).map(row => ({
                barras: row[0]?.toString().trim(),
                descricao: row[1]?.toString().trim(),
                preco: row[2]?.toString().trim()
            })).filter(item => item.barras);
        };
        reader.readAsBinaryString(file);
    }
});

// 🔍 Pesquisar produto e adicionar à lista
function searchProduct() {
    const barcode = document.getElementById('barcodeInput').value.trim();
    const quantity = document.getElementById('quantityInput').value.trim();
    const expiryDate = document.getElementById('expiryDateInput').value.trim();

    if (!barcode || !quantity || !expiryDate) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const product = products.find(p => p.barras === barcode);
    
    if (product) {
        // Adicionar o item à lista
        itemList.push({
            codigo: barcode,
            descricao: product.descricao,
            quantidade: quantity,
            validade: expiryDate
        });

        // Atualizar a exibição
        updateItemListDisplay();
        clearSearch();
    } else {
        alert("Produto não encontrado.");
    }
}

// 🗒️ Atualizar a exibição da lista de itens
function updateItemListDisplay() {
    const itemListDiv = document.getElementById('itemList');
    itemListDiv.innerHTML = "";

    itemList.forEach((item, index) => {
        itemListDiv.innerHTML += `
            <div class="item">
                <p><strong>Código:</strong> ${item.codigo}</p>
                <p><strong>Produto:</strong> ${item.descricao}</p>
                <p><strong>Quantidade:</strong> ${item.quantidade}</p>
                <p><strong>Validade:</strong> ${item.validade}</p>
                <button onclick="removeItem(${index})">❌ Remover</button>
            </div>
        `;
    });
}

// ❌ Remover item da lista
function removeItem(index) {
    itemList.splice(index, 1); // Remove o item da lista
    updateItemListDisplay(); // Atualiza a exibição
}

// 🧹 Limpar campos de busca
function clearSearch() {
    document.getElementById('barcodeInput').value = "";
    document.getElementById('quantityInput').value = "";
    document.getElementById('expiryDateInput').value = "";
}

// 📸 Função para Escanear Código de Barras
function startScanner() {
    clearSearch();

    if (scannerActive) {
        return;
    }

    scannerActive = true;

    const scannerContainer = document.createElement('div');
    scannerContainer.id = "scanner-container";
    scannerContainer.innerHTML = `
        <div id="interactive" class="scanner-view"></div>
        <div class="scanner-buttons">
            <button class="secondary" onclick="stopScanner()">Fechar Câmera</button>
        </div>
    `;

    document.body.appendChild(scannerContainer);

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#interactive"),
            constraints: {
                facingMode: "environment", // Usar a câmera traseira
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        },
        decoder: {
            readers: ["ean_reader"], // Focar apenas no leitor de EAN-13
        },
        locator: {
            halfSample: true,
            patchSize: "medium", // Tamanho do patch para detecção
        },
        locate: true,
        numOfWorkers: 4, // Usar mais workers para melhorar a performance
        frequency: 10, // Verificar a cada 10ms
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Erro ao inicializar a câmera. Verifique as permissões.");
            stopScanner();
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;

        // Verificar se o código é um EAN-13 válido (13 dígitos)
        if (code.length === 13) {
            // Reproduzir som de "bip"
            const bipSound = document.getElementById("bipSound");
            bipSound.play();

            // Preencher o campo de código de barras
            document.getElementById("barcodeInput").value = code;
            stopScanner();
        }
    });
}

// 🛑 Parar o escaneamento
function stopScanner() {
    Quagga.stop();
    const scannerContainer = document.getElementById("scanner-container");
    if (scannerContainer) {
        document.body.removeChild(scannerContainer);
    }
    scannerActive = false;
}

// 💾 Salvar Dados em um arquivo .txt
function saveData() {
    if (itemList.length === 0) {
        alert("Nenhum item foi adicionado à lista.");
        return;
    }

    let data = "Itens Adicionados:\n\n";
    itemList.forEach((item, index) => {
        data += `Item ${index + 1}:\n`;
        data += `Código de Barras: ${item.codigo}\n`;
        data += `Produto: ${item.descricao}\n`;
        data += `Quantidade: ${item.quantidade}\n`;
        data += `Validade: ${item.validade}\n\n`;
    });

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista_produtos.txt';
    a.click();

    URL.revokeObjectURL(url);
}

// 📤 Exportar para WhatsApp
function exportData() {
    if (itemList.length === 0) {
        alert("Nenhum item foi adicionado à lista.");
        return;
    }

    let data = "Itens Adicionados:\n\n";
    itemList.forEach((item, index) => {
        data += `Item ${index + 1}:\n`;
        data += `Código de Barras: ${item.codigo}\n`;
        data += `Produto: ${item.descricao}\n`;
        data += `Quantidade: ${item.quantidade}\n`;
        data += `Validade: ${item.validade}\n\n`;
    });

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(data)}`;
    window.open(whatsappUrl, '_blank');
}
