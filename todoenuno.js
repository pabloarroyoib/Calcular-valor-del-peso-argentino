// Variables globales para almacenar los datos de inflación
let inflationData = null;
let inflationMap = null;

// Iniciar la carga de los datos
console.log('Iniciando carga de datos...');
fetch('inflation-data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Datos cargados exitosamente');
        inflationData = data.inflationData;
        inflationMap = createInflationMap(inflationData);
        console.log('Número de entradas de inflación: ' + inflationData.length);
        populateSelectOptions();
        calculateInflation(); // Cálculo inicial
        compareValues(); // Comparación inicial
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
        displayError('Error al cargar los datos de inflación. Por favor, recargue la página.');
    });

// Crear un mapa para búsqueda rápida
function createInflationMap(data) {
    const map = {};
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        map[entry.year + '-' + entry.month] = entry.inflation;
    }
    return map;
}

// Poblar los selectores de año y mes
function populateSelectOptions() {
    console.log('Poblando opciones de selección...');
    const years = [];
    for (let i = 0; i < inflationData.length; i++) {
        if (!years.includes(inflationData[i].year)) {
            years.push(inflationData[i].year);
        }
    }
    years.sort((a, b) => a - b);

    const months = [
        { value: 1, text: "Enero" }, { value: 2, text: "Febrero" }, { value: 3, text: "Marzo" },
        { value: 4, text: "Abril" }, { value: 5, text: "Mayo" }, { value: 6, text: "Junio" },
        { value: 7, text: "Julio" }, { value: 8, text: "Agosto" }, { value: 9, text: "Septiembre" },
        { value: 10, text: "Octubre" }, { value: 11, text: "Noviembre" }, { value: 12, text: "Diciembre" }
    ];

    const yearSelects = document.querySelectorAll('select[id$="Year"]');
    const monthSelects = document.querySelectorAll('select[id$="Month"]');

    for (let i = 0; i < yearSelects.length; i++) {
        populateSelect(yearSelects[i], years.map(year => ({ value: year, text: year })), years[years.length - 1]);
    }

    for (let i = 0; i < monthSelects.length; i++) {
        populateSelect(monthSelects[i], months, 12);
    }
    
    console.log('Opciones de selección pobladas');
}

function populateSelect(select, options, defaultValue) {
    for (let i = 0; i < options.length; i++) {
        const opt = document.createElement('option');
        opt.value = options[i].value;
        opt.textContent = options[i].text;
        select.appendChild(opt);
    }
    select.value = defaultValue;
}

// Calcular la inflación acumulada para un período
function getInflationForPeriod(startDate, endDate) {
    let accumulatedInflation = 1;
    let monthCount = 0;

    while (startDate <= endDate) {
        const yearMonth = startDate.getFullYear() + '-' + (startDate.getMonth() + 1);
        const inflation = inflationMap[yearMonth];

        if (inflation !== undefined) {
            accumulatedInflation *= (1 + inflation / 100);
            monthCount++;
        }

        startDate.setMonth(startDate.getMonth() + 1);
    }

    return { accumulatedInflation, monthCount };
}

// Calcular la inflación y actualizar la UI
function calculateInflation() {
    const startYear = parseInt(document.getElementById('startYear').value);
    const startMonth = parseInt(document.getElementById('startMonth').value);
    const endYear = parseInt(document.getElementById('endYear').value);
    const endMonth = parseInt(document.getElementById('endMonth').value);
    const startAmount = parseFloat(document.getElementById('startAmount').value) || 0;

    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    if (startDate > endDate) {
        displayError('La fecha de inicio debe ser anterior a la fecha final');
        return;
    }

    const inflationResult = getInflationForPeriod(new Date(startDate), new Date(endDate.setMonth(endDate.getMonth() - 1)));
    const endAmount = startAmount * inflationResult.accumulatedInflation;
    const totalInflation = (inflationResult.accumulatedInflation - 1) * 100;
    const averageMonthlyInflation = inflationResult.monthCount > 0 ? Math.pow(inflationResult.accumulatedInflation, 1 / inflationResult.monthCount) - 1 : 0;
    const averageYearlyInflation = Math.pow(1 + averageMonthlyInflation, 12) - 1;

    document.getElementById('endAmount').value = endAmount.toFixed(2);
    document.getElementById('accumulatedInflation').textContent = totalInflation.toFixed(2) + '%';
    document.getElementById('averageMonthlyInflation').textContent = (averageMonthlyInflation * 100).toFixed(2) + '%';
    document.getElementById('averageYearlyInflation').textContent = (averageYearlyInflation * 100).toFixed(2) + '%';
}

