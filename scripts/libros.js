/**
 * =============================================================================
 * libros.js - Lógica de la página Libro Diario y Mayor
 * =============================================================================
 * 
 * Este archivo contiene toda la funcionalidad de la página libros.html:
 * renderizar el Libro Diario (registro cronológico), renderizar el Libro Mayor
 * (esquemas T con saldos calculados), y gestionar las pestañas.
 * 
 * El Libro Diario es el primer libro donde se registran las operaciones
 * en orden cronológico. Cada asiento muestra todas las cuentas afectadas
 * con sus movimientos al Debe y al Haber.
 * 
 * El Libro Mayor es el segundo libro donde se trasladan los movimientos
 * del Diario, agrupados por cuenta. Se usa el formato T:
 * - Columna izquierda: movimientos al Debe
 * - Columna derecha: movimientos al Haber
 * - Parte inferior: saldo calculado según la naturaleza de la cuenta
 * 
 * Para calcular el saldo de una cuenta en el mayor:
 * - Si es deudora: Saldo = Total Debe - Total Haber
 * - Si es acreedora: Saldo = Total Haber - Total Debe
 */

// =============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// =============================================================================

/** Botón de la pestaña Libro Diario */
const pestanaDiario = document.getElementById('pestana-diario');

/** Botón de la pestaña Libro Mayor */
const pestanaMayor = document.getElementById('pestana-mayor');

/** Sección del Libro Diario */
const seccionDiario = document.getElementById('seccion-diario');

/** Sección del Libro Mayor */
const seccionMayor = document.getElementById('seccion-mayor');

/** Cuerpo de la tabla del Libro Diario */
const cuerpoTablaDiario = document.getElementById('cuerpo-tabla-diario');

/** Pie de la tabla del Libro Diario (totales) */
const pieTablaDiario = document.getElementById('pie-tabla-diario');

/** Mensaje cuando no hay asientos en el diario */
const mensajeSinAsientosDiario = document.getElementById('mensaje-sin-asientos-diario');

/** Selector para filtrar cuentas en el mayor */
const selectorCuentaMayor = document.getElementById('selector-cuenta-mayor');

/** Contenedor de los esquemas de mayor */
const contenedorMayores = document.getElementById('contenedor-mayores');

/** Mensaje cuando no hay datos en el mayor */
const mensajeSinDatosMayor = document.getElementById('mensaje-sin-datos-mayor');

/** Cuerpo de la tabla de resumen de saldos */
const cuerpoResumenSaldos = document.getElementById('cuerpo-resumen-saldos');

/** Mensaje cuando no hay saldos */
const mensajeSinSaldos = document.getElementById('mensaje-sin-saldos');

/** Botón para imprimir el diario */
const botonImprimirDiario = document.getElementById('boton-imprimir-diario');

/** Botón para imprimir el mayor */
const botonImprimirMayor = document.getElementById('boton-imprimir-mayor');

// =============================================================================
// FUNCIONES DE PESTAÑAS
// =============================================================================

/**
 * Cambia entre la pestaña del Libro Diario y la del Libro Mayor.
 * Muestra la sección correspondiente y oculta la otra.
 * 
 * @param {string} pestana - 'diario' o 'mayor'
 */
function cambiarPestana(pestana) {
    if (pestana === 'diario') {
        // Activamos la pestaña del diario
        pestanaDiario.classList.add('activa');
        pestanaMayor.classList.remove('activa');
        
        // Mostramos la sección del diario y ocultamos la del mayor
        seccionDiario.classList.remove('oculto');
        seccionMayor.classList.add('oculto');
    } else if (pestana === 'mayor') {
        // Activamos la pestaña del mayor
        pestanaMayor.classList.add('activa');
        pestanaDiario.classList.remove('activa');
        
        // Mostramos la sección del mayor y ocultamos la del diario
        seccionMayor.classList.remove('oculto');
        seccionDiario.classList.add('oculto');
    }
}

