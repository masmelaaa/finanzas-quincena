# 💸 Quincena — Control de finanzas quincena a quincena

App personal para controlar la plata **quincena a quincena**, pensada para quien
cobra el **5 y el 20** en Colombia. Diseño estilo iOS (claro/oscuro automático),
instalable en el iPhone como PWA, y con **todos los datos guardados solo en tu
dispositivo** — nada se sube a internet.

> Hecha a la medida: presupuesta tus buses según tu rutina real (días impares +
> sábados, menos festivos), te avisa cuando vas gastando rápido, y lleva el conteo
> de cuántas cuotas de deuda te faltan.

---

## ✨ Qué hace

- **Disponible real** — el número héroe: sueldo menos gastos, transporte reservado,
  gastos fijos, ahorro comprometido y cuotas de deuda. Baja en vivo con cada gasto.
- **Anillo de quincena** — muestra tu dinero disponible y, con un punto, cuánto del
  periodo ha transcurrido. De un vistazo ves si tu plata se gasta más rápido que el tiempo.
- **Presupuesto de transporte automático** — calcula tus pasajes de la quincena a
  partir de tu regla: **días impares + sábados − festivos**, × pasajes/día × valor del pasaje.
  Los **festivos colombianos** se calculan solos (Ley Emiliani + Semana Santa).
- **Alertas** — límite por categoría (ámbar al 80%, rojo al 100%) y **alerta de ritmo**:
  _"a este paso te quedas sin plata el 15"_.
- **Ahorro paso a paso** — metas con aporte sugerido por quincena (_vas al día / atrasado_)
  y un **reto escalonado** con casillas y racha.
- **Extras / dinero adicional** — todo lo que entra por fuera de la nómina (regalos, ventas,
  horas extra) va **100% al ahorro**, dirigido a una meta o al bote general.
- **Contador de cuotas de deuda** — dices en qué quincena pagas cada deuda (5 o 20) y la
  pantalla principal te muestra la del periodo con el **contador decreciente** de cuotas.
- **Registro rápido** — teclado numérico grande y atajo de un toque para el pasaje del bus.
- **Respaldo** — exporta/importa tus datos en JSON para pasar de un dispositivo a otro.

## 🧮 El cálculo de transporte (ejemplo real)

Quincena **5 – 19 de agosto 2026**, pasaje $3.550, 2 pasajes/día:

```
Días impares:  5, 7, 9, 11, 13, 15, 17, 19
+ Sábados:     8, 15
− Festivos:    7 (Batalla de Boyacá), 17 (Asunción)
────────────────────────────────────────────────
Salidas:       5, 8, 11, 13, 15, 19  →  6 días
× 2 pasajes:   12 pasajes
× $3.550:      $ 42.600  ← presupuesto de transporte
```

Esta lógica está cubierta por tests (`src/lib/engine.test.ts`) y verificada contra el
calendario oficial 2026–2027.

## 📱 Instalar en el iPhone

1. Abre la app en **Safari**.
2. Toca **Compartir** → **Añadir a pantalla de inicio**.
3. Ábrela desde el ícono: se ve en pantalla completa, como una app nativa.

## 🛠️ Desarrollo

```bash
npm install
npm run dev       # servidor local
npm test          # tests del motor de cálculo
npm run build     # build de producción (PWA)
npm run preview   # previsualiza el build
```

Stack: **Vite + React + TypeScript + Tailwind + Zustand + Framer Motion + vite-plugin-pwa**.

## 🔒 Privacidad

Toda tu información financiera vive en el `localStorage` del navegador de tu teléfono.
No hay backend, no hay cuentas, no hay claves ni servidores. El repositorio contiene
solo código y **datos de ejemplo ficticios**; tus cifras reales nunca se suben.

---

Hecho con cariño para llevar mejor las cuentas. 🇨🇴
