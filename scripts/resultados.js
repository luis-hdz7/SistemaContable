/**
 * =============================================================================
 * resultados.js - Lógica de la página Resultados
 * =============================================================================
 * 
 * Este archivo contiene toda la funcionalidad de la página resultados.html:
 * generar la balanza de comprobación, calcular el análisis de la operación,
 * y coordinar el dibujo de los gráficos.
 * 
 * La balanza de comprobación verifica que:
 * Suma de saldos deudores = Suma de saldos acreedores
 * 
 * El análisis de la operación calcula paso a paso:
 * 1. Ventas Netas = Ventas - Devoluciones sobre ventas - Descuentos sobre ventas
 * 2. Compras Totales = Compras + Gastos de compra
 * 3. Compras Netas = Compras Totales - Devoluciones sobre compras - Descuentos sobre compras
 * 4. Suma Total de Mercancía = Inventario Inicial + Compras Netas
 * 5. Costo de lo Vendido = Suma Total de Mercancía - Inventario Final
 * 6. Utilidad Bruta = Ventas Netas - Costo de lo Vendido
 */

// =============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// =============================================================================

/** Cuerpo de la tabla de balanza de comprobación */
const cuerpoTablaBalanza = document.getElementById('cuerpo-tabla-balanza');

/** Pie de la tabla de balanza (totales) */
const pieTablaBalanza = document.getElementById('pie-tabla-balanza');

/** Indicador visual de si la balanza cuadra o no */
const indicadorBalanza = document.getElementById('indicador-balanza');

/** Mensaje cuando no hay datos para la balanza */
const mensajeSinDatosBalanza = document.getElementById('mensaje-sin-datos-balanza');

/** Contenedor del análisis de la operación */
const contenedorAnalisis = document.getElementById('contenedor-analisis');

/** Mensaje cuando no hay datos para el análisis */
const mensajeSinDatosAnalisis = document.getElementById('mensaje-sin-datos-analisis');

/** Mensaje cuando no hay datos para los gráficos */
const mensajeSinDatosGraficos = document.getElementById('mensaje-sin-datos-graficos');

/** Botón para imprimir la página */
const botonImprimir = document.getElementById('boton-imprimir');

/** Canvas para gráfico de barras Debe vs Haber */
const canvasBarrasDebeHaber = document.getElementById('canvas-barras-debe-haber');

/** Canvas para gráfico de pastel por tipos */
const canvasPastelTipos = document.getElementById('canvas-pastel-tipos');

/** Canvas para gráfico de barras del análisis */
const canvasBarrasAnalisis = document.getElementById('canvas-barras-analisis');

/** Canvas para gráfico de líneas de Caja */
const canvasLineasCaja = document.getElementById('canvas-lineas-caja');

// =============================================================================
// FUNCIONES DE LA BALANZA DE COMPROBACIÓN
// =============================================================================

/**
 * Genera la balanza de comprobación con los datos actuales.
 * Calcula movimientos totales y saldos para cada cuenta.
 * Verifica que los totales de saldos deudores igualen a los acreedores.
 */
