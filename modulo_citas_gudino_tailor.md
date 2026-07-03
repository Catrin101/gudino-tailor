# **Plan de Implementación: Módulo de Citas**

Proyecto: GudiñoTailor  
Módulo: Agenda y Gestión de Citas  
Fase: 3.1 — Extensión de Funcionalidad  
Versión: 1.0  
Fecha: 2025-12-14

---

## **1. Contexto y Justificación**

La documentación base de GudiñoTailor establece que el flujo de un pedido de Confección puede incluir una etapa de **"Prueba"**, en la que el cliente asiste al taller para ajustes intermedios. Actualmente, esta cita no está formalizada en ninguna parte del sistema: Don Enrique la coordina verbalmente o por WhatsApp, lo que genera olvidos, superposición de horarios y pérdida de tiempo.

El **Módulo de Citas** soluciona esto al integrar un sistema de agenda directamente ligado a los pedidos y clientes existentes, con reglas claras de cancelación y penalización para proteger el tiempo de trabajo artesanal del sastre.

### **1.1. Problema que resuelve**

| Situación actual | Situación con el módulo |
| :--- | :--- |
| Don Enrique anota citas en papel o las recuerda de memoria | Todas las citas están en el sistema, visibles en el tablero |
| Un cliente no avisa y no llega → tiempo desperdiciado | Reglas de penalización desincentivan el no-show |
| Dos clientes agendados al mismo tiempo por error | El sistema bloquea la superposición de horarios |
| No hay control de cuántas citas se cancelan a último momento | Historial de citas y penalizaciones por cliente |

---

## **2. Alcance del Módulo (MVP de Citas)**

### **2.1. Funcionalidades Incluidas**

1. **Crear cita:** Agendar una cita vinculada a un cliente y opcionalmente a un pedido activo.
2. **Ver agenda:** Vista de calendario semanal/diaria con todas las citas del taller.
3. **Mover cita:** Cambiar fecha u hora de una cita existente, sujeto a restricciones de tiempo.
4. **Cancelar cita:** Eliminar una cita del sistema, sujeto a restricciones y posible penalización.
5. **Historial de citas por cliente:** Registro de citas pasadas, cancelaciones y penalizaciones aplicadas.
6. **Indicadores visuales:** Colores semánticos integrados al diseño UX existente del proyecto.

### **2.2. Fuera de Alcance (Futuras Versiones)**

- Notificaciones automáticas por SMS o WhatsApp al cliente.
- Pago en línea de penalizaciones.
- Vista de agenda pública o autoagendado por el cliente.
- Sincronización con Google Calendar.

---

## **3. Modelo de Datos (ERD — Extensión)**

Se añade una nueva tabla `CITAS` al esquema relacional existente, con relaciones a `CLIENTES` y opcionalmente a `PEDIDOS`.

```
erDiagram
    CLIENTES ||--o{ CITAS : "tiene agendadas"
    PEDIDOS  ||--o{ CITAS : "puede generar"
    CITAS    ||--o{ PENALIZACIONES_CITA : "puede generar"

    CITAS {
        int     id_cita         PK
        int     id_cliente      FK  "Obligatorio"
        int     id_pedido       FK  "Opcional: Vincular a pedido activo"
        string  razon           "Motivo de la cita (ver catálogo 4.1)"
        string  notas_adicionales "Texto libre para detalles extra"
        datetime fecha_hora_inicio "Inicio de la cita"
        datetime fecha_hora_fin    "Fin estimado (duración)"
        string  estado          "Agendada | Confirmada | Completada | Cancelada | No Show"
        datetime fecha_creacion
        datetime fecha_ultima_modificacion
        string  cancelada_por   "Cliente | Sistema | Taller"
    }

    PENALIZACIONES_CITA {
        int     id_penalizacion PK
        int     id_cita         FK
        int     id_cliente      FK
        string  tipo            "Cancelacion_Tardia | No_Show | Retraso_Excesivo"
        decimal monto           "En pesos MXN"
        string  estado_cobro    "Pendiente | Cobrada | Condonada"
        datetime fecha_aplicacion
        string  notas_cobro     "Cómo y cuándo se cobró o condonó"
    }
```

