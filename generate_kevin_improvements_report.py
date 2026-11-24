# -*- coding: utf-8 -*-
"""
Generador del informe académico:
"EduMaster.ai — Mejoras Implementadas y Puntos de Mejoría Pendientes"
Elaborado por Kevin (@sanhuezazetakevin). Reutiliza la hoja de estilo del
reporte de Gabriel para mantener la misma línea visual de entrega.
"""
import os
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
STYLE_SOURCE = os.path.join(ROOT, "EduMaster_AI_Reporte_Mejoras_y_Utilidad.html")
HTML_PATH = os.path.join(ROOT, "EduMaster_AI_Informe_Mejoras_y_Puntos_de_Mejoria_Kevin.html")
PDF_PATH = os.path.join(ROOT, "EduMaster_AI_Informe_Mejoras_y_Puntos_de_Mejoria_Kevin.pdf")

BODY = r'''
<body>

    <!-- PORTADA -->
    <div class="cover-page">
        <div class="cover-top">
            <div class="cover-brand">
                <span>🎓 EduMaster.ai</span>
                <span style="font-size: 11pt; font-weight: 400; opacity: 0.7;">Plataforma de Aprendizaje · SENATI</span>
            </div>
            <div class="cover-badge">INFORME ACADÉMICO • v1.0 • DEMO</div>
        </div>

        <div class="cover-title-container">
            <div class="cover-subtitle">MEJORAS IMPLEMENTADAS · EVIDENCIA · PUNTOS DE MEJORÍA</div>
            <h1 class="cover-title">Informe de Mejoras Implementadas y Puntos de Mejoría Pendientes</h1>
            <p class="cover-desc">
                Documento elaborado por Kevin que consolida las mejoras de vista móvil, comprobante de certificados
                y preparación del QR para un despliegue público. Presenta evidencia verificable y una hoja de ruta
                de mejoría continua para el proyecto EduMaster.ai.
            </p>
        </div>

        <div class="cover-meta-grid">
            <div class="cover-meta-item">
                <strong>Autor de las mejoras</strong>
                <span>Kevin (@sanhuezazetakevin)</span>
            </div>
            <div class="cover-meta-item">
                <strong>Institución & Carrera</strong>
                <span>SENATI • 4.º semestre • Ing. de Software con IA</span>
            </div>
            <div class="cover-meta-item">
                <strong>Repositorio del proyecto</strong>
                <span>https://github.com/Maxgab27/EduMaster-AI</span>
            </div>
            <div class="cover-meta-item">
                <strong>Métricas de validación</strong>
                <span>Lint 0 • Build OK • Smoke 34/34 • 0 errores de consola</span>
            </div>
        </div>

        <div class="cover-footer">
            <span>© 2026 EduMaster.ai — Documento académico DEMO con datos sintéticos.</span>
            <span>Elaborado por Kevin · 24 de noviembre de 2026</span>
        </div>
    </div>

    <!-- PÁGINA 1: RESUMEN Y MATRIZ DE MEJORAS IMPLEMENTADAS -->
    <div class="page">
        <h1>
            <span>1. Resumen Ejecutivo y Mejoras Implementadas</span>
            <span class="section-tag">Auditoría Global</span>
        </h1>

        <p>
            Este informe documenta las intervenciones realizadas sobre el proyecto <strong>EduMaster.ai</strong>
            durante la entrega correspondiente al 24 de noviembre de 2026. El objetivo fue doble: que la interfaz
            fuera realmente usable en el celular ZTE Axon 50 5G y que el QR de certificados dejara de ser un
            adorno para convertirse en un enlace verificable, tanto en la Wi-Fi local como en un futuro
            despliegue público. Todo se realizó conservando la etiqueta <strong>DEMO</strong> y la advertencia
            de que los certificados son sintéticos y no oficiales.
        </p>

        <div class="kpi-grid">
            <div class="kpi-card emerald">
                <div class="kpi-num">390 px</div>
                <div class="kpi-title">Vista móvil validada</div>
                <div class="kpi-sub">Sin desbordamiento horizontal</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-num">34/34</div>
                <div class="kpi-title">Smoke test del backend</div>
                <div class="kpi-sub">6 rutas originales intactas</div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-num">QR real</div>
                <div class="kpi-title">Verificación por HTTP</div>
                <div class="kpi-sub">Hash SHA-256 en SQLite</div>
            </div>
            <div class="kpi-card amber">
                <div class="kpi-num">0</div>
                <div class="kpi-title">Errores de consola</div>
                <div class="kpi-sub">Lint y build sin fallos</div>
            </div>
        </div>

        <h2>1.1 Matriz de mejoras implementadas</h2>
        <table class="matrix-table">
            <thead>
                <tr>
                    <th style="width: 22%;">Componente / Módulo</th>
                    <th style="width: 31%;">¿Qué se añadió o modificó?</th>
                    <th style="width: 23%;">¿Por qué se hizo?</th>
                    <th style="width: 24%;">Utilidad y beneficio</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>App.tsx · Sidebar.tsx · Topbar.tsx</strong><br><span class="badge-pill badge-blue">Responsive</span></td>
                    <td>Sidebar como drawer con botón hamburger, overlay y cierre al elegir una sección; topbar simplificada.</td>
                    <td>En una pantalla de 390 px la columna lateral fija ocupaba casi toda la vista.</td>
                    <td>Navegación con una mano y acceso rápido a Certificados desde el celular.</td>
                </tr>
                <tr>
                    <td><strong>CertificatesView.tsx (modal)</strong><br><span class="badge-pill badge-purple">QR</span></td>
                    <td>Modal con <code>max-h-[92dvh]</code>, scroll interno, QR de 128 px y URL con <code>break-all</code>.</td>
                    <td>El modal se salía de la pantalla y el texto largo provocaba desplazamiento horizontal.</td>
                    <td>Ver folio, hash y URL sin hacer zoom ni perder el botón de acción.</td>
                </tr>
                <tr>
                    <td><strong>CertificateReceiptView</strong><br><span class="badge-pill badge-green">Comprobante</span></td>
                    <td>Ruta <code>?receipt=&lt;folio&gt;</code> con botones “Volver” y “Guardar como PDF”.</td>
                    <td>Los navegadores móviles bloquean <code>window.open</code> y las descargas automáticas.</td>
                    <td>El comprobante llega al celular como una página normal, lista para imprimir o guardar.</td>
                </tr>
                <tr>
                    <td><strong>certificatesApi.ts</strong><br><span class="badge-pill badge-blue">QR público</span></td>
                    <td>QR PNG que codifica <code>?verify=&lt;folio&gt;</code>; usa <code>VITE_PUBLIC_ORIGIN</code> en local y <code>location.origin</code> en Railway.</td>
                    <td>Un QR con JSON o con <code>127.0.0.1</code> no abre nada útil desde el celular.</td>
                    <td>Al escanear se abre la verificación real en la misma dirección que ve el usuario.</td>
                </tr>
                <tr>
                    <td><strong>apiClient.ts · backend/main.py</strong><br><span class="badge-pill badge-green">CORS</span></td>
                    <td>Rewrite de API solo para hosts IP privados y CORS para LAN, Vercel y <code>*.railway.app</code>.</td>
                    <td>La API quedaba inalcanzable desde otro dispositivo y fallaba al publicar.</td>
                    <td>Verificación funcional en Wi-Fi y preparada para el enlace público.</td>
                </tr>
                <tr>
                    <td><strong>Endpoint verify + auditoría</strong><br><span class="badge-pill badge-purple">Backend</span></td>
                    <td>Hash SHA-256 canónico contrastado en SQLite y eventos <code>certificate.verify</code> / <code>certificate.receipt_open</code>.</td>
                    <td>La verificación anterior no comprobaba el contenido contra una fuente real.</td>
                    <td>Trazabilidad de cada escaneo y del comprobante abierto, sin secretos involucrados.</td>
                </tr>
                <tr>
                    <td><strong>README.md · RAILWAY.md · FUNCIONALIDADES_Y_MEJORAS.md</strong><br><span class="badge-pill badge-green">Documentación</span></td>
                    <td>Guía corta de Wi-Fi, guía de publicación y actualización del inventario con la sección §9.</td>
                    <td>Los pasos para probar y publicar no estaban centralizados.</td>
                    <td>Otro integrante puede repetir la prueba sin depender de explicaciones verbales.</td>
                </tr>
            </tbody>
        </table>

        <div class="callout emerald">
            <div class="callout-title">Criterio rector: “Lo escaneable y lo imprimible manda”</div>
            <p>
                Cada decisión se evaluó desde el celular real: si el QR no abre, si el modal no cabe o si el
                comprobante no se puede guardar, la mejora no está terminada. Por eso se prefirió una ruta real
                de la SPA antes que ventanas emergentes o descargas forzadas.
            </p>
        </div>
    </div>

    <!-- PÁGINA 2: EVIDENCIA -->
    <div class="page">
        <h1>
            <span>2. Evidencia Verificable de las Mejoras</span>
            <span class="section-tag">Pruebas</span>
        </h1>

        <p>
            Las mejoras no quedaron solo en el código: se ejecutaron pruebas automáticas y manuales sobre el
            navegador y sobre el backend activo. La tabla siguiente resume el comando o acción, el resultado
            observado y lo que demuestra cada evidencia.
        </p>

        <table class="matrix-table">
            <thead>
                <tr>
                    <th style="width: 28%;">Prueba / Comando</th>
                    <th style="width: 38%;">Resultado observado</th>
                    <th style="width: 34%;">Qué demuestra</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>npm.cmd run lint</code></td>
                    <td>Oxlint terminó sin hallazgos.</td>
                    <td>El código respeta las reglas del proyecto.</td>
                </tr>
                <tr>
                    <td><code>npm.cmd run build</code></td>
                    <td><code>tsc -b</code> y Vite compilaron 2195 módulos; único aviso: chunk de 578 kB.</td>
                    <td>TypeScript y el empaquetado están correctos; el tamaño se registra como mejora pendiente.</td>
                </tr>
                <tr>
                    <td><code>python backend/tests/test_smoke.py</code></td>
                    <td><strong>34/34 PASS</strong>. Se conservan las 6 rutas originales y se expone <code>/compat</code>.</td>
                    <td>El contrato previo no se rompió al añadir certificados.</td>
                </tr>
                <tr>
                    <td>Decodificación del QR con OpenCV</td>
                    <td><code>http://192.168.18.36:5173/?verify=EDU-2026-98124</code></td>
                    <td>El PNG generado contiene la URL correcta, no un JSON ilegible.</td>
                </tr>
                <tr>
                    <td>Navegador a 390 px</td>
                    <td><code>scrollWidth = 390</code>; drawer pasa de −288 px a 0 px; QR de 128 px; 0 errores de consola.</td>
                    <td>La vista móvil es usable y no hay desbordamiento.</td>
                </tr>
                <tr>
                    <td>Flujo del comprobante</td>
                    <td><code>?receipt=EDU-2026-98124</code> mostró QR, hash <code>6f5f33d8…</code>, “Volver” y “Guardar como PDF”.</td>
                    <td>El celular recibe el comprobante sin popup ni descarga bloqueada.</td>
                </tr>
                <tr>
                    <td>CORS simulado</td>
                    <td><code>Access-Control-Allow-Origin</code> para la IP Wi-Fi y para <code>*.up.railway.app</code>; sin header para <code>example.com</code>.</td>
                    <td>El backend admite el celular local y el futuro dominio público sin abrir CORS a cualquiera.</td>
                </tr>
                <tr>
                    <td>Build sin <code>.env.local</code></td>
                    <td>El bundle no contiene <code>192.168.18.36</code> y usa <code>location.origin</code>.</td>
                    <td>En Railway el QR tomará automáticamente la URL pública del frontend.</td>
                </tr>
            </tbody>
        </table>

        <h2>2.1 Trazabilidad registrada</h2>
        <p>
            Durante las pruebas se observaron eventos de auditoría <code>certificate.verify</code> y
            <code>certificate.receipt_open</code> en el endpoint <code>/api/v1/compat/audit/logs</code>.
            La cabecera <code>X-Actor</code> sigue siendo opcional: cuando no se envía, el sistema no finge
            una identidad. Esto se menciona de forma explícita porque forma parte de los puntos de mejoría.
        </p>

        <div class="callout">
            <div class="callout-title">Commit de cierre de esta entrega</div>
            <p><code>1d17191 feat: improve mobile view and prepare public QR for Railway</code></p>
        </div>
    </div>

    <!-- PÁGINA 3: PUNTOS DE MEJORÍA -->
    <div class="page">
        <h1>
            <span>3. Puntos de Mejoría Pendientes</span>
            <span class="section-tag">Hoja de ruta</span>
        </h1>

        <p>
            Las mejoras implementadas resuelven el problema inmediato del celular y del QR, pero el proyecto
            aún tiene deudas conscientes. La siguiente tabla las prioriza con un criterio académico: primero lo
            que habilita el uso real fuera de la Wi-Fi, después lo que da identidad y seguridad, y finalmente
            lo que mejora calidad y mantenimiento.
        </p>

        <table class="matrix-table">
            <thead>
                <tr>
                    <th style="width: 8%;">ID</th>
                    <th style="width: 30%;">Mejoría propuesta</th>
                    <th style="width: 10%;">Prioridad</th>
                    <th style="width: 24%;">Impacto esperado</th>
                    <th style="width: 28%;">Paso sugerido</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>M-01</td>
                    <td><strong>Publicar backend y frontend en Railway</strong></td>
                    <td><span class="badge-pill badge-blue">P1</span></td>
                    <td>El QR funciona fuera de la Wi-Fi y puede compartirse por WhatsApp o correo.</td>
                    <td>Definir <code>VITE_CORE_API_BASE_URL</code> con la URL real; dejar <code>VITE_PUBLIC_ORIGIN</code> sin definir.</td>
                </tr>
                <tr>
                    <td>M-02</td>
                    <td><strong>Supabase + OIDC + RLS</strong></td>
                    <td><span class="badge-pill badge-blue">P1</span></td>
                    <td>Identidad real, permisos por rol y datos autorizados en lugar de <code>localStorage</code>.</td>
                    <td>Diseñar el contrato de usuario y configurar proveedor; sin compartir secretos en el repo.</td>
                </tr>
                <tr>
                    <td>M-03</td>
                    <td><strong>Dividir el bundle mayor a 500 kB</strong></td>
                    <td><span class="badge-pill badge-blue">P1</span></td>
                    <td>Carga más rápida en celulares con datos móviles.</td>
                    <td>Aplicar <code>import()</code> dinámico en módulos pesados y revisar <code>codeSplitting</code>.</td>
                </tr>
                <tr>
                    <td>M-04</td>
                    <td><strong>Pruebas E2E del flujo QR</strong></td>
                    <td><span class="badge-pill badge-purple">P2</span></td>
                    <td>Evita que una futura mejora rompa escaneo, verificación o comprobante.</td>
                    <td>Automatizar con Playwright: escanear → verificar → abrir comprobante → guardar PDF.</td>
                </tr>
                <tr>
                    <td>M-05</td>
                    <td><strong>Accesibilidad del drawer</strong></td>
                    <td><span class="badge-pill badge-purple">P2</span></td>
                    <td>Navegación por teclado y lector de pantalla.</td>
                    <td>Añadir <code>aria-expanded</code>, cierre con <code>Escape</code> y manejo de foco.</td>
                </tr>
                <tr>
                    <td>M-06</td>
                    <td><strong>Estados offline y de error claros</strong></td>
                    <td><span class="badge-pill badge-purple">P2</span></td>
                    <td>El usuario entiende por qué no aparece el comprobante si la API falla.</td>
                    <td>Diferenciar “folio no encontrado” de “sin conexión con la API”.</td>
                </tr>
                <tr>
                    <td>M-07</td>
                    <td><strong>Actor autenticado en auditoría</strong></td>
                    <td><span class="badge-pill badge-green">P3</span></td>
                    <td>Trazabilidad con identidad verificable en cada evento.</td>
                    <td>Sustituir <code>X-Actor</code> opcional por el usuario de la sesión OIDC.</td>
                </tr>
                <tr>
                    <td>M-08</td>
                    <td><strong>Métricas medidas, no constantes</strong></td>
                    <td><span class="badge-pill badge-green">P3</span></td>
                    <td>Evita presentar <code>0.94</code>, PR-AUC <code>0.914</code> o Brier <code>0.082</code> como resultados reales.</td>
                    <td>Calcular métricas desde el dataset sintético y mostrarlas con su procedencia.</td>
                </tr>
                <tr>
                    <td>M-09</td>
                    <td><strong>Capacitación y material impreso</strong></td>
                    <td><span class="badge-pill badge-green">P3</span></td>
                    <td>Otros integrantes pueden reproducir la prueba sin ayuda.</td>
                    <td>Convertir <code>RAILWAY.md</code> en una guía de una página con capturas del flujo móvil.</td>
                </tr>
            </tbody>
        </table>

        <div class="callout amber">
            <div class="callout-title">Prioridad inmediata</div>
            <p>
                M-01 depende de las URLs y la cuenta de Railway del usuario; M-02 depende de una decisión de
                contrato y de credenciales. Ninguno de los dos se ejecutó en esta entrega y no se compartió
                ningún secreto.
            </p>
        </div>
    </div>

    <!-- PÁGINA 4: VALOR, LÍMITES Y CIERRE -->
    <div class="page">
        <h1>
            <span>4. Valor por Perfil y Límites Honestos</span>
            <span class="section-tag">Cierre</span>
        </h1>

        <table class="matrix-table">
            <thead>
                <tr>
                    <th style="width: 20%;">Perfil</th>
                    <th style="width: 42%;">Mejoría que recibe</th>
                    <th style="width: 38%;">Situación de uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Estudiante</strong></td>
                    <td>Menú lateral accesible y comprobante de certificado en pantalla.</td>
                    <td>Puede abrir el QR desde su celular y guardar el comprobante sin instalar nada.</td>
                </tr>
                <tr>
                    <td><strong>Docente</strong></td>
                    <td>Verificación por folio con hash y fecha visible.</td>
                    <td>Revisa un certificado DEMO sin depender de una captura de pantalla.</td>
                </tr>
                <tr>
                    <td><strong>Administrador</strong></td>
                    <td>CORS controlado y ruta de publicación documentada.</td>
                    <td>Cuenta con una guía corta para publicar sin exponer secretos.</td>
                </tr>
                <tr>
                    <td><strong>QA / Desarrollador</strong></td>
                    <td>Smoke 34/34, evidencia de QR decodificado y puntos de mejoría priorizados.</td>
                    <td>Tiene criterios objetivos para aceptar o rechazar la siguiente entrega.</td>
                </tr>
            </tbody>
        </table>

        <div class="callout amber">
            <div class="callout-title">Límites honestos de esta entrega</div>
            <p>
                Los datos, certificados y comprobantes son <strong>DEMO</strong> y sintéticos; no equivalen a un
                documento oficial. <code>127.0.0.1</code> en un celular apunta al propio celular, por eso el QR
                local usa la IP de la PC. Si cambia la red, debe actualizarse <code>VITE_PUBLIC_ORIGIN</code>.
                Supabase/OIDC siguen pendientes y las métricas de confianza mostradas en la interfaz son
                constantes ilustrativas, no mediciones.
            </p>
        </div>

        <h2>4.1 Conclusión</h2>
        <p>
            Las mejoras quedan validadas en el entorno local y listas para el siguiente paso: la publicación
            con URLs reales. El valor concreto de esta entrega es que el celular ya no es un obstáculo para
            probar el proyecto y que el QR dejó de ser decorativo. Los puntos M-01 a M-09 son deudas
            explícitas, no sorpresas ocultas, y están priorizadas para continuar el trabajo en el aula.
        </p>

        <table class="signoff-table">
            <tr>
                <td>
                    <div class="sign-line">
                        Kevin<br>
                        Autor de las mejoras de vista móvil, QR y comprobante
                    </div>
                    <div class="sign-title">SENATI · 4.º semestre · Ingeniería de Software con IA</div>
                </td>
                <td>
                    <div class="sign-line">
                        Validación académica<br>
                        Entrega DEMO con evidencia verificable
                    </div>
                    <div class="sign-title">Pendiente: publicación pública y autenticación real</div>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
'''

