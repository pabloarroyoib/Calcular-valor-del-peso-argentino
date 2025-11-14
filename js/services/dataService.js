/**
 * Servicio para cargar datos de los diferentes JSON
 */
import { createDataMap } from '../utils/common.js';

/**
 * Clase base para manejo de datos
 */
class DataService {
    /**
     * Constructor
     * @param {string} dataUrl - URL del archivo JSON de datos
     */
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.data = null;
        this.dataMap = null;
    }

    /**
     * Carga los datos del JSON
     * @returns {Promise} - Promesa que se resuelve cuando los datos se han cargado
     */
    async loadData() {
        try {
            console.log(`Iniciando carga de datos desde ${this.dataUrl}...`);
            const response = await fetch(this.dataUrl);
            const data = await response.json();
            console.log(`Datos cargados exitosamente desde ${this.dataUrl}`);
            return data;
        } catch (error) {
            console.error(`Error al cargar los datos desde ${this.dataUrl}:`, error);
            throw error;
        }
    }
}

/**
 * Servicio para datos de inflación
 */
export class InflationService extends DataService {
    constructor() {
        super('../data/inflation-data.json');
    }

    /**
     * Carga y procesa los datos de inflación
     */
    async init() {
        try {
            const data = await this.loadData();
            this.data = data.inflationData;
            this.dataMap = createDataMap(
                this.data,
                entry => `${entry.year}-${entry.month}`,
                entry => entry.inflation
            );
            console.log(`Número de entradas de inflación: ${this.data.length}`);
            return this;
        } catch (error) {
            throw new Error('Error al inicializar datos de inflación: ' + error.message);
        }
    }

    /**
     * Obtiene todos los años disponibles en los datos
     * @returns {Array} - Array de años ordenados descendentemente
     */
    getYears() {
        return [...new Set(this.data.map(entry => entry.year))].sort((a, b) => b - a);
    }

    /**
     * Obtiene la última entrada de datos
     * @returns {Object} - Última entrada de datos {year, month}
     */
    getLatestEntry() {
        return this.data[this.data.length - 1];
    }

    /**
     * Calcula la inflación para un período
     * @param {Date} startDate - Fecha inicial
     * @param {Date} endDate - Fecha final
     * @returns {Object} - Resultados de inflación
     */
    calculateInflationForPeriod(startDate, endDate) {
        let accumulatedInflation = 1;
        let months = 0;

        for (let d = new Date(startDate); d < endDate; d.setMonth(d.getMonth() + 1)) {
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const key = `${year}-${month}`;
            const inflation = this.dataMap[key];
            
            if (inflation !== undefined) {
                accumulatedInflation *= (1 + inflation / 100);
                months++;
                console.log(`Inflación para ${year}-${month}: ${inflation}%`);
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
}

/**
 * Servicio base para datos de dólar
 */
class DollarService extends DataService {
    constructor(dataUrl) {
        super(dataUrl);
    }

    /**
     * Carga y procesa los datos del dólar
     */
    async init() {
        try {
            const data = await this.loadData();
            this.data = data;
            this.dataMap = createDataMap(
                this.data,
                entry => `${entry.year}-${entry.month}`,
                entry => entry.valor
            );
            console.log(`Número de entradas de dólar: ${this.data.length}`);
            return this;
        } catch (error) {
            throw new Error('Error al inicializar datos de dólar: ' + error.message);
        }
    }

    /**
     * Obtiene todos los años disponibles en los datos
     * @returns {Array} - Array de años ordenados descendentemente
     */
    getYears() {
        return [...new Set(this.data.map(entry => entry.year))].sort((a, b) => b - a);
    }

    /**
     * Obtiene la última entrada de datos
     * @returns {Object} - Última entrada de datos {year, month}
     */
    getLatestEntry() {
        return this.data[this.data.length - 1];
    }

    /**
     * Calcula la evolución del peso respecto al dólar
     * @param {number} pesoAmount - Cantidad en pesos
     * @param {number} startYear - Año inicial
     * @param {number} startMonth - Mes inicial
     * @param {number} endYear - Año final
     * @param {number} endMonth - Mes final
     * @returns {Object} - Resultados del cálculo
     */
    calculatePesoDollarEvolution(pesoAmount, startYear, startMonth, endYear, endMonth) {
        const startKey = `${startYear}-${startMonth}`;
        const endKey = `${endYear}-${endMonth}`;
        
        const startDollarValue = this.dataMap[startKey];
        const endDollarValue = this.dataMap[endKey];

        if (!startDollarValue || !endDollarValue) {
            throw new Error('No se encontraron datos para las fechas seleccionadas.');
        }

        const startUsdEquivalent = pesoAmount / startDollarValue;
        const endUsdEquivalent = pesoAmount / endDollarValue;
        const percentageChange = ((endUsdEquivalent - startUsdEquivalent) / startUsdEquivalent) * 100;

        return {
            startUsdEquivalent,
            endUsdEquivalent,
            percentageChange
        };
    }
}

/**
 * Servicio para datos de dólar blue
 */
export class DollarBlueService extends DollarService {
    constructor() {
        super('../data/dolarblue-data.json');
    }
}

/**
 * Servicio para datos de dólar oficial
 */
export class DollarOfficialService extends DollarService {
    constructor() {
        super('../data/dolaroficial-data.json');
    }
}