// =============================================================================
// FUNCIONES DEL LIBRO DIARIO
// =============================================================================

/**
 * Renderiza la tabla del Libro Diario con todos los asientos en orden cronológico.
 * Cada asiento se muestra con sus líneas, agrupadas visualmente.
 * Al final se muestran los totales del Debe y el Haber.
 */
function renderizarLibroDiario() {
    // Limpiamos el contenido actual
    limpiarContenido(cuerpoTablaDiario);
    limpiarContenido(pieTablaDiario);
    
    // Si no hay asientos, mostramos el mensaje de vacío
    if (asientos.length === 0) {
        mensajeSinAsientosDiario.classList.remove('oculto');
        document.getElementById('tabla-diario').style.display = 'none';
        return;
    }
    
    // Hay asientos: ocultamos el mensaje y mostramos la tabla
    mensajeSinAsientosDiario.classList.add('oculto');
    document.getElementById('tabla-diario').style.display = 'table';
    
    let granTotalDebe = 0;
    let granTotalHaber = 0;
    
    // Recorremos todos los asientos
    for (let i = 0; i < asientos.length; i++) {
        const asiento = asientos[i];
        const lineas = asiento.lineas;
        const totalLineas = lineas.length;
        
        // Recorremos cada línea del asiento
        for (let j = 0; j < lineas.length; j++) {
            const linea = lineas[j];
            const fila = document.createElement('tr');
            
            // Si es la primera línea del asiento, agregamos celdas con rowspan
            if (j === 0) {
                // Celda del número de asiento
                const celdaNumero = document.createElement('td');
                celdaNumero.textContent = asiento.numero;
                celdaNumero.rowSpan = totalLineas;
                celdaNumero.className = 'celda-asiento-diario';
                fila.appendChild(celdaNumero);
                
                // Celda de la fecha
                const celdaFecha = document.createElement('td');
                celdaFecha.textContent = formatearFecha(asiento.fecha);
                celdaFecha.rowSpan = totalLineas;
                celdaFecha.className = 'celda-asiento-diario';
                fila.appendChild(celdaFecha);
            }
            
            // Celda de la cuenta
            const celdaCuenta = document.createElement('td');
            celdaCuenta.textContent = linea.cuenta;
            fila.appendChild(celdaCuenta);
            
            // Celda del Debe
            const celdaDebe = document.createElement('td');
            celdaDebe.className = 'celda-numero';
            if (linea.tipo === 'debe') {
                celdaDebe.textContent = formatearMoneda(linea.monto);
                celdaDebe.classList.add('texto-debe');
                granTotalDebe += linea.monto;
            } else {
                celdaDebe.textContent = '-';
            }
            fila.appendChild(celdaDebe);
            
            // Celda del Haber
            const celdaHaber = document.createElement('td');
            celdaHaber.className = 'celda-numero';
            if (linea.tipo === 'haber') {
                celdaHaber.textContent = formatearMoneda(linea.monto);
                celdaHaber.classList.add('texto-haber');
                granTotalHaber += linea.monto;
            } else {
                celdaHaber.textContent = '-';
            }
            fila.appendChild(celdaHaber);
            
            // Si es la primera línea, agregamos la descripción
            if (j === 0) {
                const celdaDescripcion = document.createElement('td');
                celdaDescripcion.textContent = asiento.descripcion;
                celdaDescripcion.rowSpan = totalLineas;
                celdaDescripcion.className = 'celda-asiento-diario celda-descripcion-diario';
                fila.appendChild(celdaDescripcion);
            }
            
            // Agregamos la fila al cuerpo de la tabla
            cuerpoTablaDiario.appendChild(fila);
        }
    }
    
    // Creamos la fila de totales en el pie de la tabla
    const filaTotales = document.createElement('tr');
    filaTotales.className = 'fila-totales';
    
    const celdaTotalLabel = document.createElement('td');
    celdaTotalLabel.colSpan = 3;
    celdaTotalLabel.textContent = 'TOTALES';
    celdaTotalLabel.className = 'celda-total-label';
    filaTotales.appendChild(celdaTotalLabel);
    
    const celdaTotalDebe = document.createElement('td');
    celdaTotalDebe.textContent = formatearMoneda(granTotalDebe);
    celdaTotalDebe.className = 'celda-numero texto-debe';
    filaTotales.appendChild(celdaTotalDebe);
    
    const celdaTotalHaber = document.createElement('td');
    celdaTotalHaber.textContent = formatearMoneda(granTotalHaber);
    celdaTotalHaber.className = 'celda-numero texto-haber';
    filaTotales.appendChild(celdaTotalHaber);
    
    const celdaTotalVacia = document.createElement('td');
    filaTotales.appendChild(celdaTotalVacia);
    
    pieTablaDiario.appendChild(filaTotales);
}