EXTRA_CSS = """
        <style>
            code {
                font-family: 'Consolas', 'Courier New', monospace;
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 3px;
                padding: 0 3px;
                font-size: 7.6pt;
                color: #0f172a;
            }
            .matrix-table td code { white-space: nowrap; }
            table.matrix-table { font-size: 7.7pt; margin-bottom: 9px; }
            table.matrix-table th { padding: 5px 7px; }
            table.matrix-table td { padding: 5px 7px; }
            .callout { padding: 8px 10px; margin-bottom: 9px; }
            .kpi-grid { margin-bottom: 10px; }
            h2 { margin-top: 12px; }
        </style>
"""


def main():
    with open(STYLE_SOURCE, "r", encoding="utf-8") as fh:
        source = fh.read()
    style = source[source.index("<style>"):source.index("</style>") + len("</style>")]
    style = style.replace(
        "EDUMASTER.AI ENTERPRISE | INFORME TÉCNICO DE MEJORAS & UTILIDAD",
        "EDUMASTER.AI | MEJORAS IMPLEMENTADAS Y PUNTOS DE MEJORÍA · KEVIN",
    )

    document = (
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n'
        '    <meta charset="UTF-8">\n'
        '    <title>EduMaster.ai - Mejoras Implementadas y Puntos de Mejoría</title>\n'
        + style + EXTRA_CSS + "\n</head>\n" + BODY
    )
    with open(HTML_PATH, "w", encoding="utf-8") as fh:
        fh.write(document)
    print("HTML generado:", HTML_PATH)

    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_path):
        raise SystemExit("No se encontró Microsoft Edge para generar el PDF.")

    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_PATH}",
        HTML_PATH,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit("Error generando PDF: " + result.stderr)
    print("PDF generado:", PDF_PATH)
    print("Tamaño:", os.path.getsize(PDF_PATH), "bytes")


if __name__ == "__main__":
    main()
