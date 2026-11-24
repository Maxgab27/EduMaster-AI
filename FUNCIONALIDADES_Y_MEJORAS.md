# Funcionalidades reales y mejoras posibles — EduMaster.ai

**Prueba realizada:** navegación real en Chromium sobre `http://127.0.0.1:5173` + backend activo en `http://127.0.0.1:8000`.
**Fecha:** 2026-11-23.
**Resultado general:** 11 módulos abiertos, interacciones ejecutadas, **0 errores de consola**. Todo opera en modo **DEMO** con `localStorage`; el backend no está conectado al frontend.

---

## 1. Funciones confirmadas

| Módulo | Qué hace realmente | Prueba ejecutada | Mejora recomendada | Prioridad |
|---|---|---|---|---|
| **Resumen** | KPIs sintéticos (24,593 alumnos, 1,248 cursos, 89,450 horas, 5,782 certificados), visualizador neuronal SVG animado, triaje de riesgo con 3 alertas y botón “Registrar mentoría (demo)”. | Clic en mentoría → toast “registrada localmente… no se envió ningún mensaje real” y evento `teacher.intervention_recorded` en auditoría. | El visualizador dice “Inferencia (Forward) 1x” aunque no hay inferencia real. Cambiar a estado `detenido` y mostrar `mode/engine` de `/health`. Quitar “0.914” o dejar solo “métrica simulada”. | P0 |
| **Planes de Aprendizaje** | Ruta de 6 hitos con prerrequisitos, progreso y botón “Continuar”. | Progreso pasó de **33% a 50%**; se guardó en `localStorage` y generó `learning_path.progress_changed`. | Persistir en backend/Supabase en vez de `localStorage`; mostrar la regla de prerrequisito cuando un hito está bloqueado. | P1 |
| **Cursos** | Catálogo de 5 cursos, filtros por nivel, búsqueda, paginación, formulario “Nuevo curso” con código, nivel, título, docente, cupo y etiquetas. | Filtros visibles; formulario se abre con código autogenerado `QA-900`. | El formulario guarda solo en DEMO. Conectar al backend o rotular “no persiste”. Validar cupo y código duplicado. | P1 |
| **Análisis** | Series semanales de progreso, actividad por semana, dominio por competencia, filtros por materia y botón “Exportar CSV”. | Gráficos y tabla renderizan con datos sintéticos. No se observó cambio visible al pulsar “Exportar CSV” (podría descargar un archivo). | Verificar la descarga real del CSV; añadir fecha de corte y fuente en el archivo exportado. | P1 |
| **IA Tutor** | Respuestas por reglas, con confianza y fuentes; conversación persistida. | Pregunta “¿Cómo se calcula el riesgo de abandono?” → respuesta con `Documento §9.5`, confianza 86% y guardrail. | El saludo muestra “Confianza: 99%” sin base. Cambiar a “reglas DEMO”. Hacer clicables las fuentes y añadir preguntas sugeridas. | P0 |
| **Evaluaciones / SpeedGrader** | Comparador nota oficial vs estimación IA, 3 entregas, SpeedGrader con rúbrica de 4 criterios, borrador asistido, firma docente obligatoria. | Abrí SpeedGrader, ajusté rúbrica, escribí nombre del docente y firmé: pendientes pasaron de **3 a 2**, apareció “Ver / Editar” y se registró `submissions.graded` con actor “Dr. Alejandro Morales”. | Enviar `X-Actor` del rol seleccionado al backend al firmar (el endpoint ya lo acepta desde la mejora anterior). Mostrar el `audit_log_id` devuelto. Sin eso la firma es solo local. | P0 |
| **Certificados** | 3 certificados con folio, hash, fecha y nota; panel “Verificación Pública” con QR ilustrativo. | “Ver QR / Folio” abre el verificador; advierte explícitamente “QR ilustrativo DEMO · requiere API para código escaneable”. | La URL mostrada apunta a `/api/v1/certificates/verify/<folio>`, ruta que **no existe** en las 6 del backend. Quitar la URL o implementar el endpoint. | P0 |
| **Redes Neuronales** | Inspector con pestañas Arquitectura / Evaluación / Gobernanza, función de pérdida multitarea y metadatos del artefacto. | Texto: “Implementación DEMO en Python puro, sin PyTorch”, versión `0.1.0-demo`, épocas 7. | Conectar la pestaña Evaluación con `api/ml/artifacts/evaluation.json` (ya existe) para mostrar baselines reales del dataset sintético. | P1 |
| **Gobierno & Ley 29733** | Pestañas Ley/ARCO, Registro de Auditoría y Telemetría MLOps; exportar informe ANPD; bandeja ARCO con 3 solicitudes. | “Marcar atendida” cambió el estado a **Atendida** y generó `arco.request.resolved`. El registro de auditoría mostró **5 eventos** con correlation ID. | Los eventos son de `localStorage`. Enviarlos también al backend cuando haya API. Añadir filtros y exportación CSV de auditoría. El toggle de RLS ya dice “informativo”, mantenerlo así. | P1 |
| **Comunidad** | Hilos, mensajes y moderación; botón “Nuevo hilo”. | “Nuevo hilo” abre el formulario “Crear hilo”. No hay hilos sembrados: la vista dice “Selecciona un hilo…”. | Sembrar 2–3 hilos DEMO para que la pantalla no se vea vacía en la sustentación. | P2 |
| **Configuración** | 3 temas visuales, parámetros de tenant, retención de eventos, protección de menores, consentimiento, preferencias de notificación. | Cambio de tema **Grises → Cyber** funcionó y persistió en `edumaster_theme`. | El campo “Marcar RLS como habilitado” ya avisa que no activa RLS real. Mantener el aviso. Guardar preferencias debería mostrar confirmación visible. | P2 |

