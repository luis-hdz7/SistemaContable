/**
 * =============================================================================
 * principal.js - Funciones compartidas del Sistema Contable Educativo
 * =============================================================================
 * 
 * Este archivo contiene las funciones utilitarias que se usan en todas
 * las páginas del sitio: formato de moneda, formato de fechas,
 * navegación activa, impresión y búsqueda de cuentas.
 * 
 * Se carga en todas las páginas después de datos.js para tener acceso
 * a las variables globales: cuentas y asientos.
 */

// =============================================================================
// FUNCIONES DE FORMATO
// =============================================================================

/**
 * Formatea un número como moneda en pesos colombianos (o moneda genérica).
 * Recibe un valor numérico y devuelve un string con formato $X,XXX.00
 * 
 * Ejemplo: formatearMoneda(150000) devuelve "$150,000.00"
 * 
 * @param {number} valor - El monto a formatear
 * @returns {string} El valor formateado como moneda
 */
function formatearMoneda(valor) {
    // Verificamos que sea un número válido
    if (typeof valor !== 'number' || isNaN(valor)) {
        return "$0.00";
    }
    
    // Usamos toLocaleString para agregar separadores de miles y decimales
    // 'es-CO' indica español de Colombia, pero funciona para cualquier país hispanohablante
    return '$' + valor.toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD) a un formato legible en español.
 * 
 * Ejemplo: formatearFecha("2024-01-15") devuelve "15 de enero de 2024"
 * 
 * @param {string} fechaTexto - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha formateada en español
 */
function formatearFecha(fechaTexto) {
    // Verificamos que la fecha sea válida
    if (!fechaTexto || typeof fechaTexto !== 'string') {
        return "Fecha no válida";
    }
    
    // Creamos un objeto Date a partir del string
    const fecha = new Date(fechaTexto + 'T00:00:00');
    
    // Verificamos que la fecha sea válida
    if (isNaN(fecha.getTime())) {
        return "Fecha no válida";
    }
    
    // Array con los nombres de los meses en español
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    // Extraemos día, mes y año
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    
    // Construimos el string legible
    return dia + " de " + mes + " de " + anio;
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD).
 * Útil para asignar la fecha por defecto en los formularios.
 * 
 * @returns {string} Fecha actual en formato ISO
 */
function obtenerFechaActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    // getMonth() devuelve 0-11, por eso sumamos 1
    // padStart asegura que tenga 2 dígitos (01, 02, etc.)
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    
    return anio + '-' + mes + '-' + dia;
}

// =============================================================================
// FUNCIONES DE BÚSQUEDA Y UTILIDADES CONTABLES
// =============================================================================

/**
 * Busca una cuenta en el catálogo por su nombre exacto.
 * 
 * Ejemplo: obtenerCuentaPorNombre("Caja") devuelve el objeto de la cuenta Caja
 * 
 * @param {string} nombre - Nombre de la cuenta a buscar
 * @returns {object|null} El objeto cuenta encontrado, o null si no existe
 */
function obtenerCuentaPorNombre(nombre) {
    // Recorremos el array de cuentas buscando una coincidencia exacta
    for (let i = 0; i < cuentas.length; i++) {
        if (cuentas[i].nombre === nombre) {
            return cuentas[i];
        }
    }
    // Si no encontramos la cuenta, devolvemos null
    return null;
}

/**
 * Obtiene el siguiente número de asiento disponible.
 * Útil para asignar automáticamente el número al crear un nuevo asiento.
 * 
 * @returns {number} El siguiente número de asiento (último + 1)
 */
function obtenerSiguienteNumeroAsiento() {
    // Si no hay asientos, el primero es el número 1
    if (asientos.length === 0) {
        return 1;
    }
    
    // Encontramos el número más alto entre los asientos existentes
    let numeroMayor = 0;
    for (let i = 0; i < asientos.length; i++) {
        if (asientos[i].numero > numeroMayor) {
            numeroMayor = asientos[i].numero;
        }
    }
    
    // El siguiente número es el mayor + 1
    return numeroMayor + 1;
}

