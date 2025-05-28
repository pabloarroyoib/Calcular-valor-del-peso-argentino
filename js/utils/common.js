/**
 * Funciones de utilidad comunes para toda la aplicación
 */

/**
 * Crea un mapa para búsqueda rápida a partir de datos
 * @param {Array} data - Array de objetos con datos
 * @param {Function} keyGenerator - Función que genera la clave para el mapa
 * @param {Function} valueExtractor - Función que extrae el valor para almacenar
 * @returns {Object} Mapa de búsqueda
 */
export function createDataMap(data, keyGenerator, valueExtractor) {
    const map = {};
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const key = keyGenerator(entry);
        map[key] = valueExtractor(entry);
    }
    return map;
}

/**
 * Configura un select con opciones
 * @param {HTMLSelectElement} select - Elemento select a poblar
 * @param {Array} options - Array de opciones {value, text}
 * @param {any} defaultValue - Valor por defecto
 */
export function populateSelect(select, options, defaultValue) {
    select.innerHTML = ''; // Limpiar opciones existentes
    
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        select.appendChild(opt);
    });
    
    if (defaultValue !== undefined) {
        select.value = defaultValue;
    }
}

/**
 * Validar fechas para asegurar que la fecha inicial es anterior a la final
 * @param {Date} startDate - Fecha inicial
 * @param {Date} endDate - Fecha final
 * @returns {boolean} - True si la validación es exitosa
 */
export function validateDates(startDate, endDate) {
    return startDate <= endDate;
}

/**
 * Validar que un valor numérico sea positivo
 * @param {number} value - Valor a validar
 * @returns {boolean} - True si la validación es exitosa
 */
export function validatePositiveNumber(value) {
    return !isNaN(value) && value > 0;
}

/**
 * Lista de meses en español
 */
export const MONTHS = [
    { value: 1, text: "Enero" }, 
    { value: 2, text: "Febrero" }, 
    { value: 3, text: "Marzo" },
    { value: 4, text: "Abril" }, 
    { value: 5, text: "Mayo" }, 
    { value: 6, text: "Junio" },
    { value: 7, text: "Julio" }, 
    { value: 8, text: "Agosto" }, 
    { value: 9, text: "Septiembre" },
    { value: 10, text: "Octubre" }, 
    { value: 11, text: "Noviembre" }, 
    { value: 12, text: "Diciembre" }
];
