# -*- coding: utf-8 -*-
"""Genera CONTINUACION_FASE5.docx: documento para que otro desarrollador retome el proyecto."""

from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = r"C:\Users\sanhu\Desktop\EduMaster-AI\CONTINUACION_FASE5.docx"

doc = Document()

# ---------- Estilos base ----------
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(10.5)
normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
normal.paragraph_format.space_after = Pt(6)

for name, size, color in [
    ("Title", 26, RGBColor(0x1F, 0x3B, 0x57)),
    ("Heading 1", 16, RGBColor(0x1F, 0x3B, 0x57)),
    ("Heading 2", 13, RGBColor(0x2E, 0x5B, 0x88)),
    ("Heading 3", 11, RGBColor(0x2E, 0x5B, 0x88)),
]:
    st = doc.styles[name]
    st.font.name = "Calibri"
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = color

section = doc.sections[0]
footer = section.footer.paragraphs[0]
footer.text = "EduMaster.ai  |  Continuación Fase 5  |  Uso interno  |  DEMO: no publicar  |  Página "
fld = OxmlElement("w:fldSimple")
fld.set(qn("w:instr"), "PAGE")
footer._p.append(fld)


# ---------- Helpers ----------
def h(text, level=1):
    doc.add_heading(text, level=level)


def p(text="", bold=False, italic=False):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.bold = bold
    run.italic = italic
    return par


def bullet(text, level=0):
    par = doc.add_paragraph(text, style="List Bullet" if level == 0 else "List Bullet 2")
    par.paragraph_format.space_after = Pt(2)
    return par


def check(text):
    par = doc.add_paragraph("[ ]  " + text)
    par.paragraph_format.space_after = Pt(3)
    return par


def code(text):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    return par


def table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, head in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = ""
        run = cell.paragraphs[0].add_run(head)
        run.bold = True
        run.font.size = Pt(9.5)
        tcPr = cell._tc.get_or_add_tcPr()
        shd = OxmlElement("w:shd")
        shd.set(qn("w:val"), "clear")
        shd.set(qn("w:fill"), "D9E2F3")
        tcPr.append(shd)
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(str(value))
            run.font.size = Pt(9.5)
    if widths:
        for row in t.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Pt(w)
    doc.add_paragraph()
    return t


def note(title, text):
    par = doc.add_paragraph()
    r1 = par.add_run(title + "  ")
    r1.bold = True
    r1.font.color.rgb = RGBColor(0x9C, 0x27, 0x00)
    r2 = par.add_run(text)
    r2.italic = True
    return par


# ================= PORTADA =================
t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run("EduMaster.ai")
r.bold = True
r.font.size = Pt(30)
r.font.color.rgb = RGBColor(0x1F, 0x3B, 0x57)

sub = doc.add_paragraph()
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = sub.add_run("Documento de continuación del desarrollo - Fase 5")
r.font.size = Pt(15)
r.font.color.rgb = RGBColor(0x2E, 0x5B, 0x88)

doc.add_paragraph()
table(
    ["Campo", "Valor"],
    [
        ["Destinatario", "Compañero de desarrollo (continuación del proyecto)"],
        ["Estado del proyecto", "Fases 1, 2, 3 y 4 completadas, validadas y pusheadas"],
        ["Pendiente", "Fase 5: Supabase real + OIDC con Supabase Auth"],
        ["Fecha", "23 de noviembre de 2026"],
        ["Repositorio", "EduMaster-AI (branch main, sincronizado con origin/main)"],
        ["Documentos relacionados", "PLAN_DESARROLLO_MODULOS.md, GUIA_FASE5.txt, ESTADO_PROYECTO.txt, DOCUMENTACION_PROYECTO.md"],
    ],
)

note(
    "IMPORTANTE:",
    "Este documento es de trabajo interno. No compartir service_role key, anon key ni tokens por chat. "
    "Se configuran en Railway, Vercel o en un .env local (ya ignorado por git).",
)

note(
    "DECISION OFICIAL:",
    "DEMO: no publicar. Mantener etiquetas DEMO y no publicar métricas falsas hasta aprobacion humana explicita.",
)

doc.add_page_break()