// =============================================================================
// FUNCIONES DEL LIBRO MAYOR
// =============================================================================

/**
 * Genera las opciones del selector de cuentas para el Libro Mayor.
 * Se ejecuta al cargar la página para llenar el select.
 */
function generarSelectorCuentasMayor() {
    // Limpiamos las opciones actuales (excepto la primera)
    while (selectorCuentaMayor.options.length > 1) {
        selectorCuentaMayor.remove(1);
    }
    
    // Agregamos una opción por cada cuenta del catálogo
    for (let i = 0; i < cuentas.length; i++) {
        const opcion = document.createElement('option');
        opcion.value = cuentas[i].nombre;
        opcion.textContent = cuentas[i].nombre;
        selectorCuentaMayor.appendChild(opcion);
    }
}

/**
 * Renderiza los esquemas de mayor (formato T) en el contenedor.
 * Si se especifica una cuenta, solo muestra esa. Si no, muestra todas.
 * 
 * @param {string} nombreCuentaFiltro - Nombre de la cuenta a filtrar, o 'todas'
 */
function renderizarLibroMayor(nombreCuentaFiltro) {
    // Limpiamos el contenido actual
    limpiarContenido(contenedorMayores);
    
    // Si no hay asientos, mostramos el mensaje de vacío
    if (asientos.length === 0) {
        mensajeSinDatosMayor.classList.remove('oculto');
        return;
    }
    
    mensajeSinDatosMayor.classList.add('oculto');
    
    // Determinamos qué cuentas mostrar
    const cuentasMostrar = [];
    
    if (nombreCuentaFiltro && nombreCuentaFiltro !== 'todas') {
        // Mostramos solo la cuenta seleccionada
        const cuenta = obtenerCuentaPorNombre(nombreCuentaFiltro);
        if (cuenta) {
            cuentasMostrar.push(cuenta);
        }
    } else {
        // Mostramos todas las cuentas que tienen movimientos
        for (let i = 0; i < cuentas.length; i++) {
            const movimientos = calcularMovimientosCuenta(cuentas[i].nombre);
            // Solo mostramos cuentas que tienen al menos un movimiento
            if (movimientos.totalDebe > 0 || movimientos.totalHaber > 0) {
                cuentasMostrar.push(cuentas[i]);
            }
        }
    }
    
    // Si no hay cuentas para mostrar, mostramos mensaje
    if (cuentasMostrar.length === 0) {
        mensajeSinDatosMayor.classList.remove('oculto');
        return;
    }
    
    // Renderizamos un esquema T por cada cuenta
    for (let i = 0; i < cuentasMostrar.length; i++) {
        const esquemaT = crearEsquemaMayor(cuentasMostrar[i]);
        contenedorMayores.appendChild(esquemaT);
    }
}

