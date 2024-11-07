class RobotVacuum {
    constructor() {
        this.ESTADOS = {
            LIBRE: { clase: 'libre', texto: 'Libre para limpiar' },
            OCUPADA: { clase: 'ocupada', texto: 'Ocupada - Continuar con otra' },
            NO_LIMPIAR: { clase: 'no-limpiar', texto: 'No limpiar' },
            SUCIA: { clase: 'sucia', texto: 'Sucia - Necesita limpieza' }
        };

        this.bodegas = Array(4).fill(null).map((_, id) => ({
            id,
            estado: this.ESTADOS.SUCIA,
            limpia: false
        }));

        this.bateria = 100;
        this.cargando = false;
        this.activo = false;
        this.bodegasLimpiadas = 0;
        this.robotPos = 2; 
        
        this.initializeDOM();
        this.setupEventListeners();
        this.renderizarBodegas();
        this.actualizarUI();
    }

    initializeDOM() {
  
        this.startButton = document.getElementById('startButton');
        this.batteryLevel = document.getElementById('batteryLevel');
        this.batteryPercentage = document.getElementById('batteryPercentage');
        this.currentStatus = document.getElementById('currentStatus');
        this.cleanedWarehouses = document.getElementById('cleanedWarehouses');
        this.randomizeButton = document.getElementById('randomizeButton');
        this.warehousesGrid = document.querySelector('.warehouses-grid');
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.toggleRobot());
        this.randomizeButton.addEventListener('click', () => this.cambiarEstadosAleatorios());
    }

    toggleRobot() {
        this.activo = !this.activo;
        this.startButton.textContent = this.activo ? 'Detener Robot' : 'Iniciar Robot';
        this.startButton.classList.toggle('active', this.activo);
        
        if (this.activo) {
            this.iniciarSimulacion();
        }
    }

    iniciarSimulacion() {
        if (!this.simulationInterval) {
            this.simulationInterval = setInterval(() => this.simularCiclo(), 1000);
        }
    }

    simularCiclo() {
        if (!this.activo) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
            return;
        }

        // Actualizar batería
        if (this.cargando) {
            this.bateria = Math.min(100, this.bateria + 10);
            this.actualizarEstado('Cargando batería...');
            
            if (this.bateria >= 100) {
                this.cargando = false;
                this.actualizarEstado('Batería completa, continuando limpieza');
            }
        } else {
            this.bateria = Math.max(0, this.bateria - 2);
        }

        // Verificar batería baja
        if (this.bateria < 20 && !this.cargando) {
            this.cargando = true;
            this.robotPos = 2; // Volver a estación de carga
            this.actualizarEstado('Batería baja, regresando a estación de carga');
            this.actualizarUI();
            return;
        }

        // Proceso de limpieza
        if (!this.cargando && this.bodegasLimpiadas < 2.5) {
            const bodegaSucia = this.bodegas.find(b => 
                b.estado === this.ESTADOS.SUCIA && !b.limpia
            );

            if (bodegaSucia) {
                this.robotPos = bodegaSucia.id;
                this.actualizarEstado(`Limpiando bodega ${bodegaSucia.id + 1}`);
                bodegaSucia.limpia = true;
                bodegaSucia.estado = this.ESTADOS.LIBRE;
                this.bodegasLimpiadas += 0.5;
            } else {
                this.actualizarEstado('Buscando siguiente bodega para limpiar');
            }
        } else if (!this.cargando) {
            this.cargando = true;
            this.robotPos = 2;
            this.actualizarEstado('Límite de bodegas alcanzado, regresando a cargar');
        }

        this.actualizarUI();
    }

    cambiarEstadosAleatorios() {
        const estados = Object.values(this.ESTADOS);
        this.bodegas.forEach(bodega => {
            bodega.estado = estados[Math.floor(Math.random() * estados.length)];
            bodega.limpia = false;
        });
        this.renderizarBodegas();
    }

    actualizarEstado(mensaje) {
        this.currentStatus.textContent = mensaje;
    }

    renderizarBodegas() {
        this.warehousesGrid.innerHTML = this.bodegas.map((bodega, index) => `
            <div class="warehouse ${bodega.estado.clase}">
                <h3>Bodega ${index + 1}</h3>
                <p>Estado: ${bodega.estado.texto}</p>
                ${this.robotPos === index ? '<div class="robot-icon">🤖</div>' : ''}
            </div>
        `).join('');
    }

    actualizarUI() {
        this.batteryLevel.style.width = `${this.bateria}%`;
        this.batteryPercentage.textContent = `${this.bateria}%`;
        this.cleanedWarehouses.textContent = this.bodegasLimpiadas.toFixed(1);
        this.renderizarBodegas();
        
       
        this.batteryLevel.classList.toggle('charging', this.cargando);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const robotVacuum = new RobotVacuum();
});