# ================= 1 =================
h("1. Lee esto primero (reglas que no se pueden cambiar)", 1)
for item in [
    "La decisión oficial del artefacto MTL es DEMO: no publicar. El modelo nunca publica nota oficial.",
    "Sin OIDC real, la autoridad del backend es DEMO de headers X-Actor / X-Role. No presentarla como seguridad de produccion.",
    "El RBAC del frontend (auth/permissions.ts) es solo UX. La autoridad real siempre está en la API.",
    "Fase 5 usa Supabase real, pero NO se activa RLS. La autoridad sigue en la API con service role key.",
    "Base limpia: no migrar los registros sintéticos actuales.",
    "Una nota oficial requiere signedBy y debe coincidir con el actor autenticado.",
    "settings.rlsEnabled es informativo y queda en false.",
    "Backend sin PyTorch, Redis, Celery ni MLflow. REST con urllib, sin ORM ni clientes pesados.",
    "El sandbox solo hace analisis estatico: nunca ejecuta código del usuario.",
    "En PowerShell usar npm.cmd, no npm.",
    "Los certificados actuales son 3 registros sintéticos fijos. No se cambian por ahora.",
]:
    bullet(item)

# ================= 2 =================
h("2. Lo que ya está hecho (no rehacerlo)", 1)
p("El contrato /api/v1 con envelope { data, meta } y correlationId está funcionando en todos los modulos. "
  "El frontend tiene adaptador API y adaptador DEMO (localStorage, clave edumaster_demo_v1) con los mismos tipos TypeScript.")

table(
    ["Fase", "Contenido", "Estado / commit"],
    [
        ["1", "Dashboard, Analytics, Certificados, Gobernanza y Neural Inspector conectados al contrato", "Completada y validada"],
        ["2", "Comunidad, Tutor IA, Recomendaciones y Notificaciones con store DEMO", "Completada y validada"],
        ["3", "Cursos, Rutas, Evaluaciones/SpeedGrader y Sandbox con firma docente", "e0da0d5"],
        ["4", "RBAC/ABAC en backend, settings, preferencias por actor y auditoría enriquecida", "f172b6b"],
        ["Docs", "Sección 6 del plan actualizada con hashes reales", "b71c716"],
        ["5", "Supabase real + OIDC", "PENDIENTE - este documento"],
    ],
)

h("2.1 Validación ya ejecutada", 2)
for item in [
    "python -m compileall -q api  ->  OK",
    "Import de app.main y TestClient  ->  OK",
    "/health reporta auth=demo-header-rbac, rbacEnforced=true, storage=memory-demo",
    "Settings GET/PUT: admin 200, estudiante 403",
    "Preferencias aisladas por actor; firma ajena en calificación 403; firma correcta 200",
    "npm.cmd run lint  ->  0 errores y 0 warnings",
    "npm.cmd run build  ->  OK, bundle 546.83 kB / gzip 145.42 kB (advertencia no bloqueante)",
    "Smoke en navegador DEMO y API sin errores de consola",
]:
    check(item)

# ================= 3 =================
h("3. Arquitectura actual (punto de partida)", 1)
table(
    ["Capa", "Archivo clave", "Cómo funciona hoy"],
    [
        ["Frontend HTTP", "frontend/src/services/apiClient.ts", "Envía X-Correlation-ID, X-Actor y X-Role (getDemoActor())."],
        ["Permisos UX", "frontend/src/auth/permissions.ts", "Mapa espejo de permisos del backend."],
        ["Backend RBAC", "api/app/auth.py", "current_actor(), can(), require(), require_signature(); RBAC_ENFORCE=1; DEMO_DEFAULT_ROLE=estudiante."],
        ["Auditoría", "api/app/services/audit.py", "add_audit() y audit_denied() con role, actor_id, tenant_id, method, path, ip, status."],
        ["Persistencia", "api/app/services/storage.py", "Supabase REST con fallback en memoria (memory-demo)."],
        ["Certificados", "api/app/services/certificates.py", "3 registros sintéticos con fallback en memoria."],
        ["Endpoints", "api/app/main.py", "Todas las rutas /api/v1 y /health."],
        ["DDL", "api/supabase/schema.sql", "Tablas, columnas de auditoría, settings y notification_preferences; RLS comentado."],
    ],
)

# ================= 4 =================
h("4. El modelo y su caso de uso: recomendación de cursos", 1)
p("El modelo del proyecto es el artefacto MTL guardado en ml/artifacts/model.json. Se entrena fuera de la API y "
  "en el backend solo se usa para inferencia ligera: no hay PyTorch ni reentrenamiento en caliente.", bold=True)

h("4.1 Caso de uso", 2)
p("Recomendar cursos y rutas de aprendizaje a un estudiante a partir de su perfil y de su actividad previa. "
  "La recomendación es una sugerencia del módulo de Recomendaciones: nunca es una nota oficial ni una inscripción automática.")

