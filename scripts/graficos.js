/**
 * =============================================================================
 * graficos.js - Funciones de dibujo con Canvas API
 * =============================================================================
 * 
 * Este archivo contiene las funciones para dibujar gráficos simples
 * usando la Canvas API de HTML5, sin librerías externas.
 * 
 * Se usan métodos básicos de Canvas:
 * - fillRect: dibujar rectángulos rellenos (barras)
 * - arc: dibujar arcos (sectores del pastel)
 * - lineTo / moveTo: dibujar líneas (gráfico de líneas)
 * - stroke / fill: trazar o rellenar formas
 * - fillText: escribir texto en el canvas
 * 
 * Los gráficos se adaptan al tamaño del canvas y usan colores de la
 * paleta definida en principal.css para mantener consistencia visual.
 */

// =============================================================================
// COLORES Y CONFIGURACIÓN
// =============================================================================

/** Paleta de colores para los gráficos */
const coloresGraficos = {
    principal: '#1a5276',
    secundario: '#2ecc71',
    acento: '#e67e22',
    debe: '#c0392b',
    haber: '#27ae60',
    texto: '#2c3e50',
    textoSecundario: '#7f8c8d',
    fondo: '#ffffff',
    grid: '#e0e0e0',
    pastel: ['#1a5276', '#2ecc71', '#e67e22', '#c0392b', '#8e44ad', '#16a085', '#d35400', '#27ae60']
};

/** Configuración general de márgenes para los gráficos */
const margenes = {
    superior: 40,
    inferior: 60,
    izquierdo: 80,
    derecho: 40
};

// =============================================================================
// FUNCIÓN AUXILIAR: ESCALAR CANVAS PARA PANTALLAS RETINA
// =============================================================================

/**
 * Ajusta el tamaño del canvas para que se vea nítido en pantallas de alta densidad.
 * Multiplica el tamaño interno por el devicePixelRatio y escala el contexto.
 * 
 * @param {HTMLCanvasElement} canvas - El elemento canvas a ajustar
 * @returns {CanvasRenderingContext2D} El contexto 2D escalado
 */
function obtenerContextoEscalado(canvas) {
    const rect = canvas.getBoundingClientRect();
    const escala = window.devicePixelRatio || 1;
    
    // Ajustamos el tamaño interno del canvas
    canvas.width = rect.width * escala;
    canvas.height = rect.height * escala;
    
    // Obtenemos el contexto y escalamos
    const contexto = canvas.getContext('2d');
    contexto.scale(escala, escala);
    
    return contexto;
}

/**
 * Obtiene las dimensiones lógicas del canvas (sin escala de pantalla).
 * 
 * @param {HTMLCanvasElement} canvas - El elemento canvas
 * @returns {object} Objeto con ancho y alto lógicos
 */
function obtenerDimensiones(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        ancho: rect.width,
        alto: rect.height
    };
}

// =============================================================================
// GRÁFICO 1: BARRAS VERTICALES - DEBE VS HABER POR CUENTA
// =============================================================================

/**
 * Dibuja un gráfico de barras verticales comparando el total Debe y Haber
 * de cada cuenta que tiene movimientos.
 * 
 * @param {HTMLCanvasElement} canvas - El elemento canvas donde dibujar
 */
