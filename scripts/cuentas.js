/**
 * =============================================================================
 * cuentas.js - Lógica de la página Catálogo de Cuentas
 * =============================================================================
 * 
 * Este archivo contiene toda la funcionalidad de la página cuentas.html:
 * crear nuevas cuentas, editar cuentas existentes, eliminar cuentas,
 * validar datos y renderizar la tabla de cuentas.
 * 
 * La naturaleza de una cuenta (deudora o acreedora) determina cómo se
 * comporta en los asientos contables:
 * - Deudora: aumenta con el Debe, disminuye con el Haber
 * - Acreedora: aumenta con el Haber, disminuye con el Debe
 */

// =============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// =============================================================================
// Guardamos referencias a los elementos que usaremos frecuentemente
// para no tener que buscarlos en el DOM cada vez que los necesitamos.

/** Formulario principal de creación/edición de cuentas */
const formularioCuenta = document.getElementById('formulario-cuenta');

/** Campo oculto que almacena el ID cuando estamos editando */
const campoIdCuenta = document.getElementById('campo-id-cuenta');

/** Campo de texto para el nombre de la cuenta */
const campoNombre = document.getElementById('campo-nombre');

/** Campo select para el tipo de cuenta */
const campoTipo = document.getElementById('campo-tipo');

/** Campo textarea para la descripción */
const campoDescripcion = document.getElementById('campo-descripcion');

/** Título del formulario que cambia según el modo (crear/editar) */
const tituloFormulario = document.getElementById('titulo-formulario');

/** Botón de guardar que cambia de texto según el modo */
const botonGuardar = document.getElementById('boton-guardar');

/** Botón para cancelar la edición (aparece solo en modo edición) */
const botonCancelar = document.getElementById('boton-cancelar');

/** Div donde mostramos mensajes de validación (éxito o error) */
const mensajeFormulario = document.getElementById('mensaje-formulario');

/** Cuerpo de la tabla donde se listan las cuentas */
const cuerpoTablaCuentas = document.getElementById('cuerpo-tabla-cuentas');

/** Mensaje que se muestra cuando no hay cuentas registradas */
const mensajeSinCuentas = document.getElementById('mensaje-sin-cuentas');

/** Botón para restablecer los datos originales del ejercicio */
const botonRestablecer = document.getElementById('boton-restablecer');

/** Botón para imprimir la página */
const botonImprimir = document.getElementById('boton-imprimir');

// =============================================================================
// ESTADO DE LA PÁGINA
// =============================================================================
/** Indica si estamos en modo edición (true) o creación (false) */
let modoEdicion = false;

// =============================================================================
// FUNCIONES DE RENDERIZADO
// =============================================================================

/**
 * Renderiza la tabla de cuentas con los datos actuales del array global.
 * Se ejecuta al cargar la página y cada vez que hay cambios.
 */
function renderizarTablaCuentas() {
    // Limpiamos el contenido actual de la tabla
    limpiarContenido(cuerpoTablaCuentas);
    
    // Si no hay cuentas, mostramos el mensaje de vacío y ocultamos la tabla
    if (cuentas.length === 0) {
        mensajeSinCuentas.classList.remove('oculto');
        document.getElementById('tabla-cuentas').style.display = 'none';
        return;
    }
    
    // Hay cuentas: ocultamos el mensaje de vacío y mostramos la tabla
    mensajeSinCuentas.classList.add('oculto');
    document.getElementById('tabla-cuentas').style.display = 'table';
    
    // Recorremos el array de cuentas y creamos una fila por cada una
    for (let i = 0; i < cuentas.length; i++) {
        const cuenta = cuentas[i];
        const fila = crearFilaCuenta(cuenta, true);
        cuerpoTablaCuentas.appendChild(fila);
    }
}

// =============================================================================
// FUNCIONES DE VALIDACIÓN
// =============================================================================

/**
 * Valida que los datos del formulario sean correctos antes de guardar.
 * 
 * @returns {object|null} Objeto con los datos si son válidos, null si hay errores
 */
