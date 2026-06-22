# Sistema de Gestión Contable: Método Pormenorizado

Proyecto académico desarrollado como parte de la asignatura de **Diseño Web** y **Contabilidad Básica**, enfocado en la automatización del método de registro pormenorizado o analítico mediante tecnologías web.

## Descripción del Proyecto
Este sistema permite registrar y procesar las operaciones de mercancías bajo el método pormenorizado. La aplicación automatiza el cálculo de las compras totales, compras netas y el costo de lo vendido, permitiendo obtener la utilidad bruta de manera precisa y eficiente, eliminando el error humano asociado a los cálculos manuales.

## Tecnologías Utilizadas
*   **HTML**: Estructura semántica de la interfaz.
*   **CSS**: Estilos y diseño para una mejor experiencia de usuario.
*   **JavaScript**: Lógica de negocio, manipulación del DOM y procesamiento de los cálculos contables en tiempo real.

## Lógica de Negocio (Contabilidad)
El sistema implementa estrictamente las fórmulas del método analítico:
1.  **Compras Totales** = Compras + Gastos de Compra.
2.  **Compras Netas** = Compras Totales - (Devoluciones + Descuentos + Rebajas sobre compras).
3.  **Costo de lo Vendido** = Inventario Inicial + Compras Netas - Inventario Final.