function dibujarGraficoBarrasDebeHaber(canvas) {
    const contexto = obtenerContextoEscalado(canvas);
    const dims = obtenerDimensiones(canvas);
    
    // Limpiamos el canvas
    contexto.clearRect(0, 0, dims.ancho, dims.alto);
    
    // Preparamos los datos: cuentas con movimientos
    const datos = [];
    for (let i = 0; i < cuentas.length; i++) {
        const movimientos = calcularMovimientosCuenta(cuentas[i].nombre);
        if (movimientos.totalDebe > 0 || movimientos.totalHaber > 0) {
            datos.push({
                nombre: cuentas[i].nombre,
                debe: movimientos.totalDebe,
                haber: movimientos.totalHaber
            });
        }
    }
    
    // Si no hay datos, mostramos mensaje
    if (datos.length === 0) {
        dibujarMensajeVacio(contexto, dims, 'No hay datos para mostrar');
        return;
    }
    
    // Calculamos el máximo valor para escalar las barras
    let valorMaximo = 0;
    for (let i = 0; i < datos.length; i++) {
        if (datos[i].debe > valorMaximo) valorMaximo = datos[i].debe;
        if (datos[i].haber > valorMaximo) valorMaximo = datos[i].haber;
    }
    
    // Añadimos un 10% de margen al máximo
    valorMaximo = valorMaximo * 1.1;
    
    // Dimensiones del área de dibujo
    const anchoArea = dims.ancho - margenes.izquierdo - margenes.derecho;
    const altoArea = dims.alto - margenes.superior - margenes.inferior;
    
    // Ancho de cada grupo de barras
    const anchoGrupo = anchoArea / datos.length;
    const anchoBarra = anchoGrupo * 0.35;
    const separacionBarras = anchoGrupo * 0.1;
    
    // Dibujamos los ejes
    dibujarEjes(contexto, dims, valorMaximo, datos.length, true);
    
    // Dibujamos las barras
    for (let i = 0; i < datos.length; i++) {
        const dato = datos[i];
        const xGrupo = margenes.izquierdo + (i * anchoGrupo);
        const xCentro = xGrupo + (anchoGrupo / 2);
        
        // Altura de la barra del Debe
        const alturaDebe = (dato.debe / valorMaximo) * altoArea;
        const yDebe = margenes.superior + altoArea - alturaDebe;
        
        // Altura de la barra del Haber
        const alturaHaber = (dato.haber / valorMaximo) * altoArea;
        const yHaber = margenes.superior + altoArea - alturaHaber;
        
        // Dibujamos barra del Debe (rojo)
        contexto.fillStyle = coloresGraficos.debe;
        contexto.fillRect(xCentro - anchoBarra - separacionBarras, yDebe, anchoBarra, alturaDebe);
        
        // Dibujamos barra del Haber (verde)
        contexto.fillStyle = coloresGraficos.haber;
        contexto.fillRect(xCentro + separacionBarras, yHaber, anchoBarra, alturaHaber);
        
        // Etiqueta del nombre de la cuenta (rotada 45 grados)
        contexto.save();
        contexto.translate(xCentro, dims.alto - margenes.inferior + 20);
        contexto.rotate(-Math.PI / 4);
        contexto.fillStyle = coloresGraficos.texto;
        contexto.font = '11px "Segoe UI", sans-serif';
        contexto.textAlign = 'right';
        contexto.fillText(truncarTexto(dato.nombre, 15), 0, 0);
        contexto.restore();
    }
    
    // Leyenda
    dibujarLeyenda(contexto, dims, [
        { color: coloresGraficos.debe, texto: 'Debe' },
        { color: coloresGraficos.haber, texto: 'Haber' }
    ]);
}

// =============================================================================
// GRÁFICO 2: PASTEL - DISTRIBUCIÓN DE SALDOS POR TIPO DE CUENTA
// =============================================================================

/**
 * Dibuja un gráfico de pastel (circular) mostrando la distribución de los
 * saldos finales agrupados por tipo de cuenta.
 * 
 * @param {HTMLCanvasElement} canvas - El elemento canvas donde dibujar
 */
