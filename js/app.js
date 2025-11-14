/**
 * Archivo principal de la aplicación
 */
import { MenuComponent } from './components/MenuComponent.js';
import { InflationCalculatorComponent } from './components/InflationCalculatorComponent.js';
import { DollarCalculatorComponent } from './components/DollarCalculatorComponent.js';
import { InflationService, DollarBlueService, DollarOfficialService } from './services/dataService.js';

/**
 * Clase principal de la aplicación
 */
class App {
    constructor() {
        this.components = [];
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('Inicializando la aplicación...');
            
            // Inicializar el menú
            const menuComponent = new MenuComponent();
            this.components.push(menuComponent);
            
            // Inicializar servicios de datos
            const inflationService = await new InflationService().init();
            const dollarBlueService = await new DollarBlueService().init();
            const dollarOfficialService = await new DollarOfficialService().init();
            
            // Inicializar componentes de calculadoras
            const inflationCalculator = new InflationCalculatorComponent(inflationService);
            const dollarBlueCalculator = new DollarCalculatorComponent(dollarBlueService);
            const dollarOfficialCalculator = new DollarCalculatorComponent(dollarOfficialService, 'Official');
            
            this.components.push(inflationCalculator, dollarBlueCalculator, dollarOfficialCalculator);
            
            console.log('Aplicación inicializada correctamente.');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.displayGlobalError(error.message);
        }
    }

    /**
     * Muestra un error global en la aplicación
     * @param {string} message - Mensaje de error
     */
    displayGlobalError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'global-error';
        errorElement.textContent = `Error: ${message}`;
        document.body.prepend(errorElement);
    }
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