/**
 * Calcula los totales de Debe y Haber de un asiento específico.
 * 
 * @param {object} asiento - El objeto asiento con sus líneas
 * @returns {object} Objeto con propiedades: totalDebe, totalHaber, diferencia
 */
function calcularTotalesAsiento(asiento) {
    let totalDebe = 0;
    let totalHaber = 0;
    
    // Recorremos cada línea del asiento sumando según el tipo
    for (let i = 0; i < asiento.lineas.length; i++) {
        const linea = asiento.lineas[i];
        if (linea.tipo === 'debe') {
            totalDebe += linea.monto;
        } else if (linea.tipo === 'haber') {
            totalHaber += linea.monto;
        }
    }
    
    return {
        totalDebe: totalDebe,
        totalHaber: totalHaber,
        diferencia: totalDebe - totalHaber
    };
}

/**
 * Calcula los movimientos acumulados (total Debe y total Haber) de una cuenta
 * a partir de todos los asientos registrados.
 * 
 * @param {string} nombreCuenta - Nombre de la cuenta a calcular
 * @returns {object} Objeto con: totalDebe, totalHaber
 */
function calcularMovimientosCuenta(nombreCuenta) {
    let totalDebe = 0;
    let totalHaber = 0;
    
    // Recorremos todos los asientos y sus líneas
    for (let i = 0; i < asientos.length; i++) {
        const asiento = asientos[i];
        for (let j = 0; j < asiento.lineas.length; j++) {
            const linea = asiento.lineas[j];
            // Si la línea corresponde a la cuenta buscada, acumulamos
            if (linea.cuenta === nombreCuenta) {
                if (linea.tipo === 'debe') {
                    totalDebe += linea.monto;
                } else if (linea.tipo === 'haber') {
                    totalHaber += linea.monto;
                }
            }
        }
    }
    
    return {
        totalDebe: totalDebe,
        totalHaber: totalHaber
    };
}

/**
 * Calcula el saldo final de una cuenta según su naturaleza.
 * 
 * - Si la cuenta es deudora: Saldo = Total Debe - Total Haber
 * - Si la cuenta es acreedora: Saldo = Total Haber - Total Debe
 * 
 * El saldo representa el valor neto de la cuenta después de todos
 * los movimientos. Si es positivo, indica saldo deudor; si es negativo,
 * indica saldo acreedor.
 * 
 * @param {string} nombreCuenta - Nombre de la cuenta
 * @returns {object} Objeto con: saldo (número), tipoSaldo ('deudor' o 'acreedor')
 */
function calcularSaldoCuenta(nombreCuenta) {
    // Obtenemos los movimientos de la cuenta
    const movimientos = calcularMovimientosCuenta(nombreCuenta);
    
    // Buscamos la cuenta para saber su naturaleza
    const cuenta = obtenerCuentaPorNombre(nombreCuenta);
    
    // Si no existe la cuenta, devolvemos saldo cero
    if (!cuenta) {
        return { saldo: 0, tipoSaldo: 'deudor' };
    }
    
    let saldo = 0;
    let tipoSaldo = '';
    
    // Calculamos según la naturaleza de la cuenta
    if (cuenta.naturaleza === 'deudora') {
        // Cuentas deudoras: Debe - Haber
        saldo = movimientos.totalDebe - movimientos.totalHaber;
        tipoSaldo = saldo >= 0 ? 'deudor' : 'acreedor';
    } else {
        // Cuentas acreedoras: Haber - Debe
        saldo = movimientos.totalHaber - movimientos.totalDebe;
        tipoSaldo = saldo >= 0 ? 'acreedor' : 'deudor';
    }
    
    // Devolvemos el valor absoluto del saldo y el tipo
    return {
        saldo: Math.abs(saldo),
        tipoSaldo: tipoSaldo
    };
}

// =============================================================================
// FUNCIONES DE NAVEGACIÓN
// =============================================================================

/**
 * Marca como activo el enlace de navegación que corresponde a la página actual.
 * Se ejecuta al cargar cada página para resaltar en el menú dónde estamos.
 */
function marcarNavegacionActiva() {
    // Obtenemos el nombre del archivo actual de la URL
    const rutaActual = window.location.pathname;
    const nombreArchivo = rutaActual.substring(rutaActual.lastIndexOf('/') + 1);
    
    // Seleccionamos todos los enlaces de la navegación
    const enlacesNavegacion = document.querySelectorAll('.enlace-navegacion');
    
    // Recorremos los enlaces y comparamos con la página actual
    for (let i = 0; i < enlacesNavegacion.length; i++) {
        const enlace = enlacesNavegacion[i];
        const href = enlace.getAttribute('href');
        
        // Si el href contiene el nombre del archivo actual, marcamos como activo
        if (href && href.includes(nombreArchivo)) {
            enlace.classList.add('activo');
        } else {
            enlace.classList.remove('activo');
        }
    }
}

/**
 * Controla el menú hamburguesa en pantallas pequeñas.
 * Muestra u oculta la lista de navegación al hacer clic en el botón.
 */
function inicializarMenuHamburguesa() {
    const botonMenu = document.getElementById('boton-menu-hamburguesa');
    const listaNavegacion = document.getElementById('lista-navegacion');
    
    // Si existen ambos elementos, agregamos el evento
    if (botonMenu && listaNavegacion) {
        botonMenu.addEventListener('click', function() {
            // Alternamos la clase 'visible' para mostrar u ocultar el menú
            listaNavegacion.classList.toggle('visible');
        });
    }
}

// =============================================================================
// FUNCIONES DE IMPRESIÓN
// =============================================================================

/**
 * Abre el diálogo de impresión del navegador.
 * Los estilos de impresión están definidos en impresion.css
 */
function imprimirPagina() {
    window.print();
}

// =============================================================================
// FUNCIONES DE UTILIDAD DOM
// =============================================================================

/**
 * Crea un elemento de tabla (tr) con los datos de una cuenta.
 * Útil para reutilizar en las diferentes páginas que muestran cuentas.
 * 
 * @param {object} cuenta - Objeto cuenta con sus propiedades
 * @param {boolean} incluirAcciones - Si debe incluir botones de editar/eliminar
 * @returns {HTMLElement} El elemento tr listo para agregar a una tabla
 */
function crearFilaCuenta(cuenta, incluirAcciones) {
    const fila = document.createElement('tr');
    fila.setAttribute('data-id', cuenta.id);
    
    // Celda del ID
    const celdaId = document.createElement('td');
    celdaId.textContent = cuenta.id;
    fila.appendChild(celdaId);
    
    // Celda del nombre
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
    
    // Celda de la descripción
    const celdaDescripcion = document.createElement('td');
    celdaDescripcion.textContent = cuenta.descripcion || '-';
    fila.appendChild(celdaDescripcion);
    
    // Si se solicitan acciones, agregamos los botones
    if (incluirAcciones) {
        const celdaAcciones = document.createElement('td');
        celdaAcciones.className = 'celda-acciones';
        
        // Botón editar
        const botonEditar = document.createElement('button');
        botonEditar.textContent = 'Editar';
        botonEditar.className = 'boton-editar';
        botonEditar.setAttribute('data-id', cuenta.id);
        botonEditar.setAttribute('data-accion', 'editar');
        celdaAcciones.appendChild(botonEditar);
        
        // Botón eliminar
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.className = 'boton-eliminar';
        botonEliminar.setAttribute('data-id', cuenta.id);
        botonEliminar.setAttribute('data-accion', 'eliminar');
        celdaAcciones.appendChild(botonEliminar);
        
        fila.appendChild(celdaAcciones);
    }
    
    return fila;
}

/**
 * Limpia el contenido de un elemento HTML.
 * Útil para vaciar tablas o contenedores antes de renderizar nuevos datos.
 * 
 * @param {HTMLElement} elemento - El elemento a limpiar
 */
function limpiarContenido(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

// =============================================================================
// INICIALIZACIÓN AUTOMÁTICA AL CARGAR LA PÁGINA
// =============================================================================

/**
 * Se ejecuta cuando el DOM está completamente cargado.
 * Inicializa las funciones comunes a todas las páginas.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Marcamos el enlace de navegación activo según la página actual
    marcarNavegacionActiva();
    
    // Inicializamos el menú hamburguesa para pantallas pequeñas
    inicializarMenuHamburguesa();
});