function dibujarGraficoPastelTipos(canvas) {
    const contexto = obtenerContextoEscalado(canvas);
    const dims = obtenerDimensiones(canvas);
    
    // Limpiamos el canvas
    contexto.clearRect(0, 0, dims.ancho, dims.alto);
    
    // Agrupamos los saldos por tipo de cuenta
    const saldosPorTipo = {};
    
    for (let i = 0; i < cuentas.length; i++) {
        const cuenta = cuentas[i];
        const saldo = calcularSaldoCuenta(cuenta.nombre);
        
        // Solo consideramos cuentas con saldo
        if (saldo.saldo > 0) {
            const tipo = cuenta.tipo;
            if (!saldosPorTipo[tipo]) {
                saldosPorTipo[tipo] = 0;
            }
            saldosPorTipo[tipo] += saldo.saldo;
        }
    }
    
    // Convertimos a array para procesar
    const datos = [];
    let totalGeneral = 0;
    for (let tipo in saldosPorTipo) {
        datos.push({ tipo: tipo, valor: saldosPorTipo[tipo] });
        totalGeneral += saldosPorTipo[tipo];
    }
    
    // Si no hay datos, mostramos mensaje
    if (datos.length === 0) {
        dibujarMensajeVacio(contexto, dims, 'No hay datos para mostrar');
        return;
    }
    
    // Calculamos el centro y radio del pastel
    const centroX = (dims.ancho / 2) - 60; // Desplazado a la izquierda para la leyenda
    const centroY = dims.alto / 2;
    const radio = Math.min(centroX, centroY) - 20;
    
    // Dibujamos los sectores
    let anguloInicio = -Math.PI / 2; // Empezamos desde arriba
    
    for (let i = 0; i < datos.length; i++) {
        const dato = datos[i];
        const porcentaje = dato.valor / totalGeneral;
        const anguloSector = porcentaje * 2 * Math.PI;
        const anguloFin = anguloInicio + anguloSector;
        
        // Color del sector
        const color = coloresGraficos.pastel[i % coloresGraficos.pastel.length];
        
        // Dibujamos el sector
        contexto.beginPath();
        contexto.moveTo(centroX, centroY);
        contexto.arc(centroX, centroY, radio, anguloInicio, anguloFin);
        contexto.closePath();
        contexto.fillStyle = color;
        contexto.fill();
        
        // Borde del sector
        contexto.strokeStyle = '#ffffff';
        contexto.lineWidth = 2;
        contexto.stroke();
        
        // Etiqueta de porcentaje en el centro del sector
        const anguloMedio = anguloInicio + (anguloSector / 2);
        const xEtiqueta = centroX + Math.cos(anguloMedio) * (radio * 0.7);
        const yEtiqueta = centroY + Math.sin(anguloMedio) * (radio * 0.7);
        
        contexto.fillStyle = '#ffffff';
        contexto.font = 'bold 12px "Segoe UI", sans-serif';
        contexto.textAlign = 'center';
        contexto.textBaseline = 'middle';
        contexto.fillText(Math.round(porcentaje * 100) + '%', xEtiqueta, yEtiqueta);
        
        anguloInicio = anguloFin;
    }
    
    // Dibujamos la leyenda a la derecha
    const xLeyenda = centroX + radio + 30;
    let yLeyenda = centroY - ((datos.length * 24) / 2);
    
    for (let i = 0; i < datos.length; i++) {
        const dato = datos[i];
        const color = coloresGraficos.pastel[i % coloresGraficos.pastel.length];
        
        // Cuadro de color
        contexto.fillStyle = color;
        contexto.fillRect(xLeyenda, yLeyenda, 16, 16);
        
        // Texto del tipo
        contexto.fillStyle = coloresGraficos.texto;
        contexto.font = '12px "Segoe UI", sans-serif';
        contexto.textAlign = 'left';
        contexto.textBaseline = 'middle';
        contexto.fillText(truncarTexto(dato.tipo, 12) + ': ' + formatearMoneda(dato.valor), xLeyenda + 24, yLeyenda + 8);
        
        yLeyenda += 24;
    }
}

// =============================================================================
// GRÁFICO 3: BARRAS HORIZONTALES - ANÁLISIS DE LA OPERACIÓN
// =============================================================================

/**
 * Dibuja un gráfico de barras horizontales con los valores del análisis
 * de la operación: Ventas Netas, Costo de lo Vendido, Utilidad Bruta.
 * 
 * @param {HTMLCanvasElement} canvas - El elemento canvas donde dibujar
 */