### **3.1. Diccionario de Campos Clave**

**`CITAS.razon`** — Catálogo de razones predefinidas (ver sección 4.1). Campo obligatorio al crear la cita.

**`CITAS.notas_adicionales`** — Campo de texto libre para que Don Enrique escriba detalles específicos. Ejemplo: *"Traer el traje que se llevó la semana pasada"*, *"Revisar largo de manga izquierda"*.

**`CITAS.estado`** — Ciclo de vida de la cita. Solo puede avanzar, no retroceder (excepto de `Confirmada` a `Agendada` si se mueve).

**`CITAS.cancelada_por`** — Registra el origen de la cancelación para efectos de penalización (solo aplica cuando el cancelante es `Cliente`).

**`PENALIZACIONES_CITA.estado_cobro`** — Permite que Don Enrique marque una penalización como `Condonada` si decide perdonarla (caso de clientes frecuentes o circunstancias especiales).

---

## **4. Reglas de Negocio del Módulo de Citas**

Estas son las reglas que el sistema **debe imponer automáticamente**, sin depender de que Don Enrique las recuerde.

### **4.1. Catálogo de Razones de Cita**

Al crear una cita, Don Enrique selecciona la razón de entre las siguientes opciones predefinidas. Esto estandariza los datos y permite filtrar la agenda por tipo de actividad.

| Código | Razón | Aplica a tipo de pedido | Duración estimada default |
| :--- | :--- | :--- | :--- |
| `PRUEBA_PARCIAL` | Prueba de prenda (ajuste intermedio) | Confección | 30 min |
| `ENTREGA_PEDIDO` | Entrega y pago final | Todos | 15 min |
| `TOMA_MEDIDAS` | Toma de medidas inicial o actualización | Confección | 20 min |
| `DEVOLUCION_RENTA` | Devolución de prenda rentada | Renta | 10 min |
| `REMIENDO_ENTREGA` | Entrega de prenda remendada | Remiendo | 10 min |
| `CONSULTA` | Consulta de presupuesto o asesoría | Sin pedido | 20 min |
| `OTRO` | Otro motivo (requiere nota adicional obligatoria) | Cualquiera | 15 min |

> **Regla:** Si la razón seleccionada es `OTRO`, el campo `notas_adicionales` se vuelve **obligatorio**. El sistema no permitirá guardar la cita sin él.

---

### **4.2. Reglas de Creación de Citas**

**R-CITA-01: Anticipación mínima para agendar**
- Una cita no puede agendarse para un horario que ocurra en **menos de 2 horas** desde el momento actual.
- *Razón:* Don Enrique necesita tiempo mínimo para preparar el material o la prenda.
- *Excepción:* El propio Don Enrique puede crear citas de último momento para clientes que ya están físicamente en el taller (flag `creada_en_taller = true`). En ese caso no aplica el bloqueo.

**R-CITA-02: Sin traslape de horarios**
- El sistema no permitirá crear dos citas con rangos de `fecha_hora_inicio` y `fecha_hora_fin` que se superpongan.
- Si hay conflicto, el sistema mostrará las citas existentes en ese horario y sugerirá el siguiente hueco disponible.

**R-CITA-03: Horario de atención del taller**
- Las citas solo pueden agendarse dentro del horario de operación definido por Don Enrique (configurable en Ajustes del sistema).
- Default sugerido: **Lunes a Sábado, 9:00 a.m. — 7:00 p.m.**
- El sistema bloqueará la creación de citas fuera de ese rango.

**R-CITA-04: Citas vinculadas a pedidos activos**
- Si se vincula una cita a un pedido (`id_pedido`), dicho pedido debe estar en estado `En Espera`, `En Proceso` o `Prueba`. No se puede vincular una cita a un pedido `Entregado` o `Abandonado`.

---