/**
 * Crea un esquema de mayor en formato T para una cuenta específica.
 * 
 * El formato T consiste en:
 * - Parte superior: nombre de la cuenta y su naturaleza
 * - Columna izquierda: movimientos al Debe
 * - Columna derecha: movimientos al Haber
 * - Parte inferior: saldo calculado según la naturaleza
 * 
 * @param {object} cuenta - El objeto cuenta del catálogo
 * @returns {HTMLElement} El elemento div con el esquema T completo
 */
function crearEsquemaMayor(cuenta) {
    // Obtenemos los movimientos de la cuenta
    const movimientos = calcularMovimientosCuenta(cuenta.nombre);
    
    // Obtenemos el saldo calculado
    const saldo = calcularSaldoCuenta(cuenta.nombre);
    
    // Creamos el contenedor principal del esquema T
    const contenedor = document.createElement('div');
    contenedor.className = 'esquema-mayor';
    
    // =================================================================
    // ENCABEZADO: Nombre de la cuenta y naturaleza
    // =================================================================
    const encabezado = document.createElement('div');
    encabezado.className = 'encabezado-mayor';
    
    const tituloCuenta = document.createElement('h3');
    tituloCuenta.className = 'titulo-cuenta-mayor';
    tituloCuenta.textContent = cuenta.nombre;
    encabezado.appendChild(tituloCuenta);
    
    const naturalezaCuenta = document.createElement('span');
    naturalezaCuenta.className = 'naturaleza-cuenta-mayor';
    naturalezaCuenta.textContent = cuenta.naturaleza === 'deudora' ? 'Cuenta Deudora' : 'Cuenta Acreedora';
    encabezado.appendChild(naturalezaCuenta);
    
    contenedor.appendChild(encabezado);
    
    // =================================================================
    // CUERPO: Dos columnas (Debe y Haber)
    // =================================================================
    const cuerpoMayor = document.createElement('div');
    cuerpoMayor.className = 'cuerpo-mayor';
    
    // Columna del Debe (izquierda)
    const columnaDebe = document.createElement('div');
    columnaDebe.className = 'columna-mayor columna-debe';
    
    const tituloDebe = document.createElement('div');
    tituloDebe.className = 'titulo-columna-mayor';
    tituloDebe.textContent = 'Debe';
    columnaDebe.appendChild(tituloDebe);
    
    // Agregamos los movimientos al Debe
    const movimientosDebe = obtenerMovimientosPorTipo(cuenta.nombre, 'debe');
    if (movimientosDebe.length === 0) {
        const vacioDebe = document.createElement('div');
        vacioDebe.className = 'movimiento-vacio';
        vacioDebe.textContent = '-';
        columnaDebe.appendChild(vacioDebe);
    } else {
        for (let i = 0; i < movimientosDebe.length; i++) {
            const movDiv = document.createElement('div');
            movDiv.className = 'movimiento-mayor';
            movDiv.textContent = formatearMoneda(movimientosDebe[i]);
            columnaDebe.appendChild(movDiv);
        }
    }
    
    // Total del Debe al final de la columna
    const totalDivDebe = document.createElement('div');
    totalDivDebe.className = 'total-columna-mayor';
    totalDivDebe.textContent = formatearMoneda(movimientos.totalDebe);
    columnaDebe.appendChild(totalDivDebe);
    
    cuerpoMayor.appendChild(columnaDebe);
    
    // Columna del Haber (derecha)
    const columnaHaber = document.createElement('div');
    columnaHaber.className = 'columna-mayor columna-haber';
    
    const tituloHaber = document.createElement('div');
    tituloHaber.className = 'titulo-columna-mayor';
    tituloHaber.textContent = 'Haber';
    columnaHaber.appendChild(tituloHaber);
    
    // Agregamos los movimientos al Haber
    const movimientosHaber = obtenerMovimientosPorTipo(cuenta.nombre, 'haber');
    if (movimientosHaber.length === 0) {
        const vacioHaber = document.createElement('div');
        vacioHaber.className = 'movimiento-vacio';
        vacioHaber.textContent = '-';
        columnaHaber.appendChild(vacioHaber);
    } else {
        for (let i = 0; i < movimientosHaber.length; i++) {
            const movDiv = document.createElement('div');
            movDiv.className = 'movimiento-mayor';
            movDiv.textContent = formatearMoneda(movimientosHaber[i]);
            columnaHaber.appendChild(movDiv);
        }
    }
    
    // Total del Haber al final de la columna
    const totalDivHaber = document.createElement('div');
    totalDivHaber.className = 'total-columna-mayor';
    totalDivHaber.textContent = formatearMoneda(movimientos.totalHaber);
    columnaHaber.appendChild(totalDivHaber);
    
    cuerpoMayor.appendChild(columnaHaber);
    
    contenedor.appendChild(cuerpoMayor);
    
    // =================================================================
    // PIE: Saldo calculado
    // =================================================================
    const pieMayor = document.createElement('div');
    pieMayor.className = 'pie-mayor';
    
    // El saldo se muestra del lado que corresponda según su tipo
    const saldoIzquierda = document.createElement('div');
    saldoIzquierda.className = 'saldo-mayor';
    
    const saldoDerecha = document.createElement('div');
    saldoDerecha.className = 'saldo-mayor';
    
    if (saldo.tipoSaldo === 'deudor') {
        // Saldo deudor: se muestra en la columna del Debe (izquierda)
        saldoIzquierda.innerHTML = '<span class="etiqueta-saldo">Saldo Deudor:</span> <span class="valor-saldo">' + formatearMoneda(saldo.saldo) + '</span>';
        saldoDerecha.innerHTML = '<span class="etiqueta-saldo">Saldo Acreedor:</span> <span class="valor-saldo">-</span>';
    } else {
        // Saldo acreedor: se muestra en la columna del Haber (derecha)
        saldoIzquierda.innerHTML = '<span class="etiqueta-saldo">Saldo Deudor:</span> <span class="valor-saldo">-</span>';
        saldoDerecha.innerHTML = '<span class="etiqueta-saldo">Saldo Acreedor:</span> <span class="valor-saldo">' + formatearMoneda(saldo.saldo) + '</span>';
    }
    
    pieMayor.appendChild(saldoIzquierda);
    pieMayor.appendChild(saldoDerecha);
    
    contenedor.appendChild(pieMayor);
    
    return contenedor;
}

