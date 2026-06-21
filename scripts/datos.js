/**
 * =============================================================================
 * datos.js - Base de datos en memoria del Sistema Contable Educativo
 * =============================================================================
 * 
 * Este archivo contiene los datos de ejemplo pre-cargados del ejercicio
 * contable del Método Pormenorizado. Define las variables globales que
 * almacenan el catálogo de cuentas y los asientos contables.
 * 
 * El Método Pormenorizado es un sistema de registro contable donde cada
 * operación se anota detalladamente en el Libro Diario, mostrando todas
 * las cuentas afectadas con sus respectivos montos al Debe y al Haber.
 * 
 * NOTA IMPORTANTE: Estos datos viven solo en memoria. Si recargas la
 * página, todo vuelve a estos valores iniciales. Esto es intencional
 * para mantener el código simple y didáctico.
 */

// =============================================================================
// VARIABLES GLOBALES
// =============================================================================

/**
 * Array que almacena todas las cuentas del catálogo contable.
 * Cada cuenta es un objeto con: id, nombre, tipo, naturaleza y descripcion.
 * 
 * La naturaleza de una cuenta determina cómo se comporta:
 * - Deudora: Aumenta con el Debe, disminuye con el Haber (Activos, Costos, Gastos)
 * - Acreedora: Aumenta con el Haber, disminuye con el Debe (Pasivos, Patrimonio, Ingresos)
 */
let cuentas = [];

/**
 * Array que almacena todos los asientos contables registrados.
 * Cada asiento es un objeto con: numero, fecha, descripcion y un array de lineas.
 * Cada linea del asiento indica qué cuenta se afecta, si es Debe o Haber, y el monto.
 * 
 * La partida doble exige que: Total Debe = Total Haber en cada asiento.
 */
let asientos = [];

// =============================================================================
// DATOS ORIGINALES DEL EJERCICIO (para poder restablecer)
// =============================================================================

/**
 * Copia de respaldo de las 14 cuentas originales del ejercicio.
 * Se usa cuando el usuario hace clic en "Restablecer ejercicio".
 */
const cuentasOriginales = [
    {
        id: 1,
        nombre: "Caja",
        tipo: "Activo",
        naturaleza: "deudora",
        descripcion: "Dinero en efectivo disponible en la empresa"
    },
    {
        id: 2,
        nombre: "Inventario",
        tipo: "Activo",
        naturaleza: "deudora",
        descripcion: "Mercancía disponible para la venta"
    },
    {
        id: 3,
        nombre: "Capital",
        tipo: "Patrimonio",
        naturaleza: "acreedora",
        descripcion: "Aporte de los dueños a la empresa"
    },
    {
        id: 4,
        nombre: "Clientes",
        tipo: "Activo",
        naturaleza: "deudora",
        descripcion: "Derechos de cobro a clientes por ventas a crédito"
    },
    {
        id: 5,
        nombre: "Ventas",
        tipo: "Ingreso",
        naturaleza: "acreedora",
        descripcion: "Ingresos por venta de mercancía"
    },
    {
        id: 6,
        nombre: "Devoluciones sobre ventas",
        tipo: "Contra-ingreso",
        naturaleza: "deudora",
        descripcion: "Mercancía devuelta por los clientes"
    },
    {
        id: 7,
        nombre: "Descuentos sobre ventas",
        tipo: "Contra-ingreso",
        naturaleza: "deudora",
        descripcion: "Descuentos otorgados a clientes por pronto pago"
    },
    {
        id: 8,
        nombre: "Compras",
        tipo: "Costo",
        naturaleza: "deudora",
        descripcion: "Adquisición de mercancía para reventa"
    },
    {
        id: 9,
        nombre: "Proveedores",
        tipo: "Pasivo",
        naturaleza: "acreedora",
        descripcion: "Obligaciones de pago a proveedores por compras a crédito"
    },
    {
        id: 10,
        nombre: "Gastos de compra",
        tipo: "Costo",
        naturaleza: "deudora",
        descripcion: "Gastos adicionales en la adquisición de mercancía (flete, seguro, etc.)"
    },
    {
        id: 11,
        nombre: "Devoluciones sobre compras",
        tipo: "Contra-costo",
        naturaleza: "acreedora",
        descripcion: "Mercancía devuelta a los proveedores"
    },
    {
        id: 12,
        nombre: "Descuentos sobre compras",
        tipo: "Contra-costo",
        naturaleza: "acreedora",
        descripcion: "Descuentos obtenidos de proveedores por pronto pago"
    },
    {
        id: 13,
        nombre: "Gastos de administración",
        tipo: "Gasto",
        naturaleza: "deudora",
        descripcion: "Gastos operativos de la administración (alquiler, servicios, etc.)"
    },
    {
        id: 14,
        nombre: "Préstamo bancario",
        tipo: "Pasivo",
        naturaleza: "acreedora",
        descripcion: "Obligación de pago por préstamo obtenido del banco"
    }
];

/**
 * Copia de respaldo de los 10 asientos originales del ejercicio.
 * Se usa cuando el usuario hace clic en "Restablecer ejercicio".
 */