### **4.3. Reglas para Mover una Cita (Reprogramar)**

"Mover" una cita significa cambiar su `fecha_hora_inicio` y `fecha_hora_fin` a un nuevo horario.

**R-MOVER-01: Ventana libre de penalización**
- Una cita puede moverse **sin costo** si la solicitud se realiza con **más de 48 horas de anticipación** respecto a la fecha/hora original.

**R-MOVER-02: Zona de penalización por retraso en aviso**
- Si la solicitud de cambio ocurre entre **24 y 48 horas antes** de la cita:
  - Se registra una advertencia en el historial del cliente.
  - **No genera penalización económica** en la primera ocurrencia del mes.
  - A partir de la **segunda vez en el mismo mes calendario**, se aplica una penalización de **$50 MXN**, registrada en `PENALIZACIONES_CITA`.

**R-MOVER-03: Zona de penalización alta**
- Si la solicitud de cambio ocurre con **menos de 24 horas de anticipación**:
  - Se genera automáticamente una penalización de **$100 MXN**.
  - Esta penalización se convierte en un cargo pendiente que se suma al saldo del pedido vinculado, o queda registrada individualmente si la cita no tiene pedido asociado.
  - El sistema le muestra a Don Enrique la penalización antes de confirmar el movimiento, y él puede optar por `Condonar` (con registro del motivo).

**R-MOVER-04: Límite de movimientos por cita**
- Una misma cita solo puede moverse un **máximo de 2 veces**.
- Al tercer intento, el sistema bloquea el movimiento y obliga a cancelar la cita y crear una nueva (aplicando las reglas de cancelación correspondientes).
- *Razón:* Evitar que el cliente abuse de la reprogramación indefinida.

**R-MOVER-05: Aplicación de reglas al nuevo horario**
- La nueva fecha/hora propuesta debe cumplir todas las reglas de `R-CITA-01`, `R-CITA-02` y `R-CITA-03` de creación. Si no las cumple, el sistema lo bloquea.

---

### **4.4. Reglas para Cancelar una Cita**

**R-CANCEL-01: Cancelación sin costo**
- Una cita puede cancelarse **sin penalización** si se solicita con **más de 48 horas de anticipación**.
- La cita cambia a estado `Cancelada` y queda en el historial.

**R-CANCEL-02: Penalización por cancelación tardía**
- Si la cancelación ocurre entre **24 y 48 horas antes** de la cita:
  - Penalización: **$75 MXN**.
  - Se registra en `PENALIZACIONES_CITA` con `tipo = "Cancelacion_Tardia"`.

**R-CANCEL-03: Penalización máxima por cancelación de último momento**
- Si la cancelación ocurre con **menos de 24 horas de anticipación**:
  - Penalización: **$150 MXN**.
  - Tipo: `"Cancelacion_Tardia"`.

**R-CANCEL-04: No Show (Cliente No Se Presenta)**
- Si llega la hora de la cita y el cliente no asiste, Don Enrique puede marcar la cita como `No Show` manualmente desde la tarjeta de cita en el tablero.
- Penalización automática: **$200 MXN**.
- Tipo: `"No_Show"`.
- Esta es la penalización más alta porque representa el mayor desperdicio de tiempo del sastre.

**R-CANCEL-05: Cancelación iniciada por el Taller**
- Si Don Enrique cancela una cita por causas propias (enfermedad, cierre imprevisto), no aplica ninguna penalización al cliente.
- `cancelada_por = "Taller"`. La cita pasa a `Cancelada` sin cargo.

**R-CANCEL-06: Bloqueo de eliminación permanente**
- Las citas **no se eliminan** de la base de datos. Solo cambian de estado a `Cancelada`.
- *Razón:* El historial de comportamiento del cliente (cancelaciones, no shows) es información valiosa para que Don Enrique decida si le requiere un anticipo mayor o rechaza el trabajo.

---

### **4.5. Tabla Resumen de Penalizaciones**