// Mostrar errores en la UI
function displayError(message) {
    document.getElementById('endAmount').value = '';
    document.getElementById('accumulatedInflation').textContent = message;
    document.getElementById('averageMonthlyInflation').textContent = '';
    document.getElementById('averageYearlyInflation').textContent = '';
}

// Nueva función para comparar valores ajustados por inflación
function compareValues() {
    const amount1 = parseFloat(document.getElementById('amount1').value) || 0;
    const year1 = parseInt(document.getElementById('year1').value);
    const month1 = parseInt(document.getElementById('month1').value);
    const amount2 = parseFloat(document.getElementById('amount2').value) || 0;
    const year2 = parseInt(document.getElementById('year2').value);
    const month2 = parseInt(document.getElementById('month2').value);

    const date1 = new Date(year1, month1 - 1);
    const date2 = new Date(year2, month2 - 1);

    if (date1 > date2) {
        displayCompareError('La primera fecha debe ser anterior o igual a la segunda fecha');
        return;
    }

    const inflationResult = getInflationForPeriod(new Date(date1), new Date(date2.setMonth(date2.getMonth() - 1)));
    const adjustedAmount1 = amount1 * inflationResult.accumulatedInflation;
    const difference = adjustedAmount1 - amount2;
    const percentageDifference = ((difference / amount2) * 100).toFixed(2);

    let resultText;
    if (difference > 0) {
        resultText = `El primer valor ajustado (${adjustedAmount1.toFixed(2)}) es ${Math.abs(difference).toFixed(2)} mayor que el segundo valor (${amount2.toFixed(2)}). Diferencia porcentual: +${percentageDifference}%`;
    } else if (difference < 0) {
        resultText = `El primer valor ajustado (${adjustedAmount1.toFixed(2)}) es ${Math.abs(difference).toFixed(2)} menor que el segundo valor (${amount2.toFixed(2)}). Diferencia porcentual: ${percentageDifference}%`;
    } else {
        resultText = `Los valores son iguales en términos reales.`;
    }

    document.getElementById('compareResults').textContent = resultText;
}

function displayCompareError(message) {
    document.getElementById('compareResults').textContent = message;
}

// Listeners para actualizar la inflación
document.getElementById('startYear').addEventListener('change', calculateInflation);
document.getElementById('startMonth').addEventListener('change', calculateInflation);
document.getElementById('endYear').addEventListener('change', calculateInflation);
document.getElementById('endMonth').addEventListener('change', calculateInflation);
document.getElementById('startAmount').addEventListener('input', calculateInflation);

// Listeners para la comparación de valores
document.getElementById('amount1').addEventListener('input', compareValues);
document.getElementById('year1').addEventListener('change', compareValues);
document.getElementById('month1').addEventListener('change', compareValues);
document.getElementById('amount2').addEventListener('input', compareValues);
document.getElementById('year2').addEventListener('change', compareValues);
document.getElementById('month2').addEventListener('change', compareValues);

// Calcular inflación y comparar valores cuando se carga la página
window.addEventListener('load', () => {
    console.log('Página cargada. Iniciando cálculos iniciales...');
    calculateInflation();
    compareValues();
});