const asientosOriginales = [
    {
        numero: 1,
        fecha: "2024-01-01",
        descripcion: "Apertura de la empresa. Se aporta efectivo e inventario inicial.",
        lineas: [
            { cuenta: "Caja", tipo: "debe", monto: 200000 },
            { cuenta: "Inventario", tipo: "debe", monto: 800000 },
            { cuenta: "Capital", tipo: "haber", monto: 1000000 }
        ]
    },
    {
        numero: 2,
        fecha: "2024-01-05",
        descripcion: "Venta de mercancía. Parte en efectivo y parte a crédito.",
        lineas: [
            { cuenta: "Caja", tipo: "debe", monto: 490000 },
            { cuenta: "Clientes", tipo: "debe", monto: 210000 },
            { cuenta: "Ventas", tipo: "haber", monto: 700000 }
        ]
    },
    {
        numero: 3,
        fecha: "2024-01-08",
        descripcion: "Devolución de mercancía por parte de un cliente.",
        lineas: [
            { cuenta: "Devoluciones sobre ventas", tipo: "debe", monto: 50000 },
            { cuenta: "Clientes", tipo: "haber", monto: 50000 }
        ]
    },
    {
        numero: 4,
        fecha: "2024-01-10",
        descripcion: "Descuento por pronto pago otorgado a un cliente.",
        lineas: [
            { cuenta: "Descuentos sobre ventas", tipo: "debe", monto: 25000 },
            { cuenta: "Clientes", tipo: "haber", monto: 25000 }
        ]
    },
    {
        numero: 5,
        fecha: "2024-01-12",
        descripcion: "Compra de mercancía a crédito.",
        lineas: [
            { cuenta: "Compras", tipo: "debe", monto: 350000 },
            { cuenta: "Proveedores", tipo: "haber", monto: 350000 }
        ]
    },
    {
        numero: 6,
        fecha: "2024-01-15",
        descripcion: "Pago de gastos de compra (flete y seguro) en efectivo.",
        lineas: [
            { cuenta: "Gastos de compra", tipo: "debe", monto: 20000 },
            { cuenta: "Caja", tipo: "haber", monto: 20000 }
        ]
    },
    {
        numero: 7,
        fecha: "2024-01-18",
        descripcion: "Devolución de mercancía defectuosa al proveedor.",
        lineas: [
            { cuenta: "Proveedores", tipo: "debe", monto: 60000 },
            { cuenta: "Devoluciones sobre compras", tipo: "haber", monto: 60000 }
        ]
    },
    {
        numero: 8,
        fecha: "2024-01-20",
        descripcion: "Descuento por pronto pago obtenido de un proveedor.",
        lineas: [
            { cuenta: "Proveedores", tipo: "debe", monto: 4000 },
            { cuenta: "Descuentos sobre compras", tipo: "haber", monto: 4000 }
        ]
    },
    {
        numero: 9,
        fecha: "2024-01-25",
        descripcion: "Pago de alquiler del local en efectivo.",
        lineas: [
            { cuenta: "Gastos de administración", tipo: "debe", monto: 15000 },
            { cuenta: "Caja", tipo: "haber", monto: 15000 }
        ]
    },
    {
        numero: 10,
        fecha: "2024-01-28",
        descripcion: "Obtención de préstamo bancario en efectivo.",
        lineas: [
            { cuenta: "Caja", tipo: "debe", monto: 100000 },
            { cuenta: "Préstamo bancario", tipo: "haber", monto: 100000 }
        ]
    }
];

// =============================================================================
// FUNCIONES DE INICIALIZACIÓN Y RESTABLECIMIENTO
// =============================================================================

/**
 * Función que carga los datos originales en las variables globales.
 * Se ejecuta automáticamente al cargar este archivo.
 * 
 * Usa JSON.parse(JSON.stringify(...)) para crear copias profundas
 * y evitar que las modificaciones afecten a los originales.
 */
function cargarDatosIniciales() {
    // Creamos copias profundas para que las variables globales sean independientes
    cuentas = JSON.parse(JSON.stringify(cuentasOriginales));
    asientos = JSON.parse(JSON.stringify(asientosOriginales));
}

/**
 * Función que restablece los datos a los valores originales del ejercicio.
 * Se llama desde cualquier página cuando el usuario hace clic en
 * "Restablecer ejercicio".
 * 
 * Después de restablecer, dispara un evento personalizado para que
 * las otras páginas puedan actualizar sus vistas si es necesario.
 */
function restablecerEjercicio() {
    cargarDatosIniciales();
    
    // Disparamos un evento para notificar a otras páginas que los datos cambiaron
    // Esto es útil si en el futuro se quiere sincronizar entre pestañas
    const eventoDatosRestablecidos = new CustomEvent('datosRestablecidos', {
        detail: { mensaje: 'Los datos han sido restablecidos a los valores originales' }
    });
    document.dispatchEvent(eventoDatosRestablecidos);
}

// =============================================================================
// DATOS AUXILIARES PARA EL ANÁLISIS DE LA OPERACIÓN
// =============================================================================

/**
 * Valor del inventario inicial del ejercicio.
 * Se usa en el cálculo del Costo de lo Vendido.
 */
const inventarioInicial = 800000;

/**
 * Valor del inventario final del ejercicio.
 * Se determina por conteo físico al final del período.
 */
const inventarioFinal = 600000;

// =============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// =============================================================================

// Cargamos los datos al iniciar para que el sitio tenga contenido desde el primer momento
cargarDatosIniciales();