| Acción del Cliente | Anticipación con que avisa | Penalización |
| :--- | :--- | :--- |
| Mover cita | > 48 horas | $0 MXN |
| Mover cita | 24 – 48 horas (1ª vez en el mes) | $0 MXN (advertencia) |
| Mover cita | 24 – 48 horas (2ª+ vez en el mes) | $50 MXN |
| Mover cita | < 24 horas | $100 MXN |
| Cancelar cita | > 48 horas | $0 MXN |
| Cancelar cita | 24 – 48 horas | $75 MXN |
| Cancelar cita | < 24 horas | $150 MXN |
| No presentarse (No Show) | — | $200 MXN |

> **Nota de diseño:** Todos los montos son configurables por Don Enrique en la sección de Ajustes del sistema. Los valores de la tabla son los defaults sugeridos como punto de partida.

---

### **4.6. Cobro de Penalizaciones**

**R-COBRO-01:** Si la cita está vinculada a un pedido activo, la penalización se suma automáticamente al `saldo_pendiente` de ese pedido. Don Enrique la cobrará al momento de la entrega.

**R-COBRO-02:** Si la cita **no** está vinculada a un pedido (ej. consulta de presupuesto), la penalización queda registrada como cargo independiente en el perfil del cliente, visible en su historial. Don Enrique la cobra en efectivo en el próximo contacto o la descuenta del anticipo de un futuro pedido.

**R-COBRO-03:** Don Enrique puede marcar cualquier penalización como `Condonada` con un campo de texto obligatorio que justifique el motivo. Esto queda en el historial del cliente pero no genera un cargo. No se puede condonar una penalización que ya fue marcada como `Cobrada`.

---

## **5. Extensión del Modelo de Clases (UML)**

Se extiende el diagrama de clases del documento técnico original para incluir la lógica del módulo de citas.

```
classDiagram
    Cliente "1" -- "0..*" Cita : tiene agendadas
    Pedido  "1" -- "0..*" Cita : puede generar
    Cita    "1" -- "0..*" PenalizacionCita : puede generar

    class Cita {
        +int id
        +int idCliente
        +int idPedido (opcional)
        +string razon
        +string notasAdicionales
        +datetime fechaHoraInicio
        +datetime fechaHoraFin
        +string estado
        +int vecesMovida
        +string canceladaPor
        +crearCita(datos) : Cita
        +moverCita(nuevaFechaHora) : bool
        +cancelarCita(motivo, canceladaPor) : bool
        +marcarNoShow() : bool
        +calcularPenalizacion() : decimal
    }

    class PenalizacionCita {
        +int id
        +int idCita
        +int idCliente
        +string tipo
        +decimal monto
        +string estadoCobro
        +datetime fechaAplicacion
        +string notasCobro
        +cobrar() : bool
        +condonar(motivo) : bool
    }

    class GestorCitas {
        <<Service>>
        +verificarDisponibilidad(fechaHora, duracion) : bool
        +verificarAnticipacion(fechaHora, accion) : string
        +obtenerSiguienteHueco(fechaReferencia) : datetime
        +listarCitasDelDia(fecha) : List~Cita~
        +listarCitasPorCliente(idCliente) : List~Cita~
        +listarPenalizacionesPendientes() : List~PenalizacionCita~
    }
```

---

## **6. Diseño de Interfaz (UX/UI) — Extensión**

Siguiendo la filosofía de diseño del proyecto: *botones grandes, colores semánticos, cero menús ocultos.*

### **6.1. Integración en el Tablero Principal (Kanban)**

Se añade un botón visible en la barra superior, junto a `[+ NUEVO PEDIDO]`:

```
[ LOGO ]  [ 🔍 Buscador ]  [ + NUEVO PEDIDO ]  [ 📅 AGENDA DE HOY ]
```

Al hacer clic en `📅 AGENDA DE HOY`, se despliega un panel lateral con las citas del día en orden cronológico, sin abandonar el tablero.

### **6.2. Vista de Calendario**

Pantalla dedicada accesible desde la barra de navegación secundaria. Muestra:

