// Variables globales para almacenar los datos del dólar
let dollarData = null;
let dollarMap = null;

// Cargar los datos del dólar
function loadDollarData() {
    console.log('Iniciando carga de datos del dólar...');
    return fetch('dolarblue-data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Datos del dólar cargados exitosamente');
            dollarData = data;
            dollarMap = createDollarMap(dollarData);
            console.log('Número de entradas de dólar: ' + dollarData.length);
            populateDateSelectors(); // Llamar aquí una sola vez
        })
        .catch(error => {
            console.error('Error al cargar los datos del dólar:', error);
            displayDollarError('Error al cargar los datos del dólar. Por favor, recargue la página.');
        });
}

// Crear un mapa para búsqueda rápida de valores del dólar
function createDollarMap(data) {
    const map = {};
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        map[entry.year + '-' + entry.month] = entry.valor;
    }
    return map;
}

// Poblar los selectores de fecha para la sección del dólar
function populateDateSelectors() {
    const years = [...new Set(dollarData.map(entry => entry.year))].sort((a, b) => a - b);
    const months = [
        { value: 1, text: "Enero" }, { value: 2, text: "Febrero" }, { value: 3, text: "Marzo" },
        { value: 4, text: "Abril" }, { value: 5, text: "Mayo" }, { value: 6, text: "Junio" },
        { value: 7, text: "Julio" }, { value: 8, text: "Agosto" }, { value: 9, text: "Septiembre" },
        { value: 10, text: "Octubre" }, { value: 11, text: "Noviembre" }, { value: 12, text: "Diciembre" }
    ];

    // Obtener la última fecha disponible
    const lastEntry = dollarData[dollarData.length - 1];
    const lastYear = lastEntry.year;
    const lastMonth = lastEntry.month;

    populateSelect(document.getElementById('dollarStartYear'), years.map(year => ({ value: year, text: year })), years[0]);
    populateSelect(document.getElementById('dollarEndYear'), years.map(year => ({ value: year, text: year })), lastYear);
    populateSelect(document.getElementById('dollarStartMonth'), months, 1);
    populateSelect(document.getElementById('dollarEndMonth'), months, lastMonth);
}

// Función para poblar un selector
function populateSelect(select, options, defaultValue) {
    // Limpiar opciones existentes
    select.innerHTML = '';
    
    for (let i = 0; i < options.length; i++) {
        const opt = document.createElement('option');
        opt.value = options[i].value;
        opt.textContent = options[i].text;
        select.appendChild(opt);
    }
    select.value = defaultValue;
}

// Calcular la evolución del peso respecto al dólar
function calculatePesoDollarEvolution() {
    const pesoAmount = parseFloat(document.getElementById('pesoAmount').value);
    const startYear = parseInt(document.getElementById('dollarStartYear').value);
    const startMonth = parseInt(document.getElementById('dollarStartMonth').value);
    const endYear = parseInt(document.getElementById('dollarEndYear').value);
    const endMonth = parseInt(document.getElementById('dollarEndMonth').value);

    // Si algún campo está vacío, simplemente retorna sin hacer cálculos ni mostrar errores
    if (isNaN(pesoAmount) || !startYear || !startMonth || !endYear || !endMonth) {
        return;
    }

    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    if (startDate > endDate) {
        displayDollarError('La fecha de inicio debe ser anterior o igual a la fecha final.');
        return;
    }

    const startDollarValue = dollarMap[`${startYear}-${startMonth}`];
    const endDollarValue = dollarMap[`${endYear}-${endMonth}`];

    if (!startDollarValue || !endDollarValue) {
        displayDollarError('No se encontraron datos para las fechas seleccionadas.');
        return;
    }

    const startUsdEquivalent = pesoAmount / startDollarValue;
    const endUsdEquivalent = pesoAmount / endDollarValue;
    const percentageChange = ((endUsdEquivalent - startUsdEquivalent) / startUsdEquivalent) * 100;

    document.getElementById('startUsdEquivalent').textContent = `$${startUsdEquivalent.toFixed(2)}`;
    document.getElementById('endUsdEquivalent').textContent = `$${endUsdEquivalent.toFixed(2)}`;
    document.getElementById('exchangeVariation').textContent = `${percentageChange.toFixed(2)}%`;
}

// Mostrar errores en la UI para la sección del dólar
function displayDollarError(message) {
    document.getElementById('startUsdEquivalent').textContent = '';
    document.getElementById('endUsdEquivalent').textContent = '';
    document.getElementById('exchangeVariation').textContent = message;
}

// Event listeners para la sección del dólar
document.getElementById('pesoAmount').addEventListener('input', calculatePesoDollarEvolution);
document.getElementById('dollarStartYear').addEventListener('change', calculatePesoDollarEvolution);
document.getElementById('dollarStartMonth').addEventListener('change', calculatePesoDollarEvolution);
document.getElementById('dollarEndYear').addEventListener('change', calculatePesoDollarEvolution);
document.getElementById('dollarEndMonth').addEventListener('change', calculatePesoDollarEvolution);

// Cargar datos y realizar cálculos iniciales
window.addEventListener('load', () => {
    console.log('Página cargada. Iniciando carga de datos del dólar...');
    loadDollarData().then(() => {
        calculatePesoDollarEvolution();
    });
});