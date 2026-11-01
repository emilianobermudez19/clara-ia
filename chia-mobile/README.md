# Chía móvil (Expo Go)

App nativa de Chía para iOS y Android con Expo Router y TypeScript. Vive en el mismo repositorio que la web
y **reutiliza su lógica**: categorías y roles, detección de crisis, guías visuales, respuestas de demostración y
el modelo de la ficha (vacunas, recordatorios, consultas). La IA corre en el servidor web (master prompt y reglas
clínicas), así que **ninguna clave de IA vive en el teléfono**.

## 1. Requisitos
- Node.js 20 o superior.
- La app **Expo Go** en tu teléfono (App Store o Google Play).
- Teléfono y computadora en la **misma red Wi-Fi**.

## 2. Instalar (una sola vez)
```bash
cd chia-mobile
npm install          # instala Expo
npm run setup        # instala las versiones de cada librería compatibles con tu versión de Expo
```

## 3. Abrir en tu teléfono
```bash
npx expo start
```
- **iPhone:** abre la Cámara y escanea el código QR que aparece en la terminal.
- **Android:** abre Expo Go → "Scan QR code".

Si tu red bloquea la conexión (redes de universidad u oficina), usa: `npx expo start --tunnel`.

Sin más configuración, el chat funciona en **modo demostración** (respuestas preparadas, sin internet).

## 4. Conectar la IA real (opcional)
1. En la carpeta raíz del proyecto, con una clave en `.env` (por ejemplo `GROQ_API_KEY`), levanta la web
   accesible desde tu red:
   ```bash
   npm run dev -- --host
   ```
   Fíjate en la dirección "Network" que imprime, por ejemplo `http://192.168.1.50:5173`.
2. En `chia-mobile`, crea `.env` a partir de `.env.example` con esa dirección:
   ```
   EXPO_PUBLIC_CHIA_API_URL=http://192.168.1.50:5173
   ```
3. Reinicia con `npx expo start -c` (la `-c` limpia la caché para que lea la variable).

## Qué incluye
- **Acceso tipo app nativa:** logo, PIN de 6 dígitos que entra solo al completarse, creación de cuenta y botón
  "⚡ Consulta Express Anónima".
- **Inicio:** "¿Cómo te sientes hoy?" (la pregunta se envía sola al chat), próxima toma, las 4 categorías y
  acceso a especialista.
- **Consulta:** modo Fácil/Técnico, rol de especialista según la categoría, guías visuales en las respuestas,
  tarjetas de crisis, y para cuentas: "Guardar en Mi espacio" y "Usar mi ficha" (ambos apagados por defecto).
- **Mi espacio:** consultas guardadas, recordatorios con **notificaciones locales que llegan con la app cerrada**,
  ficha médica, **cartilla de vacunación**, diario de síntomas y solicitud de telemedicina.
- **Salir rápido:** bloquea, borra la conversación en pantalla y vuelve al acceso.

## Privacidad en el teléfono
- La ficha se cifra con **AES-256-GCM**; la clave vive en el llavero seguro del sistema (Keychain / Keystore).
- El PIN se verifica con PBKDF2-SHA256; tras 5 fallos hay espera creciente.
- La app se bloquea sola al pasar a segundo plano.
- Los avisos de recordatorio nunca dicen el nombre del medicamento.

## Limitaciones de esta primera versión
- Solo en español (la web es bilingüe).
- Las guías en el chat muestran los pasos en texto; las ilustraciones llegarán después.
- En Expo Go no hay notificaciones push remotas; los recordatorios usan notificaciones locales, que sí funcionan.
- Entrar con huella o rostro requiere una compilación propia (`eas build`); la base ya lo permite porque la clave
  vive en el llavero del sistema.
