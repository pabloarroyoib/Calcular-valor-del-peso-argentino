// Variables globales para almacenar los datos del dólar oficial
let dollarOfficialData = null;
let dollarOfficialMap = null;

// Cargar los datos del dólar oficial
function loadDollarOfficialData() {
    console.log('Iniciando carga de datos del dólar oficial...');
    return fetch('dolaroficial-data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Datos del dólar oficial cargados exitosamente');
            dollarOfficialData = data;
            dollarOfficialMap = createDollarOfficialMap(dollarOfficialData);
            console.log('Número de entradas de dólar oficial: ' + dollarOfficialData.length);
            populateDateSelectorsOfficial();
        })
        .catch(error => {
            console.error('Error al cargar los datos del dólar oficial:', error);
            displayDollarOfficialError('Error al cargar los datos del dólar oficial. Por favor, recargue la página.');
        });
}

// Crear un mapa para búsqueda rápida de valores del dólar oficial
function createDollarOfficialMap(data) {
    const map = {};
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        map[entry.year + '-' + entry.month] = entry.valor;
    }
    return map;
}

// Poblar los selectores de fecha para la sección del dólar oficial
function populateDateSelectorsOfficial() {
    const years = [...new Set(dollarOfficialData.map(entry => entry.year))].sort((a, b) => a - b);
    const months = [
        { value: 1, text: "Enero" }, { value: 2, text: "Febrero" }, { value: 3, text: "Marzo" },
        { value: 4, text: "Abril" }, { value: 5, text: "Mayo" }, { value: 6, text: "Junio" },
        { value: 7, text: "Julio" }, { value: 8, text: "Agosto" }, { value: 9, text: "Septiembre" },
        { value: 10, text: "Octubre" }, { value: 11, text: "Noviembre" }, { value: 12, text: "Diciembre" }
    ];

    // Obtener la última fecha disponible
    const lastEntry = dollarOfficialData[dollarOfficialData.length - 1];
    const lastYear = lastEntry.year;
    const lastMonth = lastEntry.month;

    populateSelect(document.getElementById('dollarStartYearOfficial'), years.map(year => ({ value: year, text: year })), years[0]);
    populateSelect(document.getElementById('dollarEndYearOfficial'), years.map(year => ({ value: year, text: year })), lastYear);
    populateSelect(document.getElementById('dollarStartMonthOfficial'), months, 1);
    populateSelect(document.getElementById('dollarEndMonthOfficial'), months, lastMonth);
}

// Función para poblar un selector (asumiendo que esta función ya existe en el archivo principal)
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

// Calcular la evolución del peso respecto al dólar oficial
function calculatePesoDollarOfficialEvolution() {
    const pesoAmount = parseFloat(document.getElementById('pesoAmountOfficial').value);
    const startYear = parseInt(document.getElementById('dollarStartYearOfficial').value);
    const startMonth = parseInt(document.getElementById('dollarStartMonthOfficial').value);
    const endYear = parseInt(document.getElementById('dollarEndYearOfficial').value);
    const endMonth = parseInt(document.getElementById('dollarEndMonthOfficial').value);

    // Verificar si el valor ingresado es 0 o negativo
    if (pesoAmount <= 0) {
        displayDollarOfficialError('El valor ingresado debe ser mayor que 0');
        return;
    }

    // Si algún campo está vacío, simplemente retorna sin hacer cálculos ni mostrar errores
    if (isNaN(pesoAmount) || !startYear || !startMonth || !endYear || !endMonth) {
        return;
    }

    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    if (startDate > endDate) {
        displayDollarOfficialError('La fecha de inicio debe ser anterior o igual a la fecha final.');
        return;
    }

    const startDollarValue = dollarOfficialMap[`${startYear}-${startMonth}`];
    const endDollarValue = dollarOfficialMap[`${endYear}-${endMonth}`];

    if (!startDollarValue || !endDollarValue) {
        displayDollarOfficialError('No se encontraron datos para las fechas seleccionadas.');
        return;
    }

    const startUsdEquivalent = pesoAmount / startDollarValue;
    const endUsdEquivalent = pesoAmount / endDollarValue;
    const percentageChange = ((endUsdEquivalent - startUsdEquivalent) / startUsdEquivalent) * 100;

    document.getElementById('startUsdEquivalentOfficial').textContent = `$${startUsdEquivalent.toFixed(2)}`;
    document.getElementById('endUsdEquivalentOfficial').textContent = `$${endUsdEquivalent.toFixed(2)}`;
    document.getElementById('exchangeVariationOfficial').textContent = `${percentageChange.toFixed(2)}%`;
}

// Mostrar errores en la UI para la sección del dólar oficial
function displayDollarOfficialError(message) {
    document.getElementById('startUsdEquivalentOfficial').textContent = '';
    document.getElementById('endUsdEquivalentOfficial').textContent = '';
    document.getElementById('exchangeVariationOfficial').textContent = message || '';
}

// Event listeners para la sección del dólar oficial
document.getElementById('pesoAmountOfficial').addEventListener('input', calculatePesoDollarOfficialEvolution);
document.getElementById('dollarStartYearOfficial').addEventListener('change', calculatePesoDollarOfficialEvolution);
document.getElementById('dollarStartMonthOfficial').addEventListener('change', calculatePesoDollarOfficialEvolution);
document.getElementById('dollarEndYearOfficial').addEventListener('change', calculatePesoDollarOfficialEvolution);
document.getElementById('dollarEndMonthOfficial').addEventListener('change', calculatePesoDollarOfficialEvolution);

// Cargar datos y realizar cálculos iniciales
window.addEventListener('load', () => {
    console.log('Página cargada. Iniciando carga de datos del dólar oficial...');
    loadDollarOfficialData().then(() => {
        calculatePesoDollarOfficialEvolution();
    });
});