/**
 * Obtiene todos los montos de movimientos de una cuenta filtrados por tipo.
 * 
 * @param {string} nombreCuenta - Nombre de la cuenta
 * @param {string} tipo - 'debe' o 'haber'
 * @returns {number[]} Array con los montos de los movimientos
 */
function obtenerMovimientosPorTipo(nombreCuenta, tipo) {
    const movimientos = [];
    
    for (let i = 0; i < asientos.length; i++) {
        const asiento = asientos[i];
        for (let j = 0; j < asiento.lineas.length; j++) {
            const linea = asiento.lineas[j];
            if (linea.cuenta === nombreCuenta && linea.tipo === tipo) {
                movimientos.push(linea.monto);
            }
        }
    }
    
    return movimientos;
}

// =============================================================================
// FUNCIONES DEL RESUMEN DE SALDOS
// =============================================================================

/**
 * Renderiza la tabla de resumen de saldos con todas las cuentas.
 * Muestra: cuenta, tipo, naturaleza, total debe, total haber, saldo y tipo de saldo.
 */
function renderizarResumenSaldos() {
    // Limpiamos el contenido actual
    limpiarContenido(cuerpoResumenSaldos);
    
    // Si no hay cuentas, mostramos el mensaje de vacío
    if (cuentas.length === 0) {
        mensajeSinSaldos.classList.remove('oculto');
        document.getElementById('tabla-resumen-saldos').style.display = 'none';
        return;
    }
    
    mensajeSinSaldos.classList.add('oculto');
    document.getElementById('tabla-resumen-saldos').style.display = 'table';
    
    // Recorremos todas las cuentas del catálogo
    for (let i = 0; i < cuentas.length; i++) {
        const cuenta = cuentas[i];
        const movimientos = calcularMovimientosCuenta(cuenta.nombre);
        const saldo = calcularSaldoCuenta(cuenta.nombre);
        
        // Solo mostramos cuentas que tienen movimientos
        if (movimientos.totalDebe === 0 && movimientos.totalHaber === 0) {
            continue;
        }
        
        const fila = document.createElement('tr');
        
        // Celda del nombre de la cuenta
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cuenta.nombre;
        fila.appendChild(celdaNombre);
        
        // Celda del tipo
        const celdaTipo = document.createElement('td');
        celdaTipo.textContent = cuenta.tipo;
        fila.appendChild(celdaTipo);
        
        // Celda de la naturaleza
        const celdaNaturaleza = document.createElement('td');
        celdaNaturaleza.textContent = cuenta.naturaleza === 'deudora' ? 'Deudora' : 'Acreedora';
        fila.appendChild(celdaNaturaleza);
        
        // Celda del total Debe
        const celdaTotalDebe = document.createElement('td');
        celdaTotalDebe.className = 'celda-numero';
        celdaTotalDebe.textContent = formatearMoneda(movimientos.totalDebe);
        fila.appendChild(celdaTotalDebe);
        
        // Celda del total Haber
        const celdaTotalHaber = document.createElement('td');
        celdaTotalHaber.className = 'celda-numero';
        celdaTotalHaber.textContent = formatearMoneda(movimientos.totalHaber);
        fila.appendChild(celdaTotalHaber);
        
        // Celda del saldo
        const celdaSaldo = document.createElement('td');
        celdaSaldo.className = 'celda-numero';
        celdaSaldo.textContent = formatearMoneda(saldo.saldo);
        fila.appendChild(celdaSaldo);
        
        // Celda del tipo de saldo
        const celdaTipoSaldo = document.createElement('td');
        if (saldo.tipoSaldo === 'deudor') {
            celdaTipoSaldo.innerHTML = '<span class="indicador-saldo saldo-deudor">Deudor</span>';
        } else {
            celdaTipoSaldo.innerHTML = '<span class="indicador-saldo saldo-acreedor">Acreedor</span>';
        }
        fila.appendChild(celdaTipoSaldo);
        
        cuerpoResumenSaldos.appendChild(fila);
    }
}