function validarFormulario() {
    // Obtenemos los valores de los campos
    const nombre = campoNombre.value.trim();
    const tipo = campoTipo.value;
    const descripcion = campoDescripcion.value.trim();
    
    // Obtenemos el valor del radio button seleccionado (naturaleza)
    const radioNaturaleza = document.querySelector('input[name="naturaleza"]:checked');
    const naturaleza = radioNaturaleza ? radioNaturaleza.value : '';
    
    // Validación 1: El nombre es obligatorio y debe tener al menos 3 caracteres
    if (nombre.length < 3) {
        mostrarMensajeFormulario('El nombre de la cuenta debe tener al menos 3 caracteres.', 'error');
        return null;
    }
    
    // Validación 2: El tipo es obligatorio
    if (!tipo) {
        mostrarMensajeFormulario('Debes seleccionar un tipo de cuenta.', 'error');
        return null;
    }
    
    // Validación 3: La naturaleza es obligatoria
    if (!naturaleza) {
        mostrarMensajeFormulario('Debes seleccionar la naturaleza de la cuenta.', 'error');
        return null;
    }
    
    // Validación 4: No permitir nombres duplicados
    // Si estamos editando, permitimos que conserve su propio nombre
    const idEditando = modoEdicion ? parseInt(campoIdCuenta.value) : null;
    
    for (let i = 0; i < cuentas.length; i++) {
        // Comparamos en minúsculas para evitar duplicados por diferencia de mayúsculas
        if (cuentas[i].nombre.toLowerCase() === nombre.toLowerCase()) {
            // Si estamos editando, ignoramos la cuenta que estamos editando
            if (modoEdicion && cuentas[i].id === idEditando) {
                continue;
            }
            mostrarMensajeFormulario('Ya existe una cuenta con ese nombre.', 'error');
            return null;
        }
    }
    
    // Si todo está bien, devolvemos los datos validados
    return {
        nombre: nombre,
        tipo: tipo,
        naturaleza: naturaleza,
        descripcion: descripcion
    };
}

/**
 * Muestra un mensaje de validación en el formulario.
 * 
 * @param {string} texto - El mensaje a mostrar
 * @param {string} tipo - 'exito' o 'error'
 */
function mostrarMensajeFormulario(texto, tipo) {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.className = 'mensaje-validacion ' + tipo;
    mensajeFormulario.classList.remove('oculto');
    
    // Ocultamos el mensaje automáticamente después de 5 segundos
    setTimeout(function() {
        mensajeFormulario.classList.add('oculto');
    }, 5000);
}

// =============================================================================
// FUNCIONES DE CREACIÓN Y EDICIÓN
// =============================================================================

/**
 * Crea una nueva cuenta con los datos del formulario.
 * Asigna automáticamente el siguiente ID disponible.
 */
function crearCuenta() {
    const datos = validarFormulario();
    if (!datos) return; // Si la validación falla, no continuamos
    
    // Calculamos el siguiente ID (el mayor existente + 1)
    let idMayor = 0;
    for (let i = 0; i < cuentas.length; i++) {
        if (cuentas[i].id > idMayor) {
            idMayor = cuentas[i].id;
        }
    }
    
    // Creamos el objeto cuenta
    const nuevaCuenta = {
        id: idMayor + 1,
        nombre: datos.nombre,
        tipo: datos.tipo,
        naturaleza: datos.naturaleza,
        descripcion: datos.descripcion
    };
    
    // Agregamos la nueva cuenta al array global
    cuentas.push(nuevaCuenta);
    
    // Actualizamos la tabla
    renderizarTablaCuentas();
    
    // Limpiamos el formulario
    limpiarFormulario();
    
    // Mostramos mensaje de éxito
    mostrarMensajeFormulario('La cuenta "' + nuevaCuenta.nombre + '" ha sido creada exitosamente.', 'exito');
}

/**
 * Prepara el formulario para editar una cuenta existente.
 * Carga los datos de la cuenta en los campos del formulario.
 * 
 * @param {number} id - El ID de la cuenta a editar
 */