- **Vista semanal** (default): 7 columnas, una por día. Cada cita es un bloque de color.
- **Vista diaria**: Detalle ampliado de un solo día, con bloques de 30 minutos.

**Colores de las citas en el calendario:**

| Color | Estado de la cita |
| :--- | :--- |
| 🔵 Azul | Agendada |
| 🟢 Verde | Confirmada / Completada |
| 🟡 Amarillo | Cita en las próximas 2 horas |
| 🔴 Rojo | No Show / Cancelada con penalización |
| ⚪ Gris | Cancelada sin penalización |

### **6.3. Wizard de Nueva Cita (Stepper)**

Siguiendo el patrón del Wizard de Nuevo Pedido del proyecto base:

**Paso 1: ¿Con quién?**
- Campo de búsqueda de cliente (igual que en Nuevo Pedido).
- Si el cliente tiene penalizaciones pendientes de cobro, el sistema muestra una alerta amarilla: *"⚠️ Este cliente tiene $150 MXN pendientes de citas anteriores."*

**Paso 2: ¿Para qué?**
- Selector de razón (botones grandes con icono, ver catálogo 4.1).
- Campo de texto para notas adicionales (obligatorio si razón = `OTRO`).
- Selector de pedido vinculado (dropdown con pedidos activos del cliente). Opcional.

**Paso 3: ¿Cuándo?**
- Selector de fecha (calendario visual).
- Selector de hora (lista de huecos disponibles, no un campo libre).
- El sistema muestra la duración estimada según la razón seleccionada y permite ajustarla.
- Si el horario no está disponible, el sistema muestra el siguiente hueco libre.

**Paso 4: Confirmar**
- Resumen de la cita: cliente, razón, fecha/hora, pedido vinculado.
- Botón gigante: **`[ GUARDAR CITA ]`**

### **6.4. Tarjeta de Cita (Detalle)**

Al tocar una cita en el calendario, se abre un panel de detalle con:

- Nombre del cliente (enlace al perfil).
- Razón y notas.
- Pedido vinculado (enlace al pedido).
- Estado actual.
- Botones de acción contextuales:
  - `[ ✏️ MOVER CITA ]` — Solo visible si la cita está en estado `Agendada` o `Confirmada`.
  - `[ ❌ CANCELAR CITA ]` — Igual condición. Muestra advertencia con monto de penalización si aplica.
  - `[ ✅ MARCAR COMPLETADA ]` — Disponible cuando la cita ya pasó.
  - `[ 🚫 NO SE PRESENTÓ ]` — Disponible cuando la cita ya pasó y sigue en estado `Agendada`/`Confirmada`.

### **6.5. Historial de Citas en el Perfil del Cliente**

Se añade una tercera sección en la pantalla de Detalle de Cliente (además de Medidas y Pedidos):

- **Sección: Historial de Citas**
  - Lista de todas las citas (completadas, canceladas, no shows).
  - Chip de color por estado.
  - Penalizaciones asociadas y su estado de cobro.
  - Indicador de resumen: *"3 citas completadas · 1 cancelación tardía · 1 No Show"*

---

## **7. Historias de Usuario del Módulo de Citas**

### **7.1. Gestión de Citas**

