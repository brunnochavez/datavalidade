const STORAGE_KEY = 'productData';

// Função para carregar os dados do localStorage
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Função para salvar os dados no localStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Função para adicionar um novo produto
function addProduct(product) {
    const data = loadData();
    data.push(product);
    saveData(data);
}

// Função para remover um produto pelo código de barras
function removeProduct(barcode) {
    let data = loadData();
    data = data.filter(product => product.barras !== barcode);
    saveData(data);
}

// Função para buscar um produto pelo código de barras
function findProduct(barcode) {
    const data = loadData();
    return data.find(product => product.barras === barcode);
}

// Função para exportar os dados para um arquivo JSON
function exportToJsonFile() {
    const data = loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Função para importar dados de um arquivo JSON
function importFromJsonFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const data = JSON.parse(event.target.result);
        saveData(data);
        alert('Dados importados com sucesso!');
    };
    reader.readAsText(file);
}

// Evento para importar arquivo JSON
document.getElementById('jsonFileInput')?.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        importFromJsonFile(file);
    }
});