// =============================================================================
// MANEJADORES DE EVENTOS
// =============================================================================

/**
 * Inicializa todos los event listeners de la página.
 */
function inicializarEventos() {
    
    // Evento click en la pestaña del Libro Diario
    pestanaDiario.addEventListener('click', function() {
        cambiarPestana('diario');
    });
    
    // Evento click en la pestaña del Libro Mayor
    pestanaMayor.addEventListener('click', function() {
        cambiarPestana('mayor');
    });
    
    // Evento change en el selector de cuentas del mayor
    selectorCuentaMayor.addEventListener('change', function() {
        renderizarLibroMayor(this.value);
    });
    
    // Evento click en el botón imprimir diario
    botonImprimirDiario.addEventListener('click', imprimirPagina);
    
    // Evento click en el botón imprimir mayor
    botonImprimirMayor.addEventListener('click', imprimirPagina);
}

// =============================================================================
// INICIALIZACIÓN DE LA PÁGINA
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Generamos las opciones del selector de cuentas
    generarSelectorCuentasMayor();
    
    // Renderizamos el Libro Diario
    renderizarLibroDiario();
    
    // Renderizamos el Libro Mayor (todas las cuentas por defecto)
    renderizarLibroMayor('todas');
    
    // Renderizamos el resumen de saldos
    renderizarResumenSaldos();
    
    // Configuramos todos los event listeners
    inicializarEventos();
});