function iniciarEdicion(id) {
    // Buscamos la cuenta en el array
    let cuentaEditar = null;
    for (let i = 0; i < cuentas.length; i++) {
        if (cuentas[i].id === id) {
            cuentaEditar = cuentas[i];
            break;
        }
    }
    
    // Si no encontramos la cuenta, salimos
    if (!cuentaEditar) return;
    
    // Activamos el modo edición
    modoEdicion = true;
    
    // Cargamos los datos en el formulario
    campoIdCuenta.value = cuentaEditar.id;
    campoNombre.value = cuentaEditar.nombre;
    campoTipo.value = cuentaEditar.tipo;
    campoDescripcion.value = cuentaEditar.descripcion || '';
    
    // Seleccionamos el radio button correspondiente a la naturaleza
    const radiosNaturaleza = document.querySelectorAll('input[name="naturaleza"]');
    for (let i = 0; i < radiosNaturaleza.length; i++) {
        if (radiosNaturaleza[i].value === cuentaEditar.naturaleza) {
            radiosNaturaleza[i].checked = true;
            break;
        }
    }
    
    // Cambiamos el título y el texto del botón
    tituloFormulario.textContent = 'Editar Cuenta';
    botonGuardar.textContent = 'Guardar Cambios';
    
    // Mostramos el botón de cancelar
    botonCancelar.classList.remove('oculto');
    
    // Ocultamos cualquier mensaje previo
    mensajeFormulario.classList.add('oculto');
    
    // Hacemos scroll al formulario para que el usuario lo vea
    formularioCuenta.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Guarda los cambios de una cuenta editada.
 */
function guardarEdicion() {
    const datos = validarFormulario();
    if (!datos) return; // Si la validación falla, no continuamos
    
    const id = parseInt(campoIdCuenta.value);
    
    // Buscamos la cuenta en el array y actualizamos sus datos
    for (let i = 0; i < cuentas.length; i++) {
        if (cuentas[i].id === id) {
            cuentas[i].nombre = datos.nombre;
            cuentas[i].tipo = datos.tipo;
            cuentas[i].naturaleza = datos.naturaleza;
            cuentas[i].descripcion = datos.descripcion;
            break;
        }
    }
    
    // Actualizamos la tabla
    renderizarTablaCuentas();
    
    // Volvemos al modo creación
    cancelarEdicion();
    
    // Mostramos mensaje de éxito
    mostrarMensajeFormulario('La cuenta ha sido actualizada exitosamente.', 'exito');
}

/**
 * Cancela el modo edición y vuelve al modo creación.
 * Limpia el formulario y restaura los textos originales.
 */
function cancelarEdicion() {
    modoEdicion = false;
    limpiarFormulario();
    
    // Restauramos el título y el botón
    tituloFormulario.textContent = 'Agregar Nueva Cuenta';
    botonGuardar.textContent = 'Agregar Cuenta';
    
    // Ocultamos el botón de cancelar
    botonCancelar.classList.add('oculto');
    
    // Limpiamos el campo oculto de ID
    campoIdCuenta.value = '';
}

/**
 * Limpia todos los campos del formulario y los mensajes.
 */
function limpiarFormulario() {
    formularioCuenta.reset();
    mensajeFormulario.classList.add('oculto');
    
    // Desmarcamos los radio buttons
    const radiosNaturaleza = document.querySelectorAll('input[name="naturaleza"]');
    for (let i = 0; i < radiosNaturaleza.length; i++) {
        radiosNaturaleza[i].checked = false;
    }
}

// =============================================================================
// FUNCIONES DE ELIMINACIÓN
// =============================================================================

/**
 * Elimina una cuenta del catálogo después de confirmar con el usuario.
 * 
 * @param {number} id - El ID de la cuenta a eliminar
 */
function eliminarCuenta(id) {
    // Buscamos el nombre de la cuenta para mostrarlo en la confirmación
    let nombreCuenta = '';
    for (let i = 0; i < cuentas.length; i++) {
        if (cuentas[i].id === id) {
            nombreCuenta = cuentas[i].nombre;
            break;
        }
    }
    
    // Pedimos confirmación al usuario
    const confirmar = window.confirm(
        '¿Estás seguro de que deseas eliminar la cuenta "' + nombreCuenta + '"?\n\n' +
        'Esta acción no se puede deshacer.'
    );
    
    if (!confirmar) return; // El usuario canceló
    
    // Creamos un nuevo array sin la cuenta eliminada
    const nuevasCuentas = [];
    for (let i = 0; i < cuentas.length; i++) {
        if (cuentas[i].id !== id) {
            nuevasCuentas.push(cuentas[i]);
        }
    }
    
    // Reemplazamos el array global
    cuentas = nuevasCuentas;
    
    // Si estábamos editando esta cuenta, cancelamos la edición
    if (modoEdicion && parseInt(campoIdCuenta.value) === id) {
        cancelarEdicion();
    }
    
    // Actualizamos la tabla
    renderizarTablaCuentas();
}

// =============================================================================
// FUNCIONES DE RESTABLECIMIENTO
// =============================================================================

/**
 * Restablece las cuentas a los valores originales del ejercicio.
 * Pide confirmación antes de ejecutar.
 */
function confirmarRestablecer() {
    const confirmar = window.confirm(
        '¿Deseas restablecer el catálogo de cuentas a los valores originales del ejercicio?\n\n' +
        'Se perderán todas las cuentas agregadas o modificadas.'
    );
    
    if (!confirmar) return;
    
    // Llamamos a la función global de datos.js
    restablecerEjercicio();
    
    // Si estábamos editando, cancelamos
    if (modoEdicion) {
        cancelarEdicion();
    }
    
    // Actualizamos la tabla
    renderizarTablaCuentas();
    
    // Mostramos mensaje de éxito
    mostrarMensajeFormulario('El ejercicio ha sido restablecido a los valores originales.', 'exito');
}

// =============================================================================
// MANEJADORES DE EVENTOS
// =============================================================================

/**
 * Inicializa todos los event listeners de la página.
 * Se ejecuta cuando el DOM está completamente cargado.
 */
function inicializarEventos() {
    
    // Evento submit del formulario (crear o guardar edición)
    formularioCuenta.addEventListener('submit', function(evento) {
        // Prevenimos el envío tradicional del formulario (que recargaría la página)
        evento.preventDefault();
        
        if (modoEdicion) {
            guardarEdicion();
        } else {
            crearCuenta();
        }
    });
    
    // Evento click en el botón cancelar edición
    botonCancelar.addEventListener('click', cancelarEdicion);
    
    // Evento click en el botón restablecer ejercicio
    botonRestablecer.addEventListener('click', confirmarRestablecer);
    
    // Evento click en el botón imprimir
    botonImprimir.addEventListener('click', imprimirPagina);
    
    // Delegación de eventos para los botones de la tabla (editar y eliminar)
    // Usamos delegación porque las filas se generan dinámicamente
    cuerpoTablaCuentas.addEventListener('click', function(evento) {
        const boton = evento.target;
        
        // Verificamos si se hizo click en un botón de editar
        if (boton.getAttribute('data-accion') === 'editar') {
            const id = parseInt(boton.getAttribute('data-id'));
            iniciarEdicion(id);
        }
        
        // Verificamos si se hizo click en un botón de eliminar
        if (boton.getAttribute('data-accion') === 'eliminar') {
            const id = parseInt(boton.getAttribute('data-id'));
            eliminarCuenta(id);
        }
    });
}

// =============================================================================
// INICIALIZACIÓN DE LA PÁGINA
// =============================================================================

/**
 * Se ejecuta cuando el DOM está listo.
 * Renderiza la tabla inicial y configura los eventos.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Renderizamos la tabla con las cuentas pre-cargadas
    renderizarTablaCuentas();
    
    // Configuramos todos los event listeners
    inicializarEventos();
});
