/**
 * =============================================================================
 * movimientos.js - Lógica de la página Registro de Movimientos
 * =============================================================================
 * 
 * Este archivo contiene toda la funcionalidad de la página movimientos.html:
 * crear asientos contables, agregar/eliminar líneas dinámicamente,
 * validar la partida doble en tiempo real, y renderizar la tabla de asientos.
 * 
 * La partida doble es el principio fundamental de la contabilidad:
 * por cada operación, el total cargado al Debe debe ser igual al total
 * cargado al Haber. Esto asegura que la ecuación contable siempre esté
 * equilibrada: Activos = Pasivos + Patrimonio.
 */

// =============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// =============================================================================

/** Formulario principal de creación de asientos */
const formularioAsiento = document.getElementById('formulario-asiento');

/** Campo del número de asiento (se asigna automáticamente) */
const campoNumeroAsiento = document.getElementById('campo-numero-asiento');

/** Campo de fecha del asiento */
const campoFecha = document.getElementById('campo-fecha');

/** Campo de descripción del asiento */
const campoDescripcion = document.getElementById('campo-descripcion');

/** Contenedor donde se agregan dinámicamente las líneas del asiento */
const contenedorLineas = document.getElementById('contenedor-lineas');

/** Botón para agregar una nueva línea al asiento */
const botonAgregarLinea = document.getElementById('boton-agregar-linea');

/** Span que muestra el total del Debe */
const totalDebe = document.getElementById('total-debe');

/** Span que muestra el total del Haber */
const totalHaber = document.getElementById('total-haber');

/** Span que muestra la diferencia entre Debe y Haber */
const diferencia = document.getElementById('diferencia');

/** Div que muestra mensajes de validación de la partida doble */
const mensajePartidaDoble = document.getElementById('mensaje-partida-doble');

/** Botón para registrar el asiento (solo activo si cuadra) */
const botonRegistrar = document.getElementById('boton-registrar');

/** Botón para limpiar todo el formulario */
const botonLimpiar = document.getElementById('boton-limpiar');

/** Cuerpo de la tabla donde se listan los asientos registrados */
const cuerpoTablaAsientos = document.getElementById('cuerpo-tabla-asientos');

/** Mensaje que se muestra cuando no hay asientos */
const mensajeSinAsientos = document.getElementById('mensaje-sin-asientos');

/** Botón para restablecer los datos originales del ejercicio */
const botonRestablecer = document.getElementById('boton-restablecer');

/** Botón para imprimir la página */
const botonImprimir = document.getElementById('boton-imprimir');

// =============================================================================
// CONTADOR DE LÍNEAS
// =============================================================================
/** Lleva el control de cuántas líneas tiene el asiento actual */
let contadorLineas = 0;

// =============================================================================
// FUNCIONES DE INICIALIZACIÓN
// =============================================================================

/**
 * Inicializa el formulario al cargar la página.
 * Asigna el siguiente número de asiento, establece la fecha actual
 * y crea las primeras 2 líneas del asiento (mínimo requerido).
 */
function inicializarFormulario() {
    // Asignamos el siguiente número de asiento disponible
    campoNumeroAsiento.value = obtenerSiguienteNumeroAsiento();
    
    // Establecemos la fecha actual por defecto
    campoFecha.value = obtenerFechaActual();
    
    // Creamos las primeras 2 líneas (mínimo para un asiento válido)
    agregarLinea();
    agregarLinea();
}

// =============================================================================
// FUNCIONES DE LÍNEAS DINÁMICAS
// =============================================================================

/**
 * Crea y agrega una nueva línea al asiento contable.
 * Cada línea contiene: select de cuenta, radio Debe/Haber, input de monto,
 * y botón para eliminar la línea.
 */