| ID | Historia de Usuario | Criterios de Aceptación |
| :--- | :--- | :--- |
| **HU-C01** | Como Don Enrique, quiero crear una cita para un cliente vinculada a un pedido activo. | El sistema valida disponibilidad, horario de taller y anticipación mínima de 2 horas. |
| **HU-C02** | Como Don Enrique, quiero ver todas las citas del día en un solo vistazo desde el tablero. | El panel lateral de agenda muestra las citas del día en orden cronológico sin salir del tablero. |
| **HU-C03** | Como Don Enrique, quiero mover una cita a otra fecha u hora. | El sistema calcula la penalización según la anticipación con que se mueve, la muestra antes de confirmar y permite condonarla. |
| **HU-C04** | Como Don Enrique, quiero cancelar una cita y que el sistema me diga si aplica penalización. | Antes de confirmar la cancelación, el sistema muestra el monto de penalización y requiere confirmación explícita. |
| **HU-C05** | Como Don Enrique, quiero marcar que un cliente no se presentó. | El sistema registra el No Show, genera penalización de $200 MXN automáticamente y la añade al saldo del pedido o al historial del cliente. |
| **HU-C06** | Como Don Enrique, quiero ver el historial de comportamiento de un cliente en citas. | El perfil del cliente muestra un resumen de citas completadas, cancelaciones y no shows, con montos de penalizaciones. |
| **HU-C07** | Como Don Enrique, quiero condonar una penalización si el cliente tiene una buena razón. | El sistema permite marcar penalizaciones como "Condonadas" con campo de motivo obligatorio. No se puede condonar lo ya cobrado. |

---

## **8. Flujos de Trabajo del Módulo**

### **Flujo C: Creación de Cita**

```
INICIO: Don Enrique toca [ 📅 NUEVA CITA ]
  │
  ▼
Paso 1: Buscar o seleccionar cliente
  │  ¿Tiene penalizaciones pendientes?
  │  ├─ SÍ → Mostrar alerta amarilla (no bloquea)
  │  └─ NO → Continuar
  │
  ▼
Paso 2: Seleccionar razón de la cita
  │  ¿Razón = OTRO?
  │  ├─ SÍ → Forzar campo de notas adicionales
  │  └─ NO → Continuar
  │
  ▼
Paso 3: Seleccionar fecha y hora
  │  ¿Es dentro de las próximas 2 horas?
  │  ├─ SÍ y NO es "creada en taller" → BLOQUEO, sugerir próximo hueco
  │  ├─ ¿Fuera de horario del taller? → BLOQUEO
  │  ├─ ¿Traslape con otra cita? → BLOQUEO, sugerir próximo hueco
  │  └─ VÁLIDO → Mostrar resumen
  │
  ▼
Paso 4: Confirmar y guardar
  └── Estado inicial: "Agendada"
```

### **Flujo D: Mover una Cita**

```
INICIO: Don Enrique toca [ ✏️ MOVER CITA ] en una tarjeta
  │
  ▼
¿La cita ya fue movida 2 veces?
  ├─ SÍ → BLOQUEO: "Esta cita alcanzó el límite de movimientos.
  │        Cancélala y crea una nueva."
  └─ NO → Continuar
  │
  ▼
Calcular anticipación respecto a la fecha/hora ORIGINAL:
  ├─ > 48 horas → Sin penalización
  ├─ 24–48 horas, 1ª vez en el mes → Advertencia en historial, sin cargo
  ├─ 24–48 horas, 2ª+ vez en el mes → Penalización $50 MXN
  └─ < 24 horas → Penalización $100 MXN
  │
  ▼
Mostrar al usuario: nueva fecha, nueva hora y monto de penalización (si aplica)
  │
  ▼
¿Don Enrique confirma?
  ├─ SÍ → Guardar nueva fecha/hora, registrar penalización, vecesMovida++
  └─ NO → Cancelar, no se aplica ningún cambio
```

### **Flujo E: Cancelar una Cita**

```
INICIO: Don Enrique toca [ ❌ CANCELAR CITA ]
  │
  ▼
¿Quién cancela?
  ├─ TALLER → Sin penalización, estado = "Cancelada", canceladaPor = "Taller"
  └─ CLIENTE (Don Enrique lo registra así) → Calcular:
       ├─ > 48 horas → Sin penalización
       ├─ 24–48 horas → Penalización $75 MXN
       └─ < 24 horas → Penalización $150 MXN
  │
  ▼
Mostrar resumen: monto de penalización + opción "Condonar (ingresa motivo)"
  │
  ▼
Don Enrique confirma → Estado = "Cancelada", penalización registrada o condonada
```

---

## **9. Impacto en Módulos Existentes**

