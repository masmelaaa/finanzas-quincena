# 💸 Quincena — Control de finanzas personales

App personal para controlar tu plata pago a pago. Diseño estilo iOS (claro/oscuro
automático), instalable como PWA en iPhone y Android, **o como app nativa Android
(.apk)**. Todos los datos viven **solo en tu dispositivo** — nada se sube a internet.

> Hecha a la medida: presupuesta tu transporte según tu rutina real, dicta gastos
> por voz, sugiere la categoría sola, avisa cuando vas gastando rápido, y lleva el
> conteo de cuotas de deuda, préstamos que hiciste, y cuánto tienes en efectivo vs. digital.

---

## ✨ Qué hace

- **Disponible real** — el número héroe: sueldo menos gastos, transporte reservado,
  gastos fijos, ahorro comprometido y cuotas de deuda. Baja en vivo con cada gasto.
- **Días de pago configurables** — quincenal (tú eliges los dos días del mes),
  semanal (un día, cada 1 o 2 semanas) o mensual (un día del mes). Por defecto,
  quincenal el 5 y el 20.
- **Transporte por modo** — bus, moto o Uber/taxi (mismo cálculo: días impares +
  sábados − festivos × tarifa) o **vehículo propio** (gasolina + parqueadero, presupuesto
  fijo). Los **festivos colombianos** se calculan solos (Ley Emiliani + Semana Santa).
  La cantidad de viajes de la quincena se puede **editar a mano** si sobran o faltan.
- **Dictado de voz + categoría automática** — el botón 🎤 dicta la nota del gasto
  (Chrome/Android), y la app sugiere sola la categoría según lo que escribas o dictes
  ("Uber al trabajo" → Transporte).
- **Efectivo vs. digital** — marca cada gasto y cada ingreso extra como efectivo o
  digital, y la pantalla principal muestra cuánto tienes de cada uno.
- **Extras / dinero adicional** — decides si un ingreso fuera de nómina se suma a tu
  **sueldo** de la quincena, a una **meta**, o al **bote de ahorro**.
- **Alertas** — límite por categoría (ámbar al 80%, rojo al 100%) y **alerta de ritmo**:
  _"a este paso te quedas sin plata el 15"_.
- **Ahorro paso a paso** — metas con aporte sugerido por periodo (_vas al día / atrasado_)
  y un **reto escalonado** con casillas y racha.
- **Deudas** — contador decreciente de cuotas, eliges en qué periodo se paga cada una.
- **Me deben** — registra plata que le prestaste a alguien, con abonos y saldo pendiente.
- **Tarjetas de crédito** — cupo, gastado y disponible, con registro de consumos y pagos.
- **Categorías 100% tuyas** — crea, edita, borra y **reordena arrastrando**, con emoji libre.
- **Respaldo automático** — tus datos se guardan solos (doble copia en el dispositivo);
  además puedes exportar/importar un JSON para pasar de un dispositivo a otro.
- **Empieza vacía** — arranca desde cero; tú registras todos tus datos.

## 📱 Instalar

### Como PWA (iPhone o Android, sin instalar nada del Play Store)

1. Abre **https://masmelaaa.github.io/finanzas-quincena/** en Safari (iPhone) o Chrome (Android).
2. iPhone: **Compartir → Añadir a pantalla de inicio**. Android: el navegador ofrece
   "Instalar app" solo o desde el menú ⋮.
3. Ábrela desde el ícono: pantalla completa, como una app nativa.

### Como app nativa Android (.apk)

Ya hay un APK compilado en `releases/Quincena-v1.0.apk` (release, firmado) — para
instalarlo en un Android: pásalo al teléfono (WhatsApp, Drive, USB), ábrelo, y activa
"Instalar apps de fuentes desconocidas" si el sistema lo pide la primera vez.

**iPhone no puede instalar .apk** (es un formato exclusivo de Android) — para iPhone
usa la opción de PWA de arriba.

## 🛠️ Desarrollo

```bash
npm install
npm run dev         # servidor local
npm test            # tests del motor de cálculo
npm run build       # build de producción para GitHub Pages (con subruta)
npm run preview     # previsualiza el build
```

Stack: **Vite + React + TypeScript + Tailwind + Zustand + Framer Motion + vite-plugin-pwa**.

## 🤖 Recompilar el APK de Android

Requiere Android SDK (API 34+, build-tools 34+) y **JDK 21**. La primera vez:

```bash
npm run build:apk                 # build web con rutas relativas + sync a Capacitor
cd android
./gradlew assembleDebug           # APK de prueba (siempre instala sin firma extra)
./gradlew assembleRelease         # APK firmado, más liviano (necesita el keystore)
```

- El **keystore de release** vive en `android/keystore/quincena-release.jks` — **no está
  en git** (es la identidad de la app; guárdalo aparte, lo necesitas para publicar
  actualizaciones con la misma firma). Si se pierde, un release nuevo se instala como
  app distinta, no como actualización.
- Los íconos/splash se generan desde `assets/icon.png` (1024×1024) con
  `npx @capacitor/assets generate --android`.
- El APK queda en `android/app/build/outputs/apk/{debug,release}/`.

## 🔒 Privacidad

Toda tu información financiera vive en el dispositivo (localStorage + una copia de
respaldo en IndexedDB). No hay backend, no hay cuentas, no hay claves ni servidores.
El repositorio contiene solo código; tus cifras reales nunca se suben.

---

Hecho con cariño para llevar mejor las cuentas. 🇨🇴