function agregarLinea() {
    contadorLineas++;
    
    // Creamos el contenedor de la línea
    const linea = document.createElement('div');
    linea.className = 'linea-asiento';
    linea.setAttribute('data-indice', contadorLineas);
    linea.id = 'linea-' + contadorLineas;
    
    // HTML interno de la línea
    linea.innerHTML = `
        <div class="grupo-linea">
            <label class="etiqueta-formulario">Cuenta *</label>
            <select class="campo-seleccion campo-cuenta" required>
                <option value="">-- Seleccione una cuenta --</option>
                ${generarOpcionesCuentas()}
            </select>
        </div>
        
        <div class="grupo-linea">
            <span class="etiqueta-formulario">Movimiento *</span>
            <div class="grupo-radio grupo-radio-compacto">
                <label class="opcion-radio">
                    <input type="radio" name="tipo-${contadorLineas}" value="debe" checked>
                    <span class="texto-debe">Debe</span>
                </label>
                <label class="opcion-radio">
                    <input type="radio" name="tipo-${contadorLineas}" value="haber">
                    <span class="texto-haber">Haber</span>
                </label>
            </div>
        </div>
        
        <div class="grupo-linea">
            <label class="etiqueta-formulario">Monto *</label>
            <input 
                type="number" 
                class="campo-numero campo-monto" 
                placeholder="0.00" 
                min="0.01" 
                step="0.01" 
                required
            >
        </div>
        
        <div class="grupo-linea grupo-boton-eliminar">
            <button type="button" class="boton boton-peligro boton-pequeno boton-eliminar-linea" data-linea="${contadorLineas}">
                Eliminar
            </button>
        </div>
    `;
    
    // Agregamos la línea al contenedor
    contenedorLineas.appendChild(linea);
    
    // Agregamos event listeners a los inputs de monto para calcular totales en tiempo real
    const campoMonto = linea.querySelector('.campo-monto');
    campoMonto.addEventListener('input', calcularTotales);
    
    // Agregamos event listener al botón de eliminar línea
    const botonEliminar = linea.querySelector('.boton-eliminar-linea');
    botonEliminar.addEventListener('click', function() {
        eliminarLinea(contadorLineas);
    });
    
    // Recalculamos los totales
    calcularTotales();
}

/**
 * Genera las opciones del select de cuentas a partir del catálogo global.
 * 
 * @returns {string} String con las opciones HTML de las cuentas
 */
function generarOpcionesCuentas() {
    let opciones = '';
    
    // Recorremos el array de cuentas y creamos una opción por cada una
    for (let i = 0; i < cuentas.length; i++) {
        const cuenta = cuentas[i];
        opciones += `<option value="${cuenta.nombre}">${cuenta.nombre} (${cuenta.tipo})</option>`;
    }
    
    return opciones;
}

/**
 * Elimina una línea del asiento por su índice.
 * No permite eliminar si solo quedan 2 líneas (mínimo requerido).
 * 
 * @param {number} indice - El índice de la línea a eliminar
 */
function eliminarLinea(indice) {
    // Contamos cuántas líneas hay actualmente
    const lineasActuales = contenedorLineas.querySelectorAll('.linea-asiento');
    
    // No permitimos eliminar si solo quedan 2 líneas
    if (lineasActuales.length <= 2) {
        alert('Un asiento debe tener mínimo 2 líneas (una al Debe y una al Haber).');
        return;
    }
    
    // Buscamos la línea a eliminar
    const lineaEliminar = document.getElementById('linea-' + indice);
    if (lineaEliminar) {
        lineaEliminar.remove();
        calcularTotales();
    }
}

// =============================================================================
// FUNCIONES DE CÁLCULO Y VALIDACIÓN EN TIEMPO REAL
// =============================================================================

/**
 * Calcula los totales del Debe y Haber en tiempo real.
 * Se ejecuta cada vez que el usuario modifica un monto.
 * Actualiza el indicador visual y habilita/deshabilita el botón de registrar.
 */