function generarBalanza() {
    // Limpiamos el contenido actual
    limpiarContenido(cuerpoTablaBalanza);
    limpiarContenido(pieTablaBalanza);
    
    // Si no hay asientos, mostramos el mensaje de vacío
    if (asientos.length === 0) {
        mensajeSinDatosBalanza.classList.remove('oculto');
        document.getElementById('tabla-balanza').style.display = 'none';
        indicadorBalanza.className = 'indicador-estado oculto';
        return;
    }
    
    // Hay datos: ocultamos el mensaje y mostramos la tabla
    mensajeSinDatosBalanza.classList.add('oculto');
    document.getElementById('tabla-balanza').style.display = 'table';
    
    let totalMovimientosDeudor = 0;
    let totalMovimientosAcreedor = 0;
    let totalSaldosDeudor = 0;
    let totalSaldosAcreedor = 0;
    
    // Recorremos todas las cuentas del catálogo
    for (let i = 0; i < cuentas.length; i++) {
        const cuenta = cuentas[i];
        const movimientos = calcularMovimientosCuenta(cuenta.nombre);
        const saldo = calcularSaldoCuenta(cuenta.nombre);
        
        // Solo mostramos cuentas que tienen movimientos
        if (movimientos.totalDebe === 0 && movimientos.totalHaber === 0) {
            continue;
        }
        
        // Creamos la fila de la tabla
        const fila = document.createElement('tr');
        
        // Celda del nombre de la cuenta
        const celdaCuenta = document.createElement('td');
        celdaCuenta.textContent = cuenta.nombre;
        fila.appendChild(celdaCuenta);
        
        // Celda de movimientos deudor
        const celdaMovDeudor = document.createElement('td');
        celdaMovDeudor.className = 'celda-numero';
        celdaMovDeudor.textContent = formatearMoneda(movimientos.totalDebe);
        fila.appendChild(celdaMovDeudor);
        
        // Celda de movimientos acreedor
        const celdaMovAcreedor = document.createElement('td');
        celdaMovAcreedor.className = 'celda-numero';
        celdaMovAcreedor.textContent = formatearMoneda(movimientos.totalHaber);
        fila.appendChild(celdaMovAcreedor);
        
        // Celda de saldo deudor
        const celdaSaldoDeudor = document.createElement('td');
        celdaSaldoDeudor.className = 'celda-numero';
        if (saldo.tipoSaldo === 'deudor') {
            celdaSaldoDeudor.textContent = formatearMoneda(saldo.saldo);
            totalSaldosDeudor += saldo.saldo;
        } else {
            celdaSaldoDeudor.textContent = '-';
        }
        fila.appendChild(celdaSaldoDeudor);
        
        // Celda de saldo acreedor
        const celdaSaldoAcreedor = document.createElement('td');
        celdaSaldoAcreedor.className = 'celda-numero';
        if (saldo.tipoSaldo === 'acreedor') {
            celdaSaldoAcreedor.textContent = formatearMoneda(saldo.saldo);
            totalSaldosAcreedor += saldo.saldo;
        } else {
            celdaSaldoAcreedor.textContent = '-';
        }
        fila.appendChild(celdaSaldoAcreedor);
        
        cuerpoTablaBalanza.appendChild(fila);
        
        // Acumulamos los totales de movimientos
        totalMovimientosDeudor += movimientos.totalDebe;
        totalMovimientosAcreedor += movimientos.totalHaber;
    }
    
    // Creamos la fila de totales en el pie de la tabla
    const filaTotales = document.createElement('tr');
    filaTotales.className = 'fila-totales';
    
    const celdaTotalLabel = document.createElement('td');
    celdaTotalLabel.textContent = 'TOTALES';
    celdaTotalLabel.className = 'celda-total-label';
    filaTotales.appendChild(celdaTotalLabel);
    
    const celdaTotalMovDeudor = document.createElement('td');
    celdaTotalMovDeudor.textContent = formatearMoneda(totalMovimientosDeudor);
    celdaTotalMovDeudor.className = 'celda-numero';
    filaTotales.appendChild(celdaTotalMovDeudor);
    
    const celdaTotalMovAcreedor = document.createElement('td');
    celdaTotalMovAcreedor.textContent = formatearMoneda(totalMovimientosAcreedor);
    celdaTotalMovAcreedor.className = 'celda-numero';
    filaTotales.appendChild(celdaTotalMovAcreedor);
    
    const celdaTotalSaldoDeudor = document.createElement('td');
    celdaTotalSaldoDeudor.textContent = formatearMoneda(totalSaldosDeudor);
    celdaTotalSaldoDeudor.className = 'celda-numero';
    filaTotales.appendChild(celdaTotalSaldoDeudor);
    
    const celdaTotalSaldoAcreedor = document.createElement('td');
    celdaTotalSaldoAcreedor.textContent = formatearMoneda(totalSaldosAcreedor);
    celdaTotalSaldoAcreedor.className = 'celda-numero';
    filaTotales.appendChild(celdaTotalSaldoAcreedor);
    
    pieTablaBalanza.appendChild(filaTotales);
    
    // Actualizamos el indicador de estado
    actualizarIndicadorBalanza(totalSaldosDeudor, totalSaldosAcreedor);
}

/**
 * Actualiza el indicador visual de la balanza.
 * Muestra "La balanza cuadra" en verde si los totales son iguales,
 * o "La balanza no cuadra" en rojo si son diferentes.
 * 
 * @param {number} totalDeudor - Suma de saldos deudores
 * @param {number} totalAcreedor - Suma de saldos acreedores
 */
function actualizarIndicadorBalanza(totalDeudor, totalAcreedor) {
    indicadorBalanza.classList.remove('oculto');
    
    if (totalDeudor === totalAcreedor && totalDeudor > 0) {
        indicadorBalanza.textContent = 'La balanza cuadra';
        indicadorBalanza.className = 'indicador-estado cuadra';
    } else {
        indicadorBalanza.textContent = 'La balanza no cuadra, revisa tus asientos';
        indicadorBalanza.className = 'indicador-estado no-cuadra';
    }
}