function dibujarGraficoBarrasAnalisis(canvas) {
    const contexto = obtenerContextoEscalado(canvas);
    const dims = obtenerDimensiones(canvas);
    
    // Limpiamos el canvas
    contexto.clearRect(0, 0, dims.ancho, dims.alto);
    
    // Obtenemos los valores del análisis
    const valorVentas = obtenerValorCuenta('Ventas');
    const valorDevVentas = obtenerValorCuenta('Devoluciones sobre ventas');
    const valorDescVentas = obtenerValorCuenta('Descuentos sobre ventas');
    const ventasNetas = valorVentas - valorDevVentas - valorDescVentas;
    
    const valorCompras = obtenerValorCuenta('Compras');
    const valorGastosCompra = obtenerValorCuenta('Gastos de compra');
    const comprasTotales = valorCompras + valorGastosCompra;
    const valorDevCompras = obtenerValorCuenta('Devoluciones sobre compras');
    const valorDescCompras = obtenerValorCuenta('Descuentos sobre compras');
    const comprasNetas = comprasTotales - valorDevCompras - valorDescCompras;
    const costoVendido = (inventarioInicial + comprasNetas) - inventarioFinal;
    const utilidadBruta = ventasNetas - costoVendido;
    
    // Datos para el gráfico
    const datos = [
        { nombre: 'Ventas Netas', valor: ventasNetas, color: coloresGraficos.haber },
        { nombre: 'Costo Vendido', valor: costoVendido, color: coloresGraficos.debe },
        { nombre: 'Utilidad Bruta', valor: utilidadBruta, color: utilidadBruta >= 0 ? coloresGraficos.secundario : coloresGraficos.debe }
    ];
    
    // Si no hay datos válidos, mostramos mensaje
    if (ventasNetas === 0 && costoVendido === 0) {
        dibujarMensajeVacio(contexto, dims, 'No hay datos suficientes');
        return;
    }
    
    // Calculamos el máximo valor
    let valorMaximo = 0;
    for (let i = 0; i < datos.length; i++) {
        if (datos[i].valor > valorMaximo) valorMaximo = datos[i].valor;
    }
    valorMaximo = valorMaximo * 1.1;
    
    // Dimensiones del área de dibujo
    const anchoArea = dims.ancho - margenes.izquierdo - margenes.derecho;
    const altoArea = dims.alto - margenes.superior - margenes.inferior;
    
    // Altura de cada barra y espaciado
    const alturaBarra = altoArea / datos.length * 0.6;
    const espaciado = altoArea / datos.length;
    
    // Dibujamos las barras horizontales
    for (let i = 0; i < datos.length; i++) {
        const dato = datos[i];
        const y = margenes.superior + (i * espaciado) + (espaciado - alturaBarra) / 2;
        
        // Ancho de la barra proporcional al valor
        const anchoBarra = (dato.valor / valorMaximo) * anchoArea;
        
        // Etiqueta del nombre (a la izquierda)
        contexto.fillStyle = coloresGraficos.texto;
        contexto.font = '13px "Segoe UI", sans-serif';
        contexto.textAlign = 'right';
        contexto.textBaseline = 'middle';
        contexto.fillText(dato.nombre, margenes.izquierdo - 10, y + alturaBarra / 2);
        
        // Barra
        contexto.fillStyle = dato.color;
        contexto.fillRect(margenes.izquierdo, y, anchoBarra, alturaBarra);
        
        // Borde de la barra
        contexto.strokeStyle = 'rgba(0,0,0,0.1)';
        contexto.lineWidth = 1;
        contexto.strokeRect(margenes.izquierdo, y, anchoBarra, alturaBarra);
        
        // Valor al final de la barra
        contexto.fillStyle = coloresGraficos.texto;
        contexto.font = 'bold 12px "Courier New", monospace';
        contexto.textAlign = 'left';
        contexto.fillText(formatearMoneda(dato.valor), margenes.izquierdo + anchoBarra + 8, y + alturaBarra / 2);
    }
    
    // Línea de base (eje X)
    contexto.beginPath();
    contexto.moveTo(margenes.izquierdo, margenes.superior + altoArea);
    contexto.lineTo(margenes.izquierdo + anchoArea, margenes.superior + altoArea);
    contexto.strokeStyle = coloresGraficos.grid;
    contexto.lineWidth = 1;
    contexto.stroke();
}

// =============================================================================
// GRÁFICO 4: LÍNEAS - EVOLUCIÓN DEL SALDO DE CAJA
// =============================================================================

