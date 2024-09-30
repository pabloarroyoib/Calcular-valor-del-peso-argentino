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
    const years = [...new Set(inflationData.map(entry => entry.year))].sort((a, b) => a - b);
    const months = [
        { value: 1, text: "Enero" }, { value: 2, text: "Febrero" }, { value: 3, text: "Marzo" },
        { value: 4, text: "Abril" }, { value: 5, text: "Mayo" }, { value: 6, text: "Junio" },
        { value: 7, text: "Julio" }, { value: 8, text: "Agosto" }, { value: 9, text: "Septiembre" },
        { value: 10, text: "Octubre" }, { value: 11, text: "Noviembre" }, { value: 12, text: "Diciembre" }
    ];

    const yearSelects = document.querySelectorAll('select[id$="Year"], #year1, #year2');
    const monthSelects = document.querySelectorAll('select[id$="Month"], #month1, #month2');

    // Obtener la última fecha disponible
    const lastEntry = inflationData[inflationData.length - 1];
    let lastYear = lastEntry.year;
    let lastMonth = lastEntry.month;

    // Ajustar al mes siguiente
    if (lastMonth === 12) {
        lastMonth = 1;
        lastYear++;
    } else {
        lastMonth++;
    }

    console.log(`Última entrada de datos ajustada: Año ${lastYear}, Mes ${lastMonth}`);

    yearSelects.forEach(select => {
        populateSelect(select, years.map(year => ({ value: year, text: year })), 
                       select.id.startsWith('end') || select.id === 'year2' ? lastYear : years[0]);
    });

    monthSelects.forEach(select => {
        populateSelect(select, months, 
                       select.id.startsWith('end') || select.id === 'month2' ? lastMonth : 1);
    });
    
    // Establecer el mes siguiente al último dato disponible para los selectores de fecha final
    document.getElementById('endYear').value = lastYear;
    document.getElementById('endMonth').value = lastMonth;
    document.getElementById('year2').value = lastYear;
    document.getElementById('month2').value = lastMonth;

    console.log(`Fecha final establecida: Año ${lastYear}, Mes ${lastMonth}`);
}

function populateSelect(select, options, defaultValue) {
    select.innerHTML = ''; // Limpiar opciones existentes
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        select.appendChild(opt);
    });
    select.value = defaultValue;
}

// Calcular la inflación acumulada para un período
function getInflationForPeriod(startDate, endDate) {
    console.log('Datos de inflación disponibles:', inflationData);
    console.log('Calculando inflación desde', startDate, 'hasta', endDate);
    let accumulatedInflation = 1;
    let months = 0;

    for (let d = new Date(startDate); d < endDate; d.setMonth(d.getMonth() + 1)) {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        console.log('Buscando datos para', year, month);
        const monthData = inflationData.find(data => data.year === year && data.month === month);
        
        if (monthData) {
            accumulatedInflation *= (1 + monthData.inflation / 100);
            months++;
            console.log(`Inflación para ${year}-${month}: ${monthData.inflation}%`);
        } else {
            console.log(`No se encontraron datos para ${year}-${month}`);
        }
    }

    const totalInflation = (accumulatedInflation - 1) * 100;
    console.log('Inflación acumulada total:', totalInflation);

    return {
        accumulatedInflation: totalInflation,
        averageMonthlyInflation: months > 0 ? (Math.pow(accumulatedInflation, 1/months) - 1) * 100 : 0,
        averageYearlyInflation: months > 0 ? (Math.pow(accumulatedInflation, 12/months) - 1) * 100 : 0
    };
}