| Módulo existente | Cambio requerido |
| :--- | :--- |
| **Tablero Kanban** | Añadir barra lateral "Agenda de Hoy" y botón `📅 NUEVA CITA` |
| **Perfil del Cliente** | Añadir tercera sección: Historial de Citas |
| **Módulo de Pagos/Cuentas** | Las penalizaciones de citas deben sumarse al `saldo_pendiente` del pedido vinculado |
| **Base de datos** | Crear tablas `CITAS` y `PENALIZACIONES_CITA` con sus relaciones FK |
| **Clase `Pedido`** | Añadir método `getCitas()` que retorna la lista de citas vinculadas |
| **Clase `Cliente`** | Añadir métodos `getCitas()` y `getPenalizacionesPendientes()` |

---

## **10. Plan de Implementación por Etapas**

### **Etapa 1: Base de datos y lógica de negocio** *(Backend)* ✅ COMPLETADA

- [x] Crear tabla `CITAS` con todos sus campos.
- [x] Crear tabla `PENALIZACIONES_CITA`.
- [x] Implementar restricciones de integridad (FK, estados válidos, triggers).
- [x] Implementar servicio `GestorCitas` (CitaService) con la lógica de:
  - Verificación de disponibilidad.
  - Verificación de anticipación y cálculo de penalización.
  - Validación de horarios de taller (configurable).
- [x] Endpoints REST requeridos (Supabase Edge Functions):
  - `POST /citas` — Crear cita.
  - `GET /citas?fecha=YYYY-MM-DD` — Listar citas de un día.
  - `GET /citas/cliente/:id` — Historial por cliente.
  - `PUT /citas/:id/mover` — Reprogramar cita.
  - `PUT /citas/:id/cancelar` — Cancelar cita.
  - `PUT /citas/:id/no-show` — Marcar No Show.
  - `PUT /penalizaciones/:id/condonar` — Condonar penalización.
  - `PUT /penalizaciones/:id/cobrar` — Marcar como cobrada.

### **Etapa 2: Interfaz de usuario** *(Frontend)*

- [ ] Vista de Calendario (semanal y diario).
- [ ] Panel lateral "Agenda de Hoy" en el Tablero.
- [ ] Wizard de Nueva Cita (4 pasos).
- [ ] Tarjeta de detalle de cita con botones de acción.
- [ ] Sección de Historial de Citas en el perfil del cliente.
- [ ] Modal de confirmación con monto de penalización.
- [ ] Modal de condonación con campo de motivo obligatorio.

### **Etapa 3: Integración con módulos existentes**

- [ ] Conectar penalizaciones al `saldo_pendiente` del pedido vinculado.
- [ ] Mostrar penalizaciones pendientes en la sección de Pagos/Cuentas.
- [ ] Integrar indicador de comportamiento del cliente (badge de alertas).

### **Etapa 4: Configuración y ajustes**

- [ ] Pantalla de Ajustes: Horario de atención del taller.
- [ ] Pantalla de Ajustes: Montos de penalización (editables).
- [ ] Pantalla de Ajustes: Duración default por tipo de cita.

---

## **11. Criterios de Aceptación del Módulo Completo**

El módulo se considera terminado y listo para uso en producción cuando:

1. Don Enrique puede crear una cita en **menos de 60 segundos** desde el tablero principal.
2. El sistema bloquea **automáticamente** la creación de citas fuera del horario del taller y en horarios ya ocupados.
3. Al intentar mover o cancelar una cita, el sistema muestra **el monto exacto de penalización** antes de que Don Enrique confirme la acción.
4. Las penalizaciones de citas aparecen en el **saldo pendiente del pedido vinculado** al momento de la entrega.
5. El historial de un cliente muestra todas sus citas, cancelaciones y penalizaciones sin importar cuánto tiempo haya pasado.
6. Don Enrique puede condonar cualquier penalización pendiente con un motivo registrado.

---

*Documento generado como extensión del Project Charter, ERD, UML y documentos UX/UI de GudiñoTailor v1.0.*