/**
 * Dibuja un gráfico de líneas mostrando cómo evoluciona el saldo de la
 * cuenta Caja a través de los asientos contables.
 * 
 * @param {HTMLCanvasElement} canvas - El elemento canvas donde dibujar
 */
function dibujarGraficoLineasCaja(canvas) {
    const contexto = obtenerContextoEscalado(canvas);
    const dims = obtenerDimensiones(canvas);
    
    // Limpiamos el canvas
    contexto.clearRect(0, 0, dims.ancho, dims.alto);
    
    // Calculamos el saldo acumulado de Caja después de cada asiento
    const puntos = [];
    let saldoAcumulado = 0;
    
    for (let i = 0; i < asientos.length; i++) {
        const asiento = asientos[i];
        
        // Buscamos si Caja está en este asiento
        let movimientoCaja = 0;
        for (let j = 0; j < asiento.lineas.length; j++) {
            const linea = asiento.lineas[j];
            if (linea.cuenta === 'Caja') {
                if (linea.tipo === 'debe') {
                    movimientoCaja += linea.monto;
                } else {
                    movimientoCaja -= linea.monto;
                }
            }
        }
        
        // Actualizamos el saldo acumulado
        saldoAcumulado += movimientoCaja;
        
        puntos.push({
            asiento: asiento.numero,
            saldo: saldoAcumulado
        });
    }
    
    // Si no hay puntos, mostramos mensaje
    if (puntos.length === 0) {
        dibujarMensajeVacio(contexto, dims, 'No hay movimientos de Caja');
        return;
    }
    
    // Calculamos el máximo y mínimo para escalar
    let maximo = puntos[0].saldo;
    let minimo = puntos[0].saldo;
    for (let i = 1; i < puntos.length; i++) {
        if (puntos[i].saldo > maximo) maximo = puntos[i].saldo;
        if (puntos[i].saldo < minimo) minimo = puntos[i].saldo;
    }
    
    // Añadimos margen
    const rango = maximo - minimo;
    maximo = maximo + (rango * 0.1);
    minimo = minimo - (rango * 0.1);
    if (minimo < 0 && puntos[0].saldo >= 0) minimo = 0; // No mostramos negativos si empezamos en cero
    
    // Dimensiones del área de dibujo
    const anchoArea = dims.ancho - margenes.izquierdo - margenes.derecho;
    const altoArea = dims.alto - margenes.superior - margenes.inferior;
    
    // Función para convertir coordenadas de datos a píxeles
    function escalarX(indice) {
        return margenes.izquierdo + (indice / (puntos.length - 1)) * anchoArea;
    }
    
    function escalarY(valor) {
        return margenes.superior + altoArea - ((valor - minimo) / (maximo - minimo)) * altoArea;
    }
    
    // Dibujamos los ejes
    dibujarEjesLineas(contexto, dims, minimo, maximo, puntos.length);
    
    // Dibujamos la línea
    contexto.beginPath();
    contexto.moveTo(escalarX(0), escalarY(puntos[0].saldo));
    
    for (let i = 1; i < puntos.length; i++) {
        contexto.lineTo(escalarX(i), escalarY(puntos[i].saldo));
    }
    
    contexto.strokeStyle = coloresGraficos.principal;
    contexto.lineWidth = 3;
    contexto.lineJoin = 'round';
    contexto.stroke();
    
    // Dibujamos el área bajo la línea (con transparencia)
    contexto.beginPath();
    contexto.moveTo(escalarX(0), escalarY(puntos[0].saldo));
    for (let i = 1; i < puntos.length; i++) {
        contexto.lineTo(escalarX(i), escalarY(puntos[i].saldo));
    }
    contexto.lineTo(escalarX(puntos.length - 1), margenes.superior + altoArea);
    contexto.lineTo(escalarX(0), margenes.superior + altoArea);
    contexto.closePath();
    contexto.fillStyle = 'rgba(26, 82, 118, 0.1)';
    contexto.fill();
    
    // Dibujamos los puntos
    for (let i = 0; i < puntos.length; i++) {
        const x = escalarX(i);
        const y = escalarY(puntos[i].saldo);
        
        // Círculo exterior
        contexto.beginPath();
        contexto.arc(x, y, 6, 0, 2 * Math.PI);
        contexto.fillStyle = coloresGraficos.principal;
        contexto.fill();
        
        // Círculo interior (blanco)
        contexto.beginPath();
        contexto.arc(x, y, 3, 0, 2 * Math.PI);
        contexto.fillStyle = '#ffffff';
        contexto.fill();
        
        // Valor encima del punto
        contexto.fillStyle = coloresGraficos.texto;
        contexto.font = 'bold 11px "Courier New", monospace';
        contexto.textAlign = 'center';
        contexto.textBaseline = 'bottom';
        contexto.fillText(formatearMoneda(puntos[i].saldo), x, y - 10);
    }
    
    // Etiqueta del eje X (números de asiento)
    for (let i = 0; i < puntos.length; i++) {
        contexto.fillStyle = coloresGraficos.textoSecundario;
        contexto.font = '10px "Segoe UI", sans-serif';
        contexto.textAlign = 'center';
        contexto.textBaseline = 'top';
        contexto.fillText('A' + puntos[i].asiento, escalarX(i), margenes.superior + altoArea + 8);
    }
}