// Calcular la inflación y actualizar la UI
function calculateInflation() {
    const startAmount = parseFloat(document.getElementById('startAmount').value);
    const startYear = parseInt(document.getElementById('startYear').value);
    const startMonth = parseInt(document.getElementById('startMonth').value);
    const endYear = parseInt(document.getElementById('endYear').value);
    const endMonth = parseInt(document.getElementById('endMonth').value);

    // Limpiar los resultados anteriores
    document.getElementById('endAmount').value = '';
    document.getElementById('accumulatedInflation').textContent = '';
    document.getElementById('averageMonthlyInflation').textContent = '';
    document.getElementById('averageYearlyInflation').textContent = '';

    // Verificar si se ha ingresado un monto inicial
    if (isNaN(startAmount)) {
        return; // No hacer nada si no hay un monto inicial
    }

    // Verificar si el monto inicial es 0 o negativo
    if (startAmount <= 0) {
        displayError('El valor ingresado debe ser mayor que 0.');
        return;
    }

    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    if (startDate > endDate) {
        displayError('La fecha de inicio debe ser anterior o igual a la fecha final.');
        return;
    }

    const inflationResult = getInflationForPeriod(startDate, endDate);
    const endAmount = startAmount * (1 + inflationResult.accumulatedInflation / 100);

    document.getElementById('endAmount').value = endAmount.toFixed(2);
    document.getElementById('accumulatedInflation').textContent = inflationResult.accumulatedInflation.toFixed(2) + '%';
    document.getElementById('averageMonthlyInflation').textContent = inflationResult.averageMonthlyInflation.toFixed(2) + '%';
    document.getElementById('averageYearlyInflation').textContent = inflationResult.averageYearlyInflation.toFixed(2) + '%';
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
    const amount1 = parseFloat(document.getElementById('amount1').value);
    const year1 = parseInt(document.getElementById('year1').value);
    const month1 = parseInt(document.getElementById('month1').value);
    const amount2 = parseFloat(document.getElementById('amount2').value);
    const year2 = parseInt(document.getElementById('year2').value);
    const month2 = parseInt(document.getElementById('month2').value);

    // Limpiar los resultados anteriores
    document.getElementById('adjustedAmount').textContent = '';
    document.getElementById('percentageDifference').textContent = '';

    // Verificar si todos los campos tienen valores
    if (isNaN(amount1) || isNaN(amount2) || !year1 || !year2 || !month1 || !month2) {
        return; // No hacer nada si falta algún valor
    }

    // Verificar si el primer monto es negativo
    if (amount1 < 0) {
        displayCompareError('El primer valor no puede ser negativo.');
        return;
    }

    // Verificar si el segundo monto es 0 o negativo
    if (amount2 <= 0) {
        displayCompareError('El segundo valor debe ser mayor que 0.');
        return;
    }

    const date1 = new Date(year1, month1 - 1, 1);
    const date2 = new Date(year2, month2 - 1, 1);

    if (date1 > date2) {
        displayCompareError('La primera fecha debe ser anterior o igual a la segunda fecha');
        return;
    }

    const inflationResult = getInflationForPeriod(date1, date2);
    const adjustedAmount1 = amount1 * (1 + inflationResult.accumulatedInflation / 100);
    const difference = adjustedAmount1 - amount2;
    const percentageDifference = ((difference / amount2) * 100).toFixed(2);

    document.getElementById('adjustedAmount').textContent = `$${adjustedAmount1.toFixed(2)}`;
    document.getElementById('percentageDifference').textContent = `${percentageDifference}%`;
}

function displayCompareError(message) {
    document.getElementById('adjustedAmount').textContent = message;
    document.getElementById('percentageDifference').textContent = '';
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

// Cargar datos y realizar cálculos iniciales
window.addEventListener('load', () => {
    console.log('Página cargada. Iniciando carga de datos...');
    fetch('inflation-data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Datos de inflación cargados');
            inflationData = data.inflationData;
            inflationMap = createInflationMap(inflationData);
            populateSelectOptions(); // Llamar aquí después de cargar los datos
            calculateInflation();
            compareValues();
            return loadDollarData(); // Asegúrate de que esta función devuelva una promesa
        })
        .then(() => {
            calculatePesoDollarEvolution();
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
            displayError('Error al cargar los datos. Por favor, recargue la página.');
        });
});