function calcularTotales() {
    let sumaDebe = 0;
    let sumaHaber = 0;
    
    // Obtenemos todas las líneas del asiento
    const lineas = contenedorLineas.querySelectorAll('.linea-asiento');
    
    // Recorremos cada línea sumando según el tipo seleccionado
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        const montoInput = linea.querySelector('.campo-monto');
        const tipoRadio = linea.querySelector('input[type="radio"]:checked');
        
        // Si hay un monto válido y un tipo seleccionado, acumulamos
        const monto = parseFloat(montoInput.value) || 0;
        
        if (tipoRadio && tipoRadio.value === 'debe') {
            sumaDebe += monto;
        } else if (tipoRadio && tipoRadio.value === 'haber') {
            sumaHaber += monto;
        }
    }
    
    // Calculamos la diferencia
    const diff = sumaDebe - sumaHaber;
    
    // Actualizamos los valores en pantalla
    totalDebe.textContent = formatearMoneda(sumaDebe);
    totalHaber.textContent = formatearMoneda(sumaHaber);
    diferencia.textContent = formatearMoneda(Math.abs(diff));
    
    // Cambiamos el color de la diferencia según el estado
    if (diff === 0 && sumaDebe > 0) {
        // Cuadra perfectamente y hay montos
        diferencia.style.color = 'var(--color-exito)';
        mostrarMensajePartidaDoble('¡El asiento cuadra! Puedes registrarlo.', 'exito');
        botonRegistrar.disabled = false;
    } else if (diff === 0 && sumaDebe === 0) {
        // No hay montos ingresados aún
        diferencia.style.color = 'var(--texto-secundario)';
        ocultarMensajePartidaDoble();
        botonRegistrar.disabled = true;
    } else {
        // No cuadra
        diferencia.style.color = 'var(--color-error)';
        mostrarMensajePartidaDoble('El asiento no cuadra. Diferencia: ' + formatearMoneda(Math.abs(diff)), 'error');
        botonRegistrar.disabled = true;
    }
}

/**
 * Muestra un mensaje de validación de la partida doble.
 * 
 * @param {string} texto - El mensaje a mostrar
 * @param {string} tipo - 'exito' o 'error'
 */
function mostrarMensajePartidaDoble(texto, tipo) {
    mensajePartidaDoble.textContent = texto;
    mensajePartidaDoble.className = 'mensaje-validacion ' + tipo;
    mensajePartidaDoble.classList.remove('oculto');
}

/**
 * Oculta el mensaje de validación de la partida doble.
 */
function ocultarMensajePartidaDoble() {
    mensajePartidaDoble.classList.add('oculto');
}

// =============================================================================
// FUNCIONES DE VALIDACIÓN DEL ASIENTO
// =============================================================================

/**
 * Valida que el asiento cumpla con todos los requisitos antes de registrarlo.
 * 
 * @returns {object|null} Objeto con los datos del asiento si es válido, null si hay errores
 */
function validarAsiento() {
    // Validación 1: Fecha obligatoria
    if (!campoFecha.value) {
        alert('Debes seleccionar una fecha para el asiento.');
        campoFecha.focus();
        return null;
    }
    
    // Validación 2: Descripción obligatoria
    const descripcion = campoDescripcion.value.trim();
    if (!descripcion) {
        alert('Debes escribir una descripción para el asiento.');
        campoDescripcion.focus();
        return null;
    }
    
    // Validación 3: Mínimo 2 líneas
    const lineas = contenedorLineas.querySelectorAll('.linea-asiento');
    if (lineas.length < 2) {
        alert('Un asiento debe tener mínimo 2 líneas.');
        return null;
    }
    
    // Validación 4: Cada línea debe tener cuenta, tipo y monto válido
    const lineasAsiento = [];
    let sumaDebe = 0;
    let sumaHaber = 0;
    
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        const selectCuenta = linea.querySelector('.campo-cuenta');
        const tipoRadio = linea.querySelector('input[type="radio"]:checked');
        const montoInput = linea.querySelector('.campo-monto');
        
        const cuenta = selectCuenta.value;
        const tipo = tipoRadio ? tipoRadio.value : '';
        const monto = parseFloat(montoInput.value);
        
        // Validamos que haya una cuenta seleccionada
        if (!cuenta) {
            alert('Debes seleccionar una cuenta en todas las líneas del asiento.');
            selectCuenta.focus();
            return null;
        }
        
        // Validamos que haya un tipo seleccionado
        if (!tipo) {
            alert('Debes seleccionar si el movimiento es al Debe o al Haber en todas las líneas.');
            return null;
        }
        
        // Validamos que el monto sea mayor a cero
        if (isNaN(monto) || monto <= 0) {
            alert('El monto debe ser mayor a cero en todas las líneas del asiento.');
            montoInput.focus();
            return null;
        }
        
        // Acumulamos para verificar la partida doble
        if (tipo === 'debe') {
            sumaDebe += monto;
        } else {
            sumaHaber += monto;
        }
        
        // Agregamos la línea al array
        lineasAsiento.push({
            cuenta: cuenta,
            tipo: tipo,
            monto: monto
        });
    }
    
    // Validación 5: La partida doble debe cuadrar
    if (sumaDebe !== sumaHaber) {
        alert('La partida doble no cuadra. Total Debe: ' + formatearMoneda(sumaDebe) + 
              ' | Total Haber: ' + formatearMoneda(sumaHaber));
        return null;
    }
    
    // Si todo está bien, devolvemos los datos del asiento
    return {
        numero: parseInt(campoNumeroAsiento.value),
        fecha: campoFecha.value,
        descripcion: descripcion,
        lineas: lineasAsiento
    };
}