table(
    ["Elemento", "Qué es en este proyecto"],
    [
        ["Actor", "Estudiante autenticado (sub del token en Fase 5; actor DEMO mientras tanto)."],
        ["Entrada", "Intereses y nivel del perfil, progreso de cursos y rutas, historial de evaluaciones y feedback previo."],
        ["Proceso", "Inferencia del artefacto MTL cruzada con el catálogo local y reglas trazables."],
        ["Salida", "Cursos y rutas sugeridos con motivo y fuente de la recomendación."],
        ["Destino", "GET /api/v1/recommendations -> frontend/src/services/recommendationsApi.ts -> AIRecommendationsCard.tsx."],
        ["Feedback", "POST /api/v1/recommendations/feedback se persiste como observación; NO dispara reentrenamiento."],
    ],
)

h("4.2 Flujo de datos", 2)
for item in [
    "El frontend pide recomendaciones con el actor de la sesión (Bearer en Fase 5; headers X-Actor/X-Role en DEMO).",
    "La API verifica permisos, ejecuta la inferencia del artefacto MTL y cruza el resultado con el catálogo.",
    "Cada respuesta lleva correlationId y la acción queda registrada en auditoría como sugerencia, no como decisión oficial.",
    "El feedback del estudiante se guarda como dato de observación; nadie lo usa para publicar una calificación.",
]:
    bullet(item)

h("4.3 Límites y human-in-the-loop", 2)
for item in [
    "Decisión oficial: DEMO: no publicar. El modelo no publica notas, ni certifica progreso, ni emite certificados.",
    "La nota oficial de SpeedGrader siempre la firma un docente (signedBy debe coincidir con el actor autenticado).",
    "No se muestran métricas de precisión inventadas: solo resultados observados y etiquetados como DEMO.",
    "Cada recomendación debe poder explicarse: qué señal del perfil la originó y de qué fuente viene.",
    "Con Supabase/OIDC el historial será por usuario real, pero publicar sigue requiriendo aprobación humana explícita.",
]:
    bullet(item)

h("4.4 Qué cambia en la Fase 5 para este caso de uso", 2)
for item in [
    "El actor deja de venir de X-Actor y se deriva del JWT, así que el historial es por usuario real.",
    "El feedback y el historial se persistirán en Supabase con base limpia, sin semillas falsas.",
    "La auditoría conservará role, tenantId y correlationId de cada recomendación.",
    "El adaptador DEMO sigue funcionando igual cuando no hay OIDC configurado.",
]:
    check(item)

# ================= 5 =================
h("5. LO QUE FALTA: Fase 5 (checklist ordenado)", 1)
p("Seguir este orden. No saltar al paso 3 sin tener el paso 1 resuelto.", italic=True)

h("Paso 1. Conseguir los datos de Supabase y configurar secretos", 2)
bullet("Pedir al responsable la plantilla GUIA_FASE5.txt rellena con valores NO secretos.")
bullet("Las llaves NO van en el chat: se ponen en Railway (backend), Vercel (frontend) o en api/.env local.")
bullet("Crear la base limpia en Supabase: ejecutar api/supabase/schema.sql en el SQL Editor.")
bullet("Confirmar que RLS queda DESACTIVADO en todas las tablas (la autoridad la hace la API).")
bullet("Crear usuarios de prueba con app_metadata.role (ver sección 8).")

h("Paso 2. Declarar las variables de entorno nuevas", 2)
p("Nombres propuestos (confirmar con el responsable antes de fijarlos):", bold=True)
table(
    ["Variable", "Donde", "Uso / ejemplo"],
    [
        ["SUPABASE_URL", "Railway / .env", "https://<ref>.supabase.co"],
        ["SUPABASE_KEY", "Railway / .env", "service_role key. NUNCA en el frontend ni en el repo."],
        ["SUPABASE_ANON_KEY", "Vercel / .env local frontend", "Solo para el login desde el navegador."],
        ["OIDC_ISSUER", "Railway / .env", "https://<ref>.supabase.co/auth/v1"],
        ["OIDC_JWKS_URL", "Railway / .env", "https://<ref>.supabase.co/auth/v1/.well-known/jwks.json"],
        ["OIDC_AUDIENCE", "Railway / .env", "authenticated"],
        ["OIDC_ROLE_CLAIM", "Railway / .env", "app_metadata.role"],
        ["OIDC_NAME_CLAIM", "Railway / .env", "user_metadata.full_name"],
        ["OIDC_TENANT_CLAIM", "Railway / .env", "app_metadata.tenantId"],
    ],
)
note("Regla de oro:", "Si no están estas variables, el modo DEMO debe seguir funcionando exactamente igual.")

