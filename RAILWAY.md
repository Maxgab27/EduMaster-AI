# Railway: QR de certificados funcional desde el celular

Guía mínima para que el QR apunte a una URL pública y el celular pueda abrirlo sin importar la red.

## 1. Backend (API)

El repositorio ya trae `railway.json` en la raíz, que usa `backend/Dockerfile` y el healthcheck `/health`.

1. Crea el servicio en Railway desde el repositorio.
2. En **Settings → Networking**, genera el dominio público. Ejemplo:
   `https://edumaster-api-production.up.railway.app`
3. Opcional: agrega la variable de entorno del frontend para CORS:
   ```text
   PUBLIC_FRONTEND_ORIGIN=https://TU-FRONTEND.up.railway.app
   ```
   No es obligatoria si el frontend también termina en `.railway.app` o `.up.railway.app`, porque el backend ya acepta esos orígenes.

## 2. Frontend (SPA)

En Railway (o Vercel/Netlify) configura estas variables **antes de compilar**:

```text
VITE_CORE_API_BASE_URL=https://TU-BACKEND.up.railway.app
```

`VITE_PUBLIC_ORIGIN` **no es necesario** en Railway: si no existe, el QR usa `window.location.origin`, es decir, la URL pública del frontend. Si quieres forzar otro host, define:

```text
VITE_PUBLIC_ORIGIN=https://TU-FRONTEND.up.railway.app
```

Compilación:

```bash
cd frontend
npm install
npm run build
```

Publica el contenido de `frontend/dist`.

## 3. Cómo se ve el QR

Con la configuración anterior, el QR codifica:

```text
https://TU-FRONTEND.up.railway.app/?verify=EDU-2026-98124
```

Al escanearlo:

1. Se abre la SPA en el celular.
2. `App.tsx` detecta `?verify=` y entra a **Certificados**.
3. La verificación llama a `https://TU-BACKEND.up.railway.app/api/v1/compat/certificates/verify/{folio}`.
4. Aparece **“Folio válido”** y el evento `certificate.verify` queda en la auditoría.

Dentro de la vista del QR también hay un botón **“Abrir comprobante (celular)”**: navega a `?receipt=<folio>`, una página simple de la misma SPA. No depende de ventanas emergentes ni de descargas: el celular muestra el comprobante listo para leer o guardar como PDF, y el botón **Volver** regresa a la verificación.

## 4. Regla práctica

- **Misma Wi-Fi (prueba local):** `VITE_PUBLIC_ORIGIN=http://192.168.18.36:5173`.
- **Railway / internet:** deja `VITE_PUBLIC_ORIGIN` sin definir y usa la URL pública; define solo `VITE_CORE_API_BASE_URL` apuntando al backend.

Los datos siguen siendo sintéticos y el comprobante advierte que no equivale a un certificado oficial.
