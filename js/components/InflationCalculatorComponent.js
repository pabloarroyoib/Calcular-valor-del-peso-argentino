/**
 * Componente para la calculadora de inflación
 */
import { MONTHS, populateSelect, validateDates, validatePositiveNumber } from '../utils/common.js';

export class InflationCalculatorComponent {
    /**
     * Constructor
     * @param {InflationService} inflationService - Servicio de datos de inflación
     */
    constructor(inflationService) {
        this.inflationService = inflationService;

        // Elementos de la primera calculadora (inflación histórica)
        this.startAmount = document.getElementById('startAmount');
        this.startMonth = document.getElementById('startMonth');
        this.startYear = document.getElementById('startYear');
        this.endMonth = document.getElementById('endMonth');
        this.endYear = document.getElementById('endYear');
        this.endAmount = document.getElementById('endAmount');
        this.accumulatedInflation = document.getElementById('accumulatedInflation');
        this.averageMonthlyInflation = document.getElementById('averageMonthlyInflation');
        this.averageYearlyInflation = document.getElementById('averageYearlyInflation');

        // Elementos de la segunda calculadora (comparar precios)
        this.amount1 = document.getElementById('amount1');
        this.month1 = document.getElementById('month1');
        this.year1 = document.getElementById('year1');
        this.amount2 = document.getElementById('amount2');
        this.month2 = document.getElementById('month2');
        this.year2 = document.getElementById('year2');
        this.adjustedAmount = document.getElementById('adjustedAmount');
        this.percentageDifference = document.getElementById('percentageDifference');

        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        this.populateSelectOptions();
        this.setupEventListeners();
        this.calculateInflation(); // Cálculo inicial
        this.compareValues(); // Comparación inicial
    }

    /**
     * Pobla los selectores de año y mes
     */
    populateSelectOptions() {
        const years = this.inflationService.getYears();

        // Obtener la última fecha disponible
        const lastEntry = this.inflationService.getLatestEntry();
        let lastYear = lastEntry.year;
        let lastMonth = lastEntry.month;

        // Ajustar al mes siguiente para los selectores de fecha final
        if (lastMonth === 12) {
            lastMonth = 1;
            lastYear++;
        } else {
            lastMonth++;
        }

        // Selectores de la primera calculadora
        populateSelect(this.startYear, years.map(year => ({ value: year, text: year })), years[years.length - 1]);
        populateSelect(this.startMonth, MONTHS, 1);
        populateSelect(this.endYear, years.map(year => ({ value: year, text: year })), lastYear);
        populateSelect(this.endMonth, MONTHS, lastMonth);

        // Selectores de la segunda calculadora
        populateSelect(this.year1, years.map(year => ({ value: year, text: year })), years[years.length - 1]);
        populateSelect(this.month1, MONTHS, 1);
        populateSelect(this.year2, years.map(year => ({ value: year, text: year })), lastYear);
        populateSelect(this.month2, MONTHS, lastMonth);
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Event listeners para la calculadora de inflación
        this.startAmount.addEventListener('input', () => this.calculateInflation());
        this.startYear.addEventListener('change', () => this.calculateInflation());
        this.startMonth.addEventListener('change', () => this.calculateInflation());
        this.endYear.addEventListener('change', () => this.calculateInflation());
        this.endMonth.addEventListener('change', () => this.calculateInflation());

        // Event listeners para la comparación de precios
        this.amount1.addEventListener('input', () => this.compareValues());
        this.year1.addEventListener('change', () => this.compareValues());
        this.month1.addEventListener('change', () => this.compareValues());
        this.amount2.addEventListener('input', () => this.compareValues());
        this.year2.addEventListener('change', () => this.compareValues());
        this.month2.addEventListener('change', () => this.compareValues());
    }