// =============================================================================
// FUNCIONES AUXILIARES DE DIBUJO
// =============================================================================

/**
 * Dibuja los ejes de un gráfico de barras verticales.
 * 
 * @param {CanvasRenderingContext2D} contexto - El contexto del canvas
 * @param {object} dims - Dimensiones del canvas {ancho, alto}
 * @param {number} valorMaximo - Valor máximo para escalar el eje Y
 * @param {number} cantidadBarras - Cantidad de barras para el eje X
 * @param {boolean} mostrarGrid - Si se debe mostrar la cuadrícula
 */
function dibujarEjes(contexto, dims, valorMaximo, cantidadBarras, mostrarGrid) {
    const anchoArea = dims.ancho - margenes.izquierdo - margenes.derecho;
    const altoArea = dims.alto - margenes.superior - margenes.inferior;
    
    // Eje Y (vertical)
    contexto.beginPath();
    contexto.moveTo(margenes.izquierdo, margenes.superior);
    contexto.lineTo(margenes.izquierdo, margenes.superior + altoArea);
    contexto.strokeStyle = coloresGraficos.textoSecundario;
    contexto.lineWidth = 1;
    contexto.stroke();
    
    // Eje X (horizontal)
    contexto.beginPath();
    contexto.moveTo(margenes.izquierdo, margenes.superior + altoArea);
    contexto.lineTo(margenes.izquierdo + anchoArea, margenes.superior + altoArea);
    contexto.strokeStyle = coloresGraficos.textoSecundario;
    contexto.lineWidth = 1;
    contexto.stroke();
    
    // Líneas de referencia horizontales y etiquetas del eje Y
    const cantidadLineas = 5;
    contexto.fillStyle = coloresGraficos.textoSecundario;
    contexto.font = '10px "Segoe UI", sans-serif';
    contexto.textAlign = 'right';
    contexto.textBaseline = 'middle';
    
    for (let i = 0; i <= cantidadLineas; i++) {
        const y = margenes.superior + altoArea - (i / cantidadLineas) * altoArea;
        const valor = (i / cantidadLineas) * valorMaximo;
        
        // Línea de referencia
        if (mostrarGrid && i > 0) {
            contexto.beginPath();
            contexto.moveTo(margenes.izquierdo, y);
            contexto.lineTo(margenes.izquierdo + anchoArea, y);
            contexto.strokeStyle = coloresGraficos.grid;
            contexto.lineWidth = 1;
            contexto.setLineDash([2, 2]);
            contexto.stroke();
            contexto.setLineDash([]);
        }
        
        // Etiqueta del valor
        contexto.fillText(formatearMoneda(valor), margenes.izquierdo - 8, y);
    }
}

/**
 * Dibuja los ejes para el gráfico de líneas.
 * 
 * @param {CanvasRenderingContext2D} contexto - El contexto del canvas
 * @param {object} dims - Dimensiones del canvas {ancho, alto}
 * @param {number} minimo - Valor mínimo del eje Y
 * @param {number} maximo - Valor máximo del eje Y
 * @param {number} cantidadPuntos - Cantidad de puntos en el eje X
 */