h("Paso 3. Verificador JWT con JWKS en el backend", 2)
bullet("Nuevo modulo api/app/oidc.py (o ampliar auth.py).")
bullet("Leer el header Authorization: Bearer <JWT> y validar RS256.")
bullet("Descargar el JWKS con urllib y cachear las claves por kid (sin librerias pesadas).")
bullet("Validar iss, aud, exp y firma. Token inválido -> 401 y evento de auditoría con status=denied.")
bullet("Los claims anidados se leen por ruta: app_metadata.role, user_metadata.full_name, app_metadata.tenantId.")

h("Paso 4. Derivar el Actor desde el token", 2)
bullet("Cuando OIDC este configurado, el Actor sale del JWT: sub, rol y tenant del token.")
bullet("Los headers X-Actor / X-Role SOLO se aceptan en modo DEMO; en modo OIDC se ignoran.")
bullet("El rol por defecto del token también debe ser estudiante si no viene el claim.")
bullet("Mantener signedBy = actor autenticado (sub del token).")
bullet("Mantener RBAC_ENFORCE y TENANT_ID funcionando igual.")

h("Paso 5. Persistencia Supabase real", 2)
bullet("storage.py debe usar SUPABASE_URL + SUPABASE_KEY (service role) via REST/PostgREST con urllib.")
bullet("RLS apagado: la service role key es la única que pasa por el servidor.")
bullet("Quitar el fallback en memoria de certificates.list_certificates() para respetar la base limpia.")
bullet("Si la tabla está vacía, devolver lista vacía (no sembrar datos falsos).")

h("Paso 6. Frontend con login real", 2)
bullet("Pantalla de login contra Supabase Auth y guardado del JWT en memoria/sesión.")
bullet("apiClient.ts debe enviar Authorization: Bearer <token> cuando exista sesión; si no, conservar X-Actor/X-Role en DEMO.")
bullet("Opcion recomendada por peso: llamadas REST directas a /auth/v1/token?grant_type=password con fetch y la anon key.")
bullet("La anon key puede ir al frontend; la service_role key NUNCA.")
bullet("Al expirar el token: limpiar sesión y volver a login; no reintentar con headers DEMO mezclados.")

h("Paso 7. /health y etiquetas", 2)
bullet("Con OIDC + Supabase activos: auth=oidc-supabase y storage=supabase.")
bullet("Sin configurar: auth=demo-header-rbac y storage=memory-demo (no cambiar).")
bullet("Seguir mostrando DEMO: no publicar en la decisión del artefacto MTL.")

h("Paso 8. Tests y cierre", 2)
bullet("Tests con tokens firmados localmente y con tokens reales de los usuarios de prueba.")
bullet("Probar 401 sin token, 401 con token inválido y 403 por rol insuficiente.")
bullet("Repetir el smoke completo de Fase 4 con OIDC encendido.")
bullet("Actualizar PLAN_DESARROLLO_MODULOS.md y DOCUMENTACION_PROYECTO.md con el resultado.")
bullet("Commitear también ESTADO_PROYECTO.txt, GUIA_FASE5.txt y DOCUMENTACION_PROYECTO.md (aun están sin commitear).")

# ================= 5 =================
h("6. Criterios de aceptación de la Fase 5", 1)
for item in [
    "/health reporta auth=oidc-supabase y storage=supabase solo cuando las variables están configuradas.",
    "Una petición sin Bearer devuelve 401 en modo OIDC (y sigue funcionando en DEMO).",
    "Un token manipulado o expirado devuelve 401 y genera auditoría denied.",
    "El rol se lee de app_metadata.role y mapea a admin, docente, estudiante, auditor y coordinador.",
    "admin puede PUT /api/v1/settings; estudiante recibe 403.",
    "signedBy distinto del sub del token devuelve 403.",
    "Las preferencias siguen aisladas por actor.",
    "La base empieza limpia: sin certificados sintéticos sembrados por el fallback.",
    "RLS sigue desactivado; no se activa desde settings.rlsEnabled.",
    "El artefacto MTL mantiene DEMO: no publicar.",
    "Las recomendaciones de cursos siguen siendo sugerencias trazables: no publican nota, no inscriben y no muestran métricas falsas.",
    "Sin variables nuevas, el modo DEMO pasa todas las pruebas de la Fase 4.",
    "lint y build del frontend sin errores; compileall del backend sin errores.",
]:
    check(item)