// =============================================================================
// FUNCIONES DEL ANÁLISIS DE LA OPERACIÓN
// =============================================================================

/**
 * Calcula y renderiza el análisis de la operación paso a paso.
 * Obtiene los valores de las cuentas necesarias de los asientos registrados.
 */
function generarAnalisisOperacion() {
    // Limpiamos el contenido actual
    limpiarContenido(contenedorAnalisis);
    
    // Si no hay asientos, mostramos el mensaje de vacío
    if (asientos.length === 0) {
        mensajeSinDatosAnalisis.classList.remove('oculto');
        return;
    }
    
    mensajeSinDatosAnalisis.classList.add('oculto');
    
    // Obtenemos los valores necesarios de las cuentas
    const valorVentas = obtenerValorCuenta('Ventas');
    const valorDevVentas = obtenerValorCuenta('Devoluciones sobre ventas');
    const valorDescVentas = obtenerValorCuenta('Descuentos sobre ventas');
    const valorCompras = obtenerValorCuenta('Compras');
    const valorGastosCompra = obtenerValorCuenta('Gastos de compra');
    const valorDevCompras = obtenerValorCuenta('Devoluciones sobre compras');
    const valorDescCompras = obtenerValorCuenta('Descuentos sobre compras');
    
    // Calculamos cada paso del análisis
    
    // Paso 1: Ventas Netas
    const ventasNetas = valorVentas - valorDevVentas - valorDescVentas;
    
    // Paso 2: Compras Totales
    const comprasTotales = valorCompras + valorGastosCompra;
    
    // Paso 3: Compras Netas
    const comprasNetas = comprasTotales - valorDevCompras - valorDescCompras;
    
    // Paso 4: Suma Total de Mercancía
    const sumaTotalMercancia = inventarioInicial + comprasNetas;
    
    // Paso 5: Costo de lo Vendido
    const costoVendido = sumaTotalMercancia - inventarioFinal;
    
    // Paso 6: Utilidad Bruta
    const utilidadBruta = ventasNetas - costoVendido;
    
    // Creamos el HTML del análisis paso a paso
    const pasos = [
        {
            titulo: 'Ventas Netas',
            formula: 'Ventas - Devoluciones sobre ventas - Descuentos sobre ventas',
            calculo: formatearMoneda(valorVentas) + ' - ' + formatearMoneda(valorDevVentas) + ' - ' + formatearMoneda(valorDescVentas),
            resultado: ventasNetas,
            clase: 'paso-ingreso'
        },
        {
            titulo: 'Compras Totales',
            formula: 'Compras + Gastos de compra',
            calculo: formatearMoneda(valorCompras) + ' + ' + formatearMoneda(valorGastosCompra),
            resultado: comprasTotales,
            clase: 'paso-costo'
        },
        {
            titulo: 'Compras Netas',
            formula: 'Compras Totales - Devoluciones sobre compras - Descuentos sobre compras',
            calculo: formatearMoneda(comprasTotales) + ' - ' + formatearMoneda(valorDevCompras) + ' - ' + formatearMoneda(valorDescCompras),
            resultado: comprasNetas,
            clase: 'paso-costo'
        },
        {
            titulo: 'Suma Total de Mercancía',
            formula: 'Inventario Inicial + Compras Netas',
            calculo: formatearMoneda(inventarioInicial) + ' + ' + formatearMoneda(comprasNetas),
            resultado: sumaTotalMercancia,
            clase: 'paso-inventario'
        },
        {
            titulo: 'Costo de lo Vendido',
            formula: 'Suma Total de Mercancía - Inventario Final',
            calculo: formatearMoneda(sumaTotalMercancia) + ' - ' + formatearMoneda(inventarioFinal),
            resultado: costoVendido,
            clase: 'paso-costo'
        },
        {
            titulo: 'Utilidad Bruta',
            formula: 'Ventas Netas - Costo de lo Vendido',
            calculo: formatearMoneda(ventasNetas) + ' - ' + formatearMoneda(costoVendido),
            resultado: utilidadBruta,
            clase: utilidadBruta >= 0 ? 'paso-ganancia' : 'paso-perdida'
        }
    ];
    
    // Renderizamos cada paso
    for (let i = 0; i < pasos.length; i++) {
        const paso = pasos[i];
        const elementoPaso = crearElementoPaso(paso);
        contenedorAnalisis.appendChild(elementoPaso);
    }
}