    /**
     * Calcula la inflación y actualiza la UI
     */
    calculateInflation() {
        const startAmount = parseFloat(this.startAmount.value);
        const startYear = parseInt(this.startYear.value);
        const startMonth = parseInt(this.startMonth.value);
        const endYear = parseInt(this.endYear.value);
        const endMonth = parseInt(this.endMonth.value);

        // Limpiar los resultados anteriores
        this.endAmount.value = '';
        this.accumulatedInflation.textContent = '';
        this.averageMonthlyInflation.textContent = '';
        this.averageYearlyInflation.textContent = '';

        // Verificar si se ha ingresado un monto inicial
        if (isNaN(startAmount)) {
            return; // No hacer nada si no hay un monto inicial
        }

        // Verificar si el monto inicial es positivo
        if (!validatePositiveNumber(startAmount)) {
            this.displayError('El valor ingresado debe ser mayor que 0.');
            return;
        }

        const startDate = new Date(startYear, startMonth - 1);
        const endDate = new Date(endYear, endMonth - 1);

        // Validar que la fecha de inicio sea anterior a la fecha final
        if (!validateDates(startDate, endDate)) {
            this.displayError('La fecha de inicio debe ser anterior o igual a la fecha final.');
            return;
        }

        // Calcular la inflación para el período
        try {
            const inflationResult = this.inflationService.calculateInflationForPeriod(startDate, endDate);
            const endAmount = startAmount * (1 + inflationResult.accumulatedInflation / 100);

            this.endAmount.value = endAmount.toFixed(2);
            this.accumulatedInflation.textContent = inflationResult.accumulatedInflation.toFixed(2) + '%';
            this.averageMonthlyInflation.textContent = inflationResult.averageMonthlyInflation.toFixed(2) + '%';
            this.averageYearlyInflation.textContent = inflationResult.averageYearlyInflation.toFixed(2) + '%';
        } catch (error) {
            this.displayError(error.message);
        }
    }

    /**
     * Compara dos valores ajustados por inflación
     */
    compareValues() {
        const amount1 = parseFloat(this.amount1.value);
        const year1 = parseInt(this.year1.value);
        const month1 = parseInt(this.month1.value);
        const amount2 = parseFloat(this.amount2.value);
        const year2 = parseInt(this.year2.value);
        const month2 = parseInt(this.month2.value);

        // Limpiar los resultados anteriores
        this.adjustedAmount.textContent = '';
        this.percentageDifference.textContent = '';

        // Verificar si todos los campos tienen valores
        if (isNaN(amount1) || isNaN(amount2) || !year1 || !year2 || !month1 || !month2) {
            return; // No hacer nada si falta algún valor
        }
        
        const date1 = new Date(year1, month1 - 1);
        const date2 = new Date(year2, month2 - 1);
        
        // Validar que la primera fecha no sea posterior a la segunda
        if (date1 > date2) {
            this.displayCompareError('La primera fecha no puede ser posterior a la segunda.');
            return;
        }

        // Verificar si los montos son positivos
        if (!validatePositiveNumber(amount1)) {
            this.displayCompareError('El primer valor debe ser mayor que 0.');
            return;
        }

        if (!validatePositiveNumber(amount2)) {
            this.displayCompareError('El segundo valor debe ser mayor que 0.');
            return;
        }

        try {
            // Convertir el valor 1 a la fecha 2
            const inflationResult = this.inflationService.calculateInflationForPeriod(date1, date2);
            const adjustedAmount1 = amount1 * (1 + inflationResult.accumulatedInflation / 100);
            const percentageDifference = ((amount2 - adjustedAmount1) / adjustedAmount1) * 100;

            this.adjustedAmount.textContent = `$${adjustedAmount1.toFixed(2)}`;
            this.percentageDifference.textContent = `${percentageDifference.toFixed(2)}%`;

            // Agregar clase para colorear según si aumentó o disminuyó
            if (percentageDifference > 0) {
                this.percentageDifference.classList.add('positive');
                this.percentageDifference.classList.remove('negative');
            } else if (percentageDifference < 0) {
                this.percentageDifference.classList.add('negative');
                this.percentageDifference.classList.remove('positive');
            } else {
                this.percentageDifference.classList.remove('positive', 'negative');
            }
        } catch (error) {
            this.displayCompareError(error.message);
        }
    }

    /**
     * Muestra errores en la UI para la calculadora de inflación
     * @param {string} message - Mensaje de error
     */
    displayError(message) {
        this.endAmount.value = '';
        this.accumulatedInflation.textContent = message;
        this.averageMonthlyInflation.textContent = '';
        this.averageYearlyInflation.textContent = '';
    }

    /**
     * Muestra errores en la UI para la comparación de valores
     * @param {string} message - Mensaje de error
     */
    displayCompareError(message) {
        this.adjustedAmount.textContent = '';
        this.percentageDifference.textContent = message;
    }
}
