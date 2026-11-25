# 🎓 EduMaster.ai Enterprise — Plataforma Educativa Adaptativa con IA & Gobernanza

[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Oxlint-Passing-10B981?style=flat-square)](https://oxc.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**EduMaster.ai Enterprise** es un ecosistema de gestión del aprendizaje (LMS) y plataforma de analítica predictiva adaptativa impulsada por arquitecturas de **Aprendizaje Multitarea (Multi-Task Learning - MTL)**. Ha sido concebida bajo el principio de **Autoridad Docente (*Human-in-the-Loop*)**, asegurando transparencia algorítmica, explicabilidad basada en competencias y pleno cumplimiento normativo de privacidad de datos (Ley 29733 / RGPD).

---

## 📋 Tabla de Contenidos

- [1. Resumen y Objetivos del Proyecto](#1-resumen-y-objetivos-del-proyecto)
- [2. Estado del Avance y Progreso](#2-estado-del-avance-y-progreso)
- [3. Arquitectura del Sistema](#3-arquitectura-del-sistema)
- [4. Estructura del Repositorio](#4-estructura-del-repositorio)
- [5. Módulos y Funcionalidades Principales](#5-módulos-y-funcionalidades-principales)
- [6. Guía de Instalación y Activación](#6-guía-de-instalación-y-activación)
- [7. Verificación de Calidad y Compilación](#7-verificación-de-calidad-y-compilación)
- [8. Generación del Informe Ejecutivo](#8-generación-del-informe-ejecutivo)
- [9. Principios Éticos y Gobernanza de IA](#9-principios-éticos-y-gobernanza-de-ia)

---

## 1. Resumen y Objetivos del Proyecto

El proyecto aborda las limitaciones críticas de las plataformas educativas convencionales:
1. **Falta de Adaptabilidad en Tiempo Real:** Los contenidos estáticos no responden a los distintos ritmos y estilos cognitivos de los estudiantes.
2. **Carga Operativa de Calificación:** Los docentes dedican más del 60% de su tiempo a revisiones repetitivas de código y evaluaciones formativas.
3. **Opacidad de Modelos de IA (*Black Box*):** Predicciones académicas no explicables que introducen sesgos o vulneran derechos de privacidad.
4. **Desconexión con Estándares de Privacidad:** Falta de trazabilidad en el tratamiento de datos y solicitudes de derechos de acceso, rectificación, cancelación u oposición (ARCO).

**EduMaster.ai** resuelve estos desafíos integrando:
- Inferencia multi-cabezal para estimar simultáneamente: dominio de habilidades, tiempo por módulo, probabilidad de abandono y recomendación de recursos.
- Interfaz interactiva para docentes (*SpeedGrader*) con borrador asistido por IA y firma digital inmutable.
- Entorno de práctica para estudiantes (*Code Sandbox*) con ejecución y retroalimentación adaptativa.
- Panel de Auditoría y Gobernanza con registro de eventos de inferencia y atención de solicitudes ARCO.

---

## 2. Estado del Avance y Progreso

El proyecto se encuentra en un estado funcional avanzado **como frontend base/demo** con validación de diseño profesional y compilación limpia.

> ⚠️ **Estado real:** existe un **backend DEMO** en `api/` con FastAPI y lógica MTL entrenada sobre dataset sintético, pero todavía no hay base de datos, autenticación real, WebSocket/SSE ni RBAC validado en servidor. Los KPIs, logs y flujos siguen siendo sintéticos y están etiquetados como `DEMO`. La tabla siguiente describe la **capa visual**, no un sistema en producción.

### 2.1 Capa de contrato y RBAC de demostración (agregado recientemente)

- `src/services/dashboardApi.ts` define el contrato `GET /api/v1/dashboard/summary` con envelope `{ data, meta }`.
- Si `VITE_API_BASE_URL` está vacío, el servicio usa un adaptador DEMO (ver `.env.example` en `frontend/`).
- `src/auth/permissions.ts` implementa RBAC de **frontend** por rol y módulo; la autoridad real debe validarse en backend.
- Los rótulos engañosos (`PRODUCCIÓN VERIFICADA`, `WS EN VIVO (14ms)`, `Sincronizado`, `99.8%`) fueron reemplazados por estados honestos de DEMO/sin conexión.
- `npm run lint` termina con **0 errores y 0 warnings**; `npm run build` compila correctamente.

### 2.2 Backend DEMO de lógica MTL (agregado recientemente)

- `api/` contiene una API FastAPI con contrato `/api/v1`, correlation id, auditoría en memoria y envelope `{ data, meta }`.
- `api/ml/` implementa la sección 9 del documento: baselines interpretables, red multitarea compacta en Python puro, pérdida ponderada enmascarada, early stopping, calibración y métricas por tarea.
- El artefacto `api/ml/artifacts/model.json` se entrega entrenado; la inferencia no entrena en el hilo HTTP.
- `api/ml/artifacts/evaluation.json` compara MTL contra regresión logística y gradient boosting. En datos DEMO el baseline gana en varias tareas, por lo que la decisión registrada es **no publicar**.
- El visualizador neural consume los valores reales del endpoint cuando `VITE_API_BASE_URL` apunta a la API; sin él muestra estado DEMO local sin métricas inventadas.
- Ver `api/README.md` para ejecución local y despliegue en Railway Free.

### 2.3 Backend activo en la sustentación (`backend/`)

- Es el servicio que usa `railway.json` y el que responde en `http://127.0.0.1:8000`.
- Expone **6 rutas**: `/`, `/health`, `/api/v1/inference/dropout-risk`, `/api/v1/grades/submit`, `/api/v1/audit/logs` y `/api/v1/students/at-risk`.
- Persistencia: **SQLite local** por defecto (`sqlite+aiosqlite:///./edumaster_enterprise.db`). Con `DATABASE_URL` (por ejemplo, la que inyecta Railway) usa PostgreSQL vía `asyncpg`, sin cambiar código. Supabase sigue fuera de alcance.
- Motor de inferencia: detecta Torch si está disponible; si no, usa el **fallback NumPy**. El Dockerfile ya no instala PyTorch.
- Firmas: hash SHA-256 en `audit_logs`. Si no se envía `X-Actor`, la respuesta marca `actor_source=body_unverified`; **no es autenticación real**.
- Las 6 rutas anteriores siguen intactas. Se añadió un **contrato de compatibilidad** bajo `/api/v1/compat` con envelope `{ data, meta }` para el frontend: entregas, riesgo, inferencia, firma, auditoría, más el listado y la verificación de certificados.
- El frontend sigue en **DEMO** mientras `VITE_API_BASE_URL` esté vacío, **excepto el núcleo real**: con `VITE_CORE_API_BASE_URL=http://127.0.0.1:8000`, riesgo, SpeedGrader, firma y auditoría van por HTTP real a SQLite. Los otros módulos no cambian.
- Evidencia: `backend/tests/test_smoke.py` (**34/34**; conserva las 6 rutas y valida `/compat`), `FUNCIONALIDADES_Y_MEJORAS.md` §7, `MATRIZ_CUMPLIMIENTO_DOCUMENTO.md` y `PLAN_MEJORA_OBJETIVO.md`.

### 2.4 Verificación de certificados con QR escaneable (2026-11-24)

- El panel de certificados genera un **QR PNG real** con `qrcode`; antes era un SVG ilustrativo que ningún lector podía decodificar.
- El QR codifica la URL absoluta `/?verify=<folio>` construida desde `window.location.origin`, por ejemplo `http://127.0.0.1:5173/?verify=EDU-2026-98124`.
- Al escanearlo, la SPA abre “Certificados” y valida el folio y su hash SHA-256 contra `GET /api/v1/compat/certificates/verify/{folio}`; el evento queda en la auditoría como `certificate.verify`.
- OpenCV decodificó el PNG a la URL exacta y el navegador mostró “Folio válido · EDU-2026-98124” con **0 errores de consola**.
- Para escanearlo con un celular en la **misma Wi-Fi**: `frontend/.env.local` define `VITE_PUBLIC_ORIGIN=http://192.168.18.36:5173`, Vite y Uvicorn escuchan en `0.0.0.0`, y el cliente HTTP reemplaza `127.0.0.1` por el host de la página. Así el QR y la API apuntan a la PC, no al celular. Si cambia la red, actualiza la IP con `ipconfig`.
- Límite honesto: la publicación en Internet la ejecuta el usuario siguiendo `RAILWAY.md`; no se realizó desde esta sesión. Los registros son sintéticos y el propio mensaje advierte que **no es un certificado oficial**. Ver `FUNCIONALIDADES_Y_MEJORAS.md` §8.

### 2.5 Chat DEMO de Comunidad (2026-11-24)

- La vista **Comunidad** funciona como chat creíble en modo DEMO: hilos sembrados, avatares por rol, tiempo relativo, separadores por día, búsqueda de hilos y mensajes, envío con `Enter` (`Shift+Enter` para salto), responder citando, editar, borrar, likes y moderación local.
- Las respuestas automáticas son **reglas etiquetadas** `DEMO · SIMULADO`, con indicador de escritura y un interruptor para desactivarlas; **no son IA ni llegan a un servidor**.
- Todo se guarda en `localStorage` (`edumaster_demo_v1`) con auditoría `community.message.posted/edited/deleted/moderated/simulated`. Cada navegador tiene su propia copia: no hay sincronización entre usuarios ni tiempo real, y se borra al limpiar datos del navegador.
- Verificado con `npm run lint` y `npm run build` sin `.env.local`: envío, respuesta simulada, cita, edición, borrado, búsqueda y persistencia tras recargar, con **0 errores de consola**.

| Componente / Módulo | Estado | Avance / Descripción Técnica |
| :--- | :---: | :--- |
| **Arquitectura de Frontend** | `100% Completo` | React 19 + TypeScript + Vite + Tailwind CSS. Arquitectura modular por componentes y vistas. |
| **Visualizador Neuronal** | `100% Completo` | Canvas SVG interactivo con simulación de flujo de activaciones forward/backward, capas densas y multi-head. Lienzo limpio y despejado. |
| **Mapa Global de Progreso** | `100% Completo` | Siluetas vectoriales precisas de continentes (Norteamérica, Sudamérica, Europa, África, Asia, Oceanía), coordenadas estables de alta precisión y sin animaciones parpadeantes. |
| **Panel y Gráfica Donut** | `100% Completo` | Componente compacto con proporción optimizada para eliminar desperdicio de espacio vertical en dashboard. |
| **SpeedGrader Docente** | `100% Completo` | Modal con divisor de pantalla (código del estudiante + rúbrica oficial), ajuste de puntajes, sugerencias asistidas por IA y cumplimiento estricto de React Rules of Hooks. |
| **Sandbox de Código** | `100% Completo` | Entorno de desarrollo para estudiantes en Python con ejecución simulada, feedback inmediato y guardrails de seguridad. |
| **Gobernanza & ARCO** | `100% Completo` | Registro inmutable de auditoría (`audit_logs`), trazabilidad de inferencias y flujo de atención de solicitudes ARCO (Ley 29733). |
| **Soporte Multi-Tema** | `100% Completo` | Compatibilidad total con 3 modos visuales: **Monochrome / Grafito**, **Cyber Blue** y **Light Minimalista** (con contraste validado WCAG AAA). |
| **Auditoría de Calidad** | `100% Completo` | `oxlint` pasando con 0 errores y compilación `tsc -b && vite build` ejecutada con éxito en 1.57s. |
| **Documentación Ejecutiva** | `100% Completo` | Generador de informe técnico-estratégico en PDF/HTML (`generate_report.py`) con diagramas arquitecturales. |

---

## 3. Arquitectura del Sistema

```
                         EDUMASTER.AI: TOPOLOGÍA ARQUITECTURAL
                         
   ┌────────────────────────────────────────────────────────────────────────┐
   │                       CLIENTE WEB SPA (FRONTEND)                       │
   │      React 19 • TypeScript • Tailwind CSS • Vite • Lucide Icons        │
   │                                                                        │
   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
   │  │ Dashboard Global │  │  Teacher Speed-  │  │  Student Code        │  │
   │  │ & KPIs Métricas  │  │  Grader Modal    │  │  Sandbox             │  │
   │  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘  │
   │           │                     │                       │              │
   │  ┌────────┴─────────┐  ┌────────┴─────────┐  ┌──────────┴───────────┐  │
   │  │ Neural Net Canvas│  │ Geo Progress Map │  │ Governance & ARCO    │  │
   │  │ Visualizer (MTL) │  │ Vector Silhouettes│ │ Audit Logs           │  │
   │  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ HTTPS / WSS
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                   BACKEND & MOTOR DE INFERENCIA (API)                  │
   │                    FastAPI • Pydantic • Uvicorn                        │
   │                                                                        │
   │   ┌────────────────────────────────────────────────────────────────┐   │
   │   │                    PyTorch MTL Engine (TorchScript)            │   │
   │   │  Head A: Dominio Habilidades │ Head B: Tiempo Estimado Módulo   │   │
   │   │  Head C: Riesgo Deserción    │ Head D: Recomendaciones Top-K   │   │
   │   └────────────────────────────────────────────────────────────────┘   │
   │                                                                        │
   │   ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────┐   │
   │   │ PostgreSQL (Persistencia)│  │ Redis (Cache & Broker)│  │ Celery   │   │
   │   │ - users, audit_logs   │  │ - Rate limiting       │  │ - Workers│   │
   │   │ - rubrics, submissions│  │ - Inferencia asíncrona │  │ - DVC    │   │
   │   └───────────────────────┘  └───────────────────────┘  └──────────┘   │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Estructura del Repositorio

```text
Entregable Final/
├── .gitignore                          # Exclusiones de Git (node_modules, dist, logs, etc.)
├── README.md                           # Documentación técnica, avance y guía de ejecución
├── EduMaster_AI_Informe_Ejecutivo.html # Informe técnico-estratégico empresarial
├── EduMaster_AI_Informe_Ejecutivo.pdf  # Versión compilada en PDF del informe ejecutivo
├── generate_report.py                  # Script Python para compilar el informe ejecutivo
│
├── api/                                # Backend DEMO (FastAPI + lógica MTL sin PyTorch)
│   ├── app/                            # Routers, contratos Pydantic y servicios
│   ├── ml/                             # Dataset DEMO, baselines, MTL y train/evaluate/predict
│   ├── requirements.txt                # Dependencias mínimas para Railway Free
│   ├── Procfile / railway.json         # Arranque con uvicorn en $PORT
│   └── README.md                       # Ejecución, endpoints y límites DEMO
│
├── backend/                            # Backend activo (FastAPI + SQLite + motor NumPy)
│   ├── app/api/v1/compat.py            # Contrato /compat y verificación de certificados
│   ├── app/models/certificate.py       # Tabla SQLite de certificados sintéticos
│   └── tests/test_smoke.py             # Smoke versionado: 34 comprobaciones
│
└── frontend/                           # Aplicación Web Cliente (React 19 + TypeScript)
    ├── package.json                    # Dependencias y scripts de ejecución
    ├── tsconfig.json                   # Configuración del compilador TypeScript
    ├── vite.config.ts                  # Configuración del empaquetador Vite
    ├── tailwind.config.js              # Configuración de Tailwind CSS y temas de color
    ├── postcss.config.js               # Configuración de PostCSS y Autoprefixer
    ├── index.html                      # Punto de entrada HTML5
    │
    ├── src/
    │   ├── main.tsx                    # Inicialización y renderizado del árbol React
    │   ├── App.tsx                     # Componente raíz, orquestador de estado y vistas
    │   ├── index.css                   # Directivas globales de Tailwind y estilos CSS
    │   │
    │   ├── types/
    │   │   └── index.ts                # Modelos y contratos de tipos (User, Role, Metrics, MTL)
    │   │
    │   ├── data/
    │   │   └── mockData.ts             # Datasets tipados, arquitectura neuronal y cohortes
    │   │
    │   └── components/
    │       ├── layout/
    │       │   ├── Sidebar.tsx         # Barra de navegación lateral persistente
    │       │   └── Topbar.tsx          # Cabecera con selector de roles, filtros y temas
    │       │
    │       ├── common/
    │       │   ├── GlobalCommandPalette.tsx # Paleta de comandos accesible (Ctrl+K)
    │       │   └── LiveConnectionBadge.tsx  # Estado de conexión WebSockets en tiempo real
    │       │
    │       ├── dashboard/
    │       │   ├── MetricCardsRow.tsx       # 4 KPIs ejecutivos con tendencias
    │       │   ├── NeuralVisualizer.tsx     # Visualizador de red neuronal MTL interactivo
    │       │   ├── CourseCompletionDonut.tsx # Gráfico Donut compacto de avance académico
    │       │   ├── RecentActivityFeed.tsx   # Registro en vivo de interacciones formativas
    │       │   ├── GeoProgressMap.tsx       # Mapa mundial de progresión con siluetas SVG
    │       │   └── SkillMasteryHeatmap.tsx  # Matriz de calor de competencias por cohorte
    │       │
    │       ├── teacher/
    │       │   ├── TeacherDashboard.tsx      # Bandeja de entregas pendientes y alertas
    │       │   └── TeacherSpeedGraderModal.tsx # SpeedGrader con rúbricas y borrador de IA
    │       │
    │       ├── student/
    │       │   ├── StudentStudyModal.tsx     # Modal de estudio y lectura guiada
    │       │   └── StudentCodeSandbox.tsx   # Entorno interactivo de programación Python
    │       │
    │       ├── admin/
    │       │   └── AdminGovernanceView.tsx   # Panel de auditoría inmutable y solicitudes ARCO
    │       │
    │       └── modules/
    │           ├── CoursesView.tsx           # Catálogo de cursos oficiales con filtros
    │           ├── LearningPathsView.tsx     # Rutas de aprendizaje secuenciales adaptativas
    │           ├── AssessmentsView.tsx       # Evaluaciones con contrastes de predicción
    │           ├── CertificatesView.tsx      # Credenciales verificables con código QR
    │           ├── AnalyticsView.tsx         # Curvas de retención y análisis de riesgo
    │           ├── AITutorView.tsx           # Tutor conversacional con explicabilidad
    │           └── NeuralInspectorView.tsx   # Inspección de arquitectura y MLflow
```

---

## 5. Módulos y Funcionalidades Principales

### 5.1. Visualizador de Red Neuronal Multitarea (MTL)
- Representación en tiempo real de la arquitectura de deep learning subyacente.
- Muestra el flujo entre capa de entrada (tensores de actividad), capas ocultas compartidas y las cuatro cabezas especializadas:
  - **Head A (Dominio de Habilidades):** Salida continua [0-1] de dominio conceptual.
  - **Head B (Tiempo Estimado):** Minutos proyectados para culminar el módulo actual.
  - **Head C (Riesgo de Abandono):** Probabilidad calibrada con guardrails preventivos.
  - **Head D (Recomendaciones Top-K):** Recursos pedagógicos clasificados por Softmax/TopK.
- Modos de alternancia: Inferencia vs. Entrenamiento, control de velocidad de pulso y selección de nodos.

### 5.2. SpeedGrader con Principio *Human-in-the-Loop*
- Diseñado para optimizar el flujo de revisión docente sin delegar decisiones finales al algoritmo.
- Divisor visual 55% / 45%: código Python entregado a la izquierda y rúbrica oficial a la derecha.
- Botón **"Sugerir borrador con IA"** que redacta feedback formativo preliminar que el docente debe validar o modificar.
- Firma digital del docente registrada en `audit_logs` garantizando la autoría humana de la nota.

### 5.3. Mapa Global de Progreso Geográfico
- Visualización de la distribución de estudiantes en los 5 continentes.
- Vectorizado limpio en SVG con paralelos y meridianos sutiles.
- Indicadores estáticos de alta precisión que garantizan lectura descansada sin parpadeos cosméticos.

### 5.4. Gobernanza de Datos y Cumplimiento Ley 29733 (ARCO)
- Panel de control de privacidad con gestión de derechos ARCO:
  - **Acceso:** Descarga de expediente académico y datos de perfil en formato estructurado.
  - **Rectificación:** Corrección de atributos erróneos de usuario.
  - **Cancelación / Olvido:** Anonimización irreversible de información personal identificable (PII).
  - **Oposición:** Desactivación de recomendaciones automáticas basadas en IA.
- Trazabilidad total de logs inmutables con usuario, rol, acción, dirección IP y timestamp UTC.

### 5.5. Soporte Multi-Tema y Accesibilidad
El sistema cuenta con un selector de temas en la barra superior con tres variantes totalmente probadas:
1. **Monochrome / Grafito (Predeterminado):** Diseño sobrio para entornos profesionales de ingeniería y auditoría.
2. **Cyber Blue:** Estética de alta tecnología con toques de azul cian e iluminación sutil.
3. **Light Minimalista:** Diseñado para entornos luminosos, con tipografías oscuras (`slate-900`) y verdes certificados (`emerald-800`) sobre fondos limpios para máximo contraste y cero fatiga visual.

### 5.6. Certificados con QR escaneable y verificación HTTP
- Cada certificado genera un QR PNG con la URL `/?verify=<folio>`; al escanearlo se abre la vista de certificados con la verificación ya resuelta.
- El folio y su hash SHA-256 se validan contra `GET /api/v1/compat/certificates/verify/{folio}` en SQLite; los datos son sintéticos y el mensaje lo declara explícitamente.
- La verificación genera un evento `certificate.verify` en la auditoría con `correlation_id`. Sin API configurada existe un fallback Web Crypto, rotulado como DEMO local.
- Con `VITE_PUBLIC_ORIGIN` apuntando a la IP Wi-Fi de la PC, el QR se escanea desde el celular en la misma red; `127.0.0.1` en el celular apuntaría al propio celular. Fuera de la Wi-Fi sí hace falta desplegar.

---

## 6. Guía de Instalación y Activación

### Requisitos Previos
- **Node.js:** Versión 18.0.0 o superior (recomendado Node.js 20 LTS o 22 LTS).
- **npm:** Versión 9.0.0 o superior (incluido con Node.js).
- **Navegador Web Moderno:** Google Chrome, Edge, Firefox o Brave.
- **Python:** Versión 3.10+ (necesario para `api/` y, opcionalmente, para `generate_report.py`).

---

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Maxgab27/EduMaster-AI.git
cd EduMaster-AI
```

### Paso 2: Instalar Dependencias del Frontend
Accede a la carpeta `frontend/` y ejecuta el comando de instalación de paquetes:
```bash
cd frontend
npm install
```

### Paso 3: Iniciar el Servidor de Desarrollo
Para levantar la plataforma en modo interactivo con recarga rápida (*Hot Module Replacement*):
```bash
npm run dev
```

Una vez ejecutado, la terminal mostrará la URL de acceso local:
```text
  VITE v8.3.8  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Abre tu navegador en `http://localhost:5173/` para comenzar a interactuar con la plataforma.

### Paso 4 (opcional): Backend DEMO con lógica MTL
```bash
cd api
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Para el backend **activo** de la sustentación, usa `backend/` en vez de `api/`:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Luego crea `frontend/.env.local` con:
```text
VITE_CORE_API_BASE_URL=http://127.0.0.1:8000
VITE_PUBLIC_ORIGIN=http://192.168.18.36:5173
```
Reinicia el frontend. `VITE_API_BASE_URL` se deja vacío: el resto de la app sigue con el adaptador DEMO local y solo el núcleo usa HTTP real. `VITE_PUBLIC_ORIGIN` es la IP Wi-Fi de la PC; cámbiala si la red asigna otra. En Windows, usa `npm.cmd` en lugar de `npm`. `start_project.bat` levanta ambos servicios en `0.0.0.0` con esta configuración.

Para probar desde el celular ZTE en la misma Wi-Fi: abre `http://192.168.18.36:5173` en la PC, entra a **Certificados**, pulsa **Ver QR / Folio** y escanea con la cámara. El QR codifica esa IP, no `127.0.0.1`, y la verificación llama a `http://192.168.18.36:8000`. En el celular, el menú lateral se abre con el botón hamburger y el modal del QR ofrece **“Abrir comprobante (celular)”**, que muestra una página simple con **“Guardar como PDF”**.

### Paso 5 (opcional): publicar en Railway — lo haces tú

El repositorio queda listo; **no se ejecutó ningún despliegue**. La checklist completa está en `RAILWAY.md`. En resumen: dos servicios en el mismo proyecto, API desde la raíz (`railway.json` + `backend/Dockerfile`) y web con Root Directory `frontend` (`npm ci && npm run build`, `npm run start`, healthcheck `/health`). Define solo `VITE_CORE_API_BASE_URL` con la URL pública de la API y deja `VITE_PUBLIC_ORIGIN` sin definir para que el QR use el dominio del frontend. Si quieres conservar la auditoría entre despliegues, conecta un Postgres de Railway mediante `DATABASE_URL`; sin él, SQLite es efímero.

**Mejoras recientes:** las vistas secundarias se cargan bajo demanda (`React.lazy`), por lo que el chunk inicial bajó de 580.79 kB a 465.45 kB y ya no aparece el aviso de tamaño. El drawer móvil es accesible por teclado: `aria-expanded`/`aria-controls`, `role="dialog"` en móvil, cierre con `Escape`, foco atrapado y retorno al hamburger. Si la API falla, la UI distingue “sin conexión”, “formato inválido” y “configuración faltante” con mensajes claros; el comprobante ofrece **“Reintentar”**. Detalle y evidencia en `FUNCIONALIDADES_Y_MEJORAS.md` §10.

---

## 7. Verificación de Calidad y Compilación

El proyecto incluye scripts configurados para asegurar la máxima calidad de código y compilación sin errores:

### 1. Auditoría de Linting con Oxlint
```bash
cd frontend
npm run lint
```
*Resultado esperado: 0 errores.*

### 2. Compilación de Producción con TypeScript y Vite
```bash
cd frontend
npm run build
```
*Genera los archivos optimizados y minificados en `frontend/dist/`. En Railway los sirve `npm run start` (servidor mínimo en `frontend/scripts/serve.mjs`, respeta `$PORT`); también sirven para Vercel, Netlify o cualquier servidor estático.*

### 3. Previsualizar la Versión de Producción
```bash
cd frontend
npm run preview
```
*Permite validar localmente la compilación de producción en el puerto `http://localhost:4173/`.*

### 4. Smoke test del backend activo
```bash
python backend/tests/test_smoke.py
```
*Resultado observado: 34/34. Conserva las 6 rutas originales y valida el contrato `/compat`, incluidos los endpoints de certificados.*

### 5. Servidor estático local (simula el servicio web de Railway)

```powershell
cd frontend
$env:PORT = 4317
npm.cmd run start
```

Abre `http://127.0.0.1:4317/health` → `{"status":"ok",...,"mode":"DEMO"}`. Cualquier ruta sin archivo vuelve a `index.html`, así que `http://127.0.0.1:4317/?verify=EDU-2026-98124` abre directamente la verificación. Es el mismo arranque que usa `frontend/railway.json`.

---

## 8. Generación del Informe Ejecutivo

El proyecto incluye el informe técnico de arquitectura y gobernanza en formato HTML y PDF:
- **Archivo HTML:** `EduMaster_AI_Informe_Ejecutivo.html`
- **Archivo PDF:** `EduMaster_AI_Informe_Ejecutivo.pdf`

Si deseas regenerar el reporte o compilar nuevas métricas desde el script fuente:
```bash
python generate_report.py
```
*(Requiere tener instalado WeasyPrint o Chromium para la exportación a PDF).*

---

## 9. Principios Éticos y Gobernanza de IA

1. **Principio de Autoridad Docente:** Ninguna inferencia de red neuronal tiene potestad para reprobar o sancionar automáticamente a un estudiante. La IA actúa como asesora de diagnóstico pedagógico; el docente firma y oficializa cada evaluación.
2. **Explicabilidad Obligatoria:** Toda calificación sugerida por IA está acompañada de sus ponderaciones por criterio de rúbrica y nivel de confianza.
3. **Privacidad por Diseño:** Las métricas mostradas en los dashboards agregados anonimizan PII y se computan sobre cohortes completas para evitar la vigilancia intrusiva individual.
4. **Trazabilidad Inmutable:** Cada interacción, ajuste de nota y solicitud de derechos ARCO queda sellada con hash temporal en los registros de auditoría.

---

## 👥 Equipo y Créditos
- **Desarrollador / Autor:** Gabriel Cerna Bustamante ([@Maxgab27](https://github.com/Maxgab27))
- **Institución:** SENATI — Ingeniería de Software con Inteligencia Artificial
- **Proyecto:** EduMaster.ai Enterprise Platform

---

*Desarrollado con rigor técnico, ingeniería de software moderna y compromiso ético.*