// =============================================================================
// FUNCIONES DE CREACIÓN Y REGISTRO
// =============================================================================

/**
 * Registra un nuevo asiento contable en el array global.
 * Se ejecuta al enviar el formulario si todas las validaciones pasan.
 */
function registrarAsiento() {
    const datos = validarAsiento();
    if (!datos) return; // Si la validación falla, no continuamos
    
    // Creamos el objeto asiento
    const nuevoAsiento = {
        numero: datos.numero,
        fecha: datos.fecha,
        descripcion: datos.descripcion,
        lineas: datos.lineas
    };
    
    // Agregamos el asiento al array global
    asientos.push(nuevoAsiento);
    
    // Actualizamos la tabla de asientos registrados
    renderizarTablaAsientos();
    
    // Limpiamos el formulario para un nuevo asiento
    limpiarFormulario();
    
    // Mostramos mensaje de éxito
    alert('El asiento número ' + nuevoAsiento.numero + ' ha sido registrado exitosamente.');
}

/**
 * Limpia el formulario y prepara uno nuevo.
 */
function limpiarFormulario() {
    // Limpiamos los campos básicos
    campoDescripcion.value = '';
    campoFecha.value = obtenerFechaActual();
    
    // Eliminamos todas las líneas del asiento
    limpiarContenido(contenedorLineas);
    contadorLineas = 0;
    
    // Creamos 2 líneas nuevas (mínimo requerido)
    agregarLinea();
    agregarLinea();
    
    // Actualizamos el número de asiento
    campoNumeroAsiento.value = obtenerSiguienteNumeroAsiento();
    
    // Ocultamos el mensaje de validación
    ocultarMensajePartidaDoble();
    
    // Deshabilitamos el botón de registrar
    botonRegistrar.disabled = true;
    
    // Reseteamos los totales
    totalDebe.textContent = '$0.00';
    totalHaber.textContent = '$0.00';
    diferencia.textContent = '$0.00';
    diferencia.style.color = 'var(--texto-secundario)';
}

// =============================================================================
// FUNCIONES DE RENDERIZADO DE LA TABLA
// =============================================================================

/**
 * Renderiza la tabla de asientos registrados con los datos actuales.
 * Cada asiento se muestra con todas sus líneas, agrupadas visualmente.
 */
function renderizarTablaAsientos() {
    // Limpiamos el contenido actual de la tabla
    limpiarContenido(cuerpoTablaAsientos);
    
    // Si no hay asientos, mostramos el mensaje de vacío
    if (asientos.length === 0) {
        mensajeSinAsientos.classList.remove('oculto');
        document.getElementById('tabla-asientos').style.display = 'none';
        return;
    }
    
    // Hay asientos: ocultamos el mensaje de vacío y mostramos la tabla
    mensajeSinAsientos.classList.add('oculto');
    document.getElementById('tabla-asientos').style.display = 'table';
    
    // Recorremos el array de asientos
    for (let i = 0; i < asientos.length; i++) {
        const asiento = asientos[i];
        const lineas = asiento.lineas;
        const totalLineas = lineas.length;
        
        // Recorremos cada línea del asiento
        for (let j = 0; j < lineas.length; j++) {
            const linea = lineas[j];
            const fila = document.createElement('tr');
            
            // Si es la primera línea del asiento, agregamos celdas con rowspan
            // para que el número, fecha, descripción y acciones ocupen varias filas
            if (j === 0) {
                // Celda del número de asiento
                const celdaNumero = document.createElement('td');
                celdaNumero.textContent = asiento.numero;
                celdaNumero.rowSpan = totalLineas;
                celdaNumero.className = 'celda-asiento';
                fila.appendChild(celdaNumero);
                
                // Celda de la fecha
                const celdaFecha = document.createElement('td');
                celdaFecha.textContent = formatearFecha(asiento.fecha);
                celdaFecha.rowSpan = totalLineas;
                celdaFecha.className = 'celda-asiento';
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
            } else {
                celdaHaber.textContent = '-';
            }
            fila.appendChild(celdaHaber);
            
            // Si es la primera línea, agregamos la descripción y el botón eliminar
            if (j === 0) {
                // Celda de la descripción
                const celdaDescripcion = document.createElement('td');
                celdaDescripcion.textContent = asiento.descripcion;
                celdaDescripcion.rowSpan = totalLineas;
                celdaDescripcion.className = 'celda-asiento celda-descripcion';
                fila.appendChild(celdaDescripcion);
                
                // Celda de acciones (botón eliminar asiento completo)
                const celdaAcciones = document.createElement('td');
                celdaAcciones.rowSpan = totalLineas;
                celdaAcciones.className = 'celda-asiento celda-acciones';
                
                const botonEliminar = document.createElement('button');
                botonEliminar.textContent = 'Eliminar';
                botonEliminar.className = 'boton boton-peligro boton-pequeno';
                botonEliminar.setAttribute('data-numero', asiento.numero);
                botonEliminar.addEventListener('click', function() {
                    eliminarAsiento(asiento.numero);
                });
                
                celdaAcciones.appendChild(botonEliminar);
                fila.appendChild(celdaAcciones);
            }
            
            // Agregamos la fila al cuerpo de la tabla
            cuerpoTablaAsientos.appendChild(fila);
        }
    }
}