/**
 * Obtiene el valor total de una cuenta sumando todos sus movimientos.
 * Para cuentas deudoras suma el Debe, para acreedoras suma el Haber.
 * 
 * @param {string} nombreCuenta - Nombre de la cuenta
 * @returns {number} El valor total de la cuenta
 */
function obtenerValorCuenta(nombreCuenta) {
    const movimientos = calcularMovimientosCuenta(nombreCuenta);
    const cuenta = obtenerCuentaPorNombre(nombreCuenta);
    
    if (!cuenta) return 0;
    
    // Para el análisis, usamos el valor bruto según el tipo de cuenta
    if (cuenta.naturaleza === 'deudora') {
        return movimientos.totalDebe;
    } else {
        return movimientos.totalHaber;
    }
}

/**
 * Crea el elemento HTML para un paso del análisis.
 * 
 * @param {object} paso - Objeto con titulo, formula, calculo, resultado, clase
 * @returns {HTMLElement} El elemento div del paso
 */
function crearElementoPaso(paso) {
    const contenedor = document.createElement('div');
    contenedor.className = 'paso-analisis ' + paso.clase;
    
    const titulo = document.createElement('h4');
    titulo.className = 'titulo-paso';
    titulo.textContent = paso.titulo;
    contenedor.appendChild(titulo);
    
    const formula = document.createElement('p');
    formula.className = 'formula-paso';
    formula.innerHTML = '<strong>Fórmula:</strong> ' + paso.formula;
    contenedor.appendChild(formula);
    
    const calculo = document.createElement('p');
    calculo.className = 'calculo-paso';
    calculo.innerHTML = '<strong>Cálculo:</strong> ' + paso.calculo;
    contenedor.appendChild(calculo);
    
    const resultado = document.createElement('div');
    resultado.className = 'resultado-paso';
    resultado.innerHTML = '<span class="etiqueta-resultado">Resultado:</span> <span class="valor-resultado">' + formatearMoneda(paso.resultado) + '</span>';
    contenedor.appendChild(resultado);
    
    return contenedor;
}

// =============================================================================
// FUNCIONES DE GRÁFICOS
// =============================================================================

/**
 * Coordina el dibujo de todos los gráficos.
 * Verifica que haya datos antes de intentar dibujar.
 */
function dibujarTodosGraficos() {
    if (asientos.length === 0) {
        mensajeSinDatosGraficos.classList.remove('oculto');
        ocultarContenedoresGraficos();
        return;
    }
    
    mensajeSinDatosGraficos.classList.add('oculto');
    mostrarContenedoresGraficos();
    
    // Gráfico 1: Barras Debe vs Haber por cuenta
    dibujarGraficoBarrasDebeHaber(canvasBarrasDebeHaber);
    
    // Gráfico 2: Pastel por tipos de cuenta
    dibujarGraficoPastelTipos(canvasPastelTipos);
    
    // Gráfico 3: Barras del análisis de la operación
    dibujarGraficoBarrasAnalisis(canvasBarrasAnalisis);
    
    // Gráfico 4: Líneas evolución de Caja
    dibujarGraficoLineasCaja(canvasLineasCaja);
}

/**
 * Oculta todos los contenedores de gráficos.
 */
function ocultarContenedoresGraficos() {
    const contenedores = document.querySelectorAll('.contenedor-grafico');
    for (let i = 0; i < contenedores.length; i++) {
        contenedores[i].style.display = 'none';
    }
}

/**
 * Muestra todos los contenedores de gráficos.
 */
function mostrarContenedoresGraficos() {
    const contenedores = document.querySelectorAll('.contenedor-grafico');
    for (let i = 0; i < contenedores.length; i++) {
        contenedores[i].style.display = 'block';
    }
}

// =============================================================================
// MANEJADORES DE EVENTOS
// =============================================================================

/**
 * Inicializa todos los event listeners de la página.
 */
function inicializarEventos() {
    botonImprimir.addEventListener('click', imprimirPagina);
}

// =============================================================================
// INICIALIZACIÓN DE LA PÁGINA
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Generamos la balanza de comprobación
    generarBalanza();
    
    // Generamos el análisis de la operación
    generarAnalisisOperacion();
    
    // Dibujamos todos los gráficos
    dibujarTodosGraficos();
    
    // Configuramos los event listeners
    inicializarEventos();
});
