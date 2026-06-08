# Conexiones de hardware — Monitor Moto TVS Apache 160 4v

## Componentes necesarios

| Componente | Para qué | Alternativa |
|-----------|---------|------------|
| ESP32 (cualquier dev board) | Microcontrolador + WiFi | — |
| Resistencia 100kΩ | Divisor de voltaje (R1) | — |
| Resistencia 27kΩ  | Divisor de voltaje (R2) | — |
| ACS712-5A | Sensor de corriente | INA219 (mejor precisión) |
| Capacitor 100nF | Filtro de ruido en ADC | Opcional pero recomendado |

---

## 1. Sensor de voltaje (divisor resistivo)

Convierte el voltaje de la batería (0–15V) al rango del ESP32 (0–3.3V).

```
Batería (+) ──[R1: 100kΩ]──┬──[R2: 27kΩ]── GND
                            │
                         GPIO34 (PIN_VOLTAJE)
                            │
                        [100nF a GND]   ← filtro de ruido (opcional)
```

**Cálculo:**
- Voltaje máximo batería: 15V
- Voltaje en GPIO34: 15V × 27/(100+27) = 3.19V ✓ (seguro para el ESP32)
- Factor de escala en código: (100+27)/27 = 4.70

---

## 2. Sensor de corriente (ACS712-5A)

```
Batería (+) ──[ACS712 IP1]──[ACS712 IP2]── Carga

ACS712 VCC  ──── 3.3V del ESP32
ACS712 GND  ──── GND
ACS712 VOUT ──── GPIO35 (PIN_CORRIENTE)
```

**Modelos del ACS712:**
| Modelo    | Rango | Sensibilidad | Recomendado para |
|-----------|-------|-------------|-----------------|
| ACS712-5A | ±5A   | 185 mV/A    | ✅ Tu Apache (9A pico) |
| ACS712-20A| ±20A  | 100 mV/A    | Cargas mayores |
| ACS712-30A| ±30A  | 66 mV/A     | Cargas grandes |

> ⚠️ El ACS712-5A puede saturarse si la corriente supera 5A continuos.
> Si tu Apache llega a 9A de pico, considera el **ACS712-20A** para más margen,
> o mejor aún, el **INA219** (ver sección alternativa en el .ino).

---

## 3. Alimentación del ESP32

Opciones (de mejor a peor):

1. **Regulador 7805** desde la batería de 12V → 5V → pin VIN del ESP32
2. **Módulo DC-DC step-down (buck)** ajustado a 5V (más eficiente que el 7805)
3. **Cable USB** desde un cargador de moto (solo para pruebas en banco)

```
Batería 12V ──[Buck converter / 7805]── 5V ──── VIN del ESP32
Batería GND ──────────────────────────────────── GND del ESP32
```

---

## 4. Diagrama completo

```
BATERÍA 12V
    (+)──────────────────────────[R1: 100kΩ]──┬──[R2: 27kΩ]── GND
    │                                          └──── GPIO34
    │
    └──[ACS712 IP1]──[ACS712 IP2]──── Carga (+)
              │
         ACS712 VOUT ──────────────────────── GPIO35
         ACS712 VCC  ──────────────────────── 3.3V ESP32
         ACS712 GND  ──────────────────────── GND
    │
    └──[Buck 12V→5V]──────────────────────── VIN ESP32
    (-)────────────────────────────────────── GND ESP32
```

---

## 5. Calibración inicial

1. Conecta todo y abre el **Serial Monitor** (115200 baud).
2. El ESP32 imprime la IP asignada → cópiala en `App.jsx`.
3. Con la batería cargada, compara el voltaje del Serial Monitor con un multímetro.
4. Si hay diferencia, ajusta `OFFSET_VOLTAJE` en `config.h`.
5. Con la moto en reposo (sin carga), la corriente debe leer ~0A.
6. Si no, ajusta `OFFSET_CORRIENTE` en `config.h`.