// =============================================================================
// FUNCIONES DE ELIMINACIÓN
// =============================================================================

/**
 * Elimina un asiento completo del registro después de confirmar.
 * 
 * @param {number} numero - El número del asiento a eliminar
 */
function eliminarAsiento(numero) {
    const confirmar = window.confirm(
        '¿Estás seguro de que deseas eliminar el asiento número ' + numero + '?\n\n' +
        'Esta acción no se puede deshacer.'
    );
    
    if (!confirmar) return;
    
    // Creamos un nuevo array sin el asiento eliminado
    const nuevosAsientos = [];
    for (let i = 0; i < asientos.length; i++) {
        if (asientos[i].numero !== numero) {
            nuevosAsientos.push(asientos[i]);
        }
    }
    
    // Reemplazamos el array global
    asientos = nuevosAsientos;
    
    // Actualizamos la tabla
    renderizarTablaAsientos();
    
    // Actualizamos el número de asiento en el formulario (por si cambió)
    campoNumeroAsiento.value = obtenerSiguienteNumeroAsiento();
}

// =============================================================================
// FUNCIONES DE RESTABLECIMIENTO
// =============================================================================

/**
 * Restablece los asientos a los valores originales del ejercicio.
 * Pide confirmación antes de ejecutar.
 */
function confirmarRestablecer() {
    const confirmar = window.confirm(
        '¿Deseas restablecer todos los asientos a los valores originales del ejercicio?\n\n' +
        'Se perderán todos los asientos creados o modificados.'
    );
    
    if (!confirmar) return;
    
    // Llamamos a la función global de datos.js
    restablecerEjercicio();
    
    // Limpiamos el formulario
    limpiarFormulario();
    
    // Actualizamos la tabla
    renderizarTablaAsientos();
    
    alert('El ejercicio ha sido restablecido a los valores originales.');
}

// =============================================================================
// MANEJADORES DE EVENTOS
// =============================================================================

/**
 * Inicializa todos los event listeners de la página.
 */
function inicializarEventos() {
    
    // Evento submit del formulario (registrar asiento)
    formularioAsiento.addEventListener('submit', function(evento) {
        evento.preventDefault();
        registrarAsiento();
    });
    
    // Evento click en el botón agregar línea
    botonAgregarLinea.addEventListener('click', agregarLinea);
    
    // Evento click en el botón limpiar formulario
    botonLimpiar.addEventListener('click', limpiarFormulario);
    
    // Evento click en el botón restablecer ejercicio
    botonRestablecer.addEventListener('click', confirmarRestablecer);
    
    // Evento click en el botón imprimir
    botonImprimir.addEventListener('click', imprimirPagina);
}

// =============================================================================
// INICIALIZACIÓN DE LA PÁGINA
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializamos el formulario con valores por defecto
    inicializarFormulario();
    
    // Renderizamos la tabla con los asientos pre-cargados
    renderizarTablaAsientos();
    
    // Configuramos todos los event listeners
    inicializarEventos();
});