function dibujarEjesLineas(contexto, dims, minimo, maximo, cantidadPuntos) {
    const anchoArea = dims.ancho - margenes.izquierdo - margenes.derecho;
    const altoArea = dims.alto - margenes.superior - margenes.inferior;
    
    // Eje Y (vertical)
    contexto.beginPath();
    contexto.moveTo(margenes.izquierdo, margenes.superior);
    contexto.lineTo(margenes.izquierdo, margenes.superior + altoArea);
    contexto.strokeStyle = coloresGraficos.textoSecundario;
    contexto.lineWidth = 1;
    contexto.stroke();
    
    // Eje X (horizontal)
    contexto.beginPath();
    contexto.moveTo(margenes.izquierdo, margenes.superior + altoArea);
    contexto.lineTo(margenes.izquierdo + anchoArea, margenes.superior + altoArea);
    contexto.strokeStyle = coloresGraficos.textoSecundario;
    contexto.lineWidth = 1;
    contexto.stroke();
    
    // Etiquetas del eje Y
    const cantidadLineas = 5;
    contexto.fillStyle = coloresGraficos.textoSecundario;
    contexto.font = '10px "Segoe UI", sans-serif';
    contexto.textAlign = 'right';
    contexto.textBaseline = 'middle';
    
    for (let i = 0; i <= cantidadLineas; i++) {
        const y = margenes.superior + altoArea - (i / cantidadLineas) * altoArea;
        const valor = minimo + (i / cantidadLineas) * (maximo - minimo);
        
        // Línea de referencia
        if (i > 0) {
            contexto.beginPath();
            contexto.moveTo(margenes.izquierdo, y);
            contexto.lineTo(margenes.izquierdo + anchoArea, y);
            contexto.strokeStyle = coloresGraficos.grid;
            contexto.lineWidth = 1;
            contexto.setLineDash([2, 2]);
            contexto.stroke();
            contexto.setLineDash([]);
        }
        
        contexto.fillText(formatearMoneda(valor), margenes.izquierdo - 8, y);
    }
}

/**
 * Dibuja una leyenda en la parte superior derecha del canvas.
 * 
 * @param {CanvasRenderingContext2D} contexto - El contexto del canvas
 * @param {object} dims - Dimensiones del canvas {ancho, alto}
 * @param {Array} items - Array de objetos {color, texto}
 */
function dibujarLeyenda(contexto, dims, items) {
    const xInicio = dims.ancho - margenes.derecho - 100;
    let yInicio = margenes.superior;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Cuadro de color
        contexto.fillStyle = item.color;
        contexto.fillRect(xInicio, yInicio + (i * 20), 14, 14);
        
        // Texto
        contexto.fillStyle = coloresGraficos.texto;
        contexto.font = '11px "Segoe UI", sans-serif';
        contexto.textAlign = 'left';
        contexto.textBaseline = 'middle';
        contexto.fillText(item.texto, xInicio + 20, yInicio + (i * 20) + 7);
    }
}

/**
 * Dibuja un mensaje de "No hay datos" en el centro del canvas.
 * 
 * @param {CanvasRenderingContext2D} contexto - El contexto del canvas
 * @param {object} dims - Dimensiones del canvas {ancho, alto}
 * @param {string} mensaje - El mensaje a mostrar
 */
function dibujarMensajeVacio(contexto, dims, mensaje) {
    contexto.fillStyle = coloresGraficos.textoSecundario;
    contexto.font = '14px "Segoe UI", sans-serif';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.fillText(mensaje, dims.ancho / 2, dims.alto / 2);
}

/**
 * Trunca un texto si excede la longitud máxima.
 * 
 * @param {string} texto - El texto a truncar
 * @param {number} longitudMaxima - Longitud máxima permitida
 * @returns {string} El texto truncado con "..." si aplica
 */
function truncarTexto(texto, longitudMaxima) {
    if (texto.length <= longitudMaxima) {
        return texto;
    }
    return texto.substring(0, longitudMaxima - 3) + '...';
}
