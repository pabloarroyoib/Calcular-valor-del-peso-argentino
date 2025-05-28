/**
 * Componente para el manejo del menú de navegación
 */
export class MenuComponent {
    constructor() {
        this.navbarToggle = document.querySelector('.navbar__toggle');
        this.navbarMenu = document.querySelector('.navbar__menu');
        this.navbarLinks = document.querySelectorAll('.navbar__link');
        
        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        this.setupToggle();
        this.setupSmoothScroll();
    }

    /**
     * Configura el botón de toggle para el menú en dispositivos móviles
     */
    setupToggle() {
        this.navbarToggle.addEventListener('click', () => {
            this.navbarMenu.classList.toggle('active');
        });
    }

    /**
     * Configura el scroll suave para los enlaces de navegación
     */
    setupSmoothScroll() {
        this.navbarLinks.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();

                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerOffset = document.querySelector('.header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Cerrar el menú desplegable después de hacer clic (en móviles)
                    if (window.innerWidth <= 768) {
                        this.navbarMenu.classList.remove('active');
                    }
                }
            });
        });
    }
}