# ================= 6 =================
h("7. Plantilla de datos a pedir (sin secretos)", 1)
p("Copiar esta tabla, rellenar solo los valores no secretos y devolverla. Las llaves se configuran aparte.", italic=True)
table(
    ["Dato", "Valor"],
    [
        ["Project Ref de Supabase", "<ref>"],
        ["SUPABASE_URL", "https://<ref>.supabase.co"],
        ["OIDC_ISSUER", "https://<ref>.supabase.co/auth/v1"],
        ["OIDC_JWKS_URL", "https://<ref>.supabase.co/auth/v1/.well-known/jwks.json"],
        ["OIDC_AUDIENCE", "authenticated"],
        ["Claim de rol", "app_metadata.role"],
        ["Claim de nombre", "user_metadata.full_name"],
        ["Claim de tenant", "app_metadata.tenantId"],
        ["Roles a usar", "admin, docente, estudiante, auditor, coordinador"],
        ["RLS", "Desactivado (confirmado)"],
        ["Secretos configurados en Railway/Vercel/.env", "[ ] service_role key   [ ] anon key"],
    ],
)
note("No enviar por chat:", "service_role key, anon key, contraseñas de usuarios ni JWT reales.")

# ================= 7 =================
h("8. Usuarios de prueba sugeridos", 1)
table(
    ["Email", "app_metadata.role", "Para validar"],
    [
        ["admin@demo.test", "admin", "Settings, auditoría, permisos totales"],
        ["docente@demo.test", "docente", "Firmar calificaciones, SpeedGrader"],
        ["estudiante@demo.test", "estudiante", "Acceso denegado a settings y auditoría"],
        ["auditor@demo.test", "auditor", "Solo lectura de auditoría"],
        ["coordinador@demo.test", "coordinador", "Preferencias y permisos intermedios"],
    ],
)

# ================= 8 =================
h("9. Mapa de archivos que se van a tocar", 1)
table(
    ["Archivo", "Cambio previsto"],
    [
        ["api/app/auth.py", "Actor desde claims del JWT; mantener fallback DEMO."],
        ["api/app/oidc.py (nuevo)", "Descarga y cache de JWKS, validación RS256, iss/aud/exp."],
        ["api/app/main.py", "Dependencia de autenticación; /health con auth y storage reales."],
        ["api/app/services/storage.py", "REST con service role key; sin fallback en memoria cuando Supabase este activo."],
        ["api/app/services/certificates.py", "Quitar fallback en memoria; lista vacía si no hay datos."],
        ["api/.env.example", "Documentar las variables nuevas sin valores reales."],
        ["api/supabase/schema.sql", "Verificar RLS desactivado y base limpia."],
        ["frontend/src/services/apiClient.ts", "Enviar Authorization: Bearer cuando haya sesión."],
        ["frontend/src/services/recommendationsApi.ts", "Mantener el adaptador API/DEMO y usar el actor de la sesión."],
        ["frontend/src/components/dashboard/AIRecommendationsCard.tsx", "Mostrar motivo y fuente de cada sugerencia con etiqueta DEMO."],
        ["frontend/src/services/authApi.ts (nuevo)", "Login/logout contra Supabase Auth con anon key."],
        ["frontend/src/App.tsx", "Estado de sesión y pantalla de login."],
        ["frontend/src/services/demoStore.ts", "No mezclar sesión OIDC con el actor DEMO."],
    ],
)

# ================= 9 =================
h("10. Comandos de referencia", 1)
code("cd api")
code("python -m compileall -q api")
code("python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
code("")
code("cd frontend")
code("npm.cmd run dev -- --host 127.0.0.1 --port 5173     # DEMO")
code("$env:VITE_API_BASE_URL='http://127.0.0.1:8000'")
code("npm.cmd run dev -- --host 127.0.0.1 --port 5174     # Con API")
code("npm.cmd run lint")
code("npm.cmd run build")

# ================= 10 =================
h("11. Si algo no cuadra", 1)
bullet("Primero revisar GUIA_FASE5.txt y PLAN_DESARROLLO_MODULOS.md (sección 6).")
bullet("Después DOCUMENTACION_PROYECTO.md tiene el detalle completo de Fases 1-4 y la decisión de Fase 5.")
bullet("Si una variable no está clara, preguntar antes de inventar un nombre: el frontend y el backend deben usar exactamente el mismo contrato.")
bullet("Ante duda sobre seguridad: mas restrictivo. Nunca degradar a headers DEMO cuando OIDC este activo.")

doc.save(OUT)
print("Generado:", OUT)