## 2. Funciones globales confirmadas

| Función | Evidencia | Mejora |
|---|---|---|
| Simulación de 7 roles (Admin, Coordinador, Docente, Estudiante, Analista, ML Engineer, Auditor) | Al cambiar a Docente desaparecieron módulos de Admin (Planes, Redes, Gobierno, Configuración). | Es RBAC de **frontend**. Rotularlo “SIMULAR ROL RBAC” (ya aparece) y no decir que es seguridad. |
| 3 temas visuales | Grisite → Cyber → Claro. | Agregar atajo en Configuración para volver al tema por defecto. |
| Paleta de comandos | Al pulsar el botón “⌘K” se abre buscador con navegación, roles y temas. | Verificar el atajo real de teclado en la demo en vivo (en automatización no se disparó con `Ctrl+K`). |
| Correlación y auditoría local | Cada acción guarda `correlation_id` visible en Gobierno. | Enviar el mismo ID como header al backend (ya existe `newCorrelationId()`). |
| Persistencia local | Claves `edumaster_demo_v1`, `edumaster_demo_user`, `edumaster_theme`, `edumaster_tutor_conversation`. | Documentar que se borra al limpiar datos del navegador. |

## 3. Funciones del backend activo (6 rutas)

| Ruta | Función | Mejora |
|---|---|---|
| `/health` | Estado real: DEMO, motor, base y protocolo. | Ninguna urgente; ya fue corregida. |
| `/api/v1/students/at-risk` | Lista de alumnos en riesgo. | Filtrar por nivel de riesgo y tenant. |
| `/api/v1/inference/dropout-risk` | Probabilidad de abandono con factores dominantes. | Dejar de insertar alumnos como efecto secundario; separar simulación de persistencia. |
| `/api/v1/grades/submit` | Firma con hash SHA-256 y `actor_source`. | Exigir `X-Actor` de verdad (OIDC) en Fase 5. Hoy es opcional. |
| `/api/v1/audit/logs` | Consulta de auditoría. | Proteger el endpoint y paginar/filtrar. |
| `/` | Información del servicio. | Sin cambios. |

## 4. Orden recomendado de mejoras

1. **P0 (antes de sustentar):** quitar la URL de verificación inexistente; bajar el “99%” del tutor; desactivar el “Forward 1x” del dashboard; enviar `X-Actor` al firmar. Los tres primeros ya están aplicados (ver §5); el cuarto sigue pendiente por incompatibilidad de contrato.
2. **P1 (si hay un día):** conectar Evaluación y Gobierno al backend; sembrar hilos de Comunidad; verificar exportación CSV.
3. **P2 (Fase 5):** Supabase + OIDC, RLS real, QR escaneable, persistencia de rutas y cursos.

## 5. Estado real de los arreglos P0 (2026-11-23)

| Arreglo | Estado | Evidencia |
|---|---|---|
| URL de verificación inexistente | **Aplicado** | Los certificados usan `demo://verify/<folio>`; la vista muestra “Verificación: DEMO local · sin endpoint público”. El QR se genera desde el folio. |
| “Confianza: 99%” del tutor | **Aplicado** | El saludo ya no muestra peso; las respuestas regladas dicen “Peso regla DEMO”. Se limpia también el valor guardado en `localStorage` de versiones anteriores. |
| “Inferencia (Forward)” / “PyTorch • GRU” | **Aplicado** | El visualizador dice “DEMO · ANIMACIÓN ILUSTRATIVA”, “motor DEMO en NumPy (sin PyTorch)” y “Propagación (animada)”. |
| Enviar `X-Actor` al firmar | **Pendiente** | El header ya se envía desde `apiClient.ts`, pero el frontend llama a `/api/v1/submissions/{id}/grade`, ruta inexistente en el backend activo de 6 rutas. Requiere alinear contratos. |

Verificación tras los cambios: `npm.cmd run lint` sin errores, `npm.cmd run build` correcto, navegador con **0 errores de consola** y smoke test del backend **34/34**.

## 6. Frase para la sustentación

> "Probamos el sistema en navegador: los 11 módulos abren, el docente puede firmar una nota, la auditoría registra la acción con correlation ID y no hay errores de consola. Todo funciona en modo DEMO con datos locales; la integración con Supabase y la autenticación real quedan para la siguiente fase."
