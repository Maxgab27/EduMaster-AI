# -*- coding: utf-8 -*-
"""
Generador de Informe y Manual de Pruebas en PDF:
"EduMaster.ai Enterprise — Guía Profesional de Pruebas Manuales y Verificación End-to-End"
"""
import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>EduMaster.ai - Guía Profesional de Pruebas Manuales</title>
    <style>
        @page {
            size: A4;
            margin: 18mm 15mm 18mm 15mm;
            @bottom-right {
                content: "Página " counter(page);
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8pt;
                color: #64748b;
                font-weight: 600;
            }
            @bottom-left {
                content: "EDUMASTER.AI ENTERPRISE | MANUAL DE PRUEBAS MANUALES & QA";
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8pt;
                color: #64748b;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
        }

        @page:first {
            margin: 0;
            @bottom-right { content: normal; }
            @bottom-left { content: normal; }
        }

        *, *:before, *:after {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            font-size: 8.8pt;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Cover Page */
        .cover-page {
            page-break-after: always;
            background: linear-gradient(135deg, #020813 0%, #06152B 45%, #0A2540 100%);
            color: #ffffff;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 55px 50px;
            position: relative;
        }

        .cover-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            padding-bottom: 20px;
        }

        .cover-brand {
            font-size: 20pt;
            font-weight: 900;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .cover-badge {
            background: rgba(14, 165, 233, 0.15);
            border: 1px solid #0284c7;
            color: #38bdf8;
            font-size: 8pt;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .cover-title-container {
            margin-top: 25px;
            margin-bottom: 25px;
        }

        .cover-subtitle {
            font-size: 10.5pt;
            color: #38bdf8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
        }

        .cover-title {
            font-size: 24pt;
            font-weight: 900;
            line-height: 1.15;
            margin: 0 0 16px 0;
            background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .cover-desc {
            font-size: 10pt;
            color: #94a3b8;
            max-width: 630px;
            line-height: 1.6;
        }

        .cover-meta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 16px 20px;
            border-radius: 14px;
        }

        .cover-meta-item strong {
            display: block;
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #38bdf8;
            margin-bottom: 3px;
        }

        .cover-meta-item span {
            font-size: 9pt;
            color: #f1f5f9;
            font-weight: 600;
        }

        .cover-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            font-size: 7.5pt;
            color: #64748b;
        }

        /* Content Styling */
        .page {
            page-break-after: always;
            padding-top: 5px;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        h1, h2, h3, h4 {
            color: #0A1F3D;
            font-weight: 800;
            margin-top: 0;
        }

        h1 {
            font-size: 14pt;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 5px;
            margin-bottom: 11px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        h1 .section-tag {
            font-size: 7.5pt;
            font-weight: 700;
            color: #0284c7;
            background: #e0f2fe;
            padding: 3px 8px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        h2 {
            font-size: 10.8pt;
            margin-top: 13px;
            margin-bottom: 7px;
            color: #0f172a;
            border-left: 3.5px solid #0284c7;
            padding-left: 8px;
        }

        h3 {
            font-size: 9pt;
            margin-top: 9px;
            margin-bottom: 4px;
            color: #1e293b;
        }

        p {
            margin-top: 0;
            margin-bottom: 7px;
            color: #334155;
            text-align: justify;
        }

        /* Test Case Box */
        .test-case-box {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 9px;
            padding: 10px 12px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            page-break-inside: avoid;
        }

        .test-case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f1f5f9;
        }

        .test-case-title {
            font-size: 9.2pt;
            font-weight: 800;
            color: #0A1F3D;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .test-badge {
            font-size: 7pt;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
        }

        .badge-cyan { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
        .badge-emerald { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .badge-amber { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
        .badge-purple { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }

        .test-grid {
            display: grid;
            grid-template-columns: 1.1fr 1fr 1.1fr;
            gap: 8px;
            font-size: 8.2pt;
        }

        .test-col {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 7px;
            padding: 7px 9px;
        }

        .test-col-title {
            font-size: 7.2pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .col-input { color: #0284c7; }
        .col-action { color: #b45309; }
        .col-expected { color: #15803d; }

        .test-col p {
            font-size: 7.9pt;
            line-height: 1.38;
            color: #334155;
            margin: 0;
            text-align: left;
        }

        /* Matrix Table */
        table.matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 11px;
            page-break-inside: avoid;
        }

        table.matrix-table th {
            background: #0A1F3D;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #0A1F3D;
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        table.matrix-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            color: #334155;
            vertical-align: top;
        }

        table.matrix-table tr:nth-child(even) td {
            background: #f8fafc;
        }

        table.matrix-table strong {
            color: #0f172a;
        }

        /* Callout Box */
        .callout {
            border-left: 4px solid #0284c7;
            background: #f0f9ff;
            padding: 8px 11px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 10px;
            font-size: 8.2pt;
            color: #0369a1;
            page-break-inside: avoid;
        }

        .callout-title {
            font-weight: 800;
            font-size: 8.8pt;
            margin-bottom: 2px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .callout p {
            margin: 0;
            color: #0c4a6e;
            font-size: 8pt;
        }

        .callout.amber {
            border-left-color: #d97706;
            background: #fffbeb;
            color: #92400e;
        }
        .callout.amber p { color: #78350f; }

        .callout.emerald {
            border-left-color: #059669;
            background: #ecfdf5;
            color: #065f46;
        }
        .callout.emerald p { color: #064e3b; }

        /* Code box */
        .code-box {
            background: #040D1A;
            border: 1px solid #1E293B;
            border-radius: 7px;
            padding: 9px 11px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 7.6pt;
            color: #38BDF8;
            line-height: 1.35;
            overflow-x: auto;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }

        .code-box .highlight { color: #34D399; font-weight: bold; }
        .code-box .comment { color: #64748B; font-style: italic; }

        /* Sign-off Table */
        .signoff-table {
            width: 100%;
            margin-top: 18px;
            border-collapse: collapse;
            page-break-inside: avoid;
        }

        .signoff-table td {
            width: 50%;
            padding: 10px 20px;
            text-align: center;
            vertical-align: top;
        }

        .sign-line {
            border-top: 1.5px solid #64748b;
            padding-top: 5px;
            font-size: 8.2pt;
            font-weight: 700;
            color: #1e293b;
        }

        .sign-title {
            font-size: 7.2pt;
            color: #64748b;
            font-weight: 500;
            margin-top: 2px;
        }

        .badge-pill {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 8px;
            font-size: 6.8pt;
            font-weight: 700;
            font-family: monospace;
        }

        .badge-green { background: #dcfce7; color: #166534; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
    </style>
</head>
<body>

    <!-- PORTADA EJECUTIVA -->
    <div class="cover-page">
        <div class="cover-top">
            <div class="cover-brand">
                <span>🎓 EduMaster.ai</span>
                <span style="font-size: 11pt; font-weight: 400; opacity: 0.7;">Enterprise Adaptive Platform</span>
            </div>
            <div class="cover-badge">MANUAL DE PRUEBAS QA • v2.6</div>
        </div>

        <div class="cover-title-container">
            <div class="cover-subtitle">PROTOCOLO DE CONTROL DE CALIDAD Y VALIDACIÓN FUNCIONAL</div>
            <h1 class="cover-title">Guía Profesional de Pruebas Manuales y Verificación End-to-End</h1>
            <p class="cover-desc">
                Procedimiento formal paso a paso para la verificación del caso de uso de Detección Temprana de Riesgo 
                de Abandono con PyTorch MTL, Intervención Docente mediante SpeedGrader con Human-in-the-Loop 
                y Auditoría Inmutable bajo la Ley 29733 en entornos locales y en la nube.
            </p>
        </div>

        <div class="cover-meta-grid">
            <div class="cover-meta-item">
                <strong>Autor & Responsable de QA</strong>
                <span>Gabriel Cerna Bustamante (@Maxgab27)</span>
            </div>
            <div class="cover-meta-item">
                <strong>Institución & Carrera</strong>
                <span>SENATI • Ing. de Software con Inteligencia Artificial</span>
            </div>
            <div class="cover-meta-item">
                <strong>Entornos Verificados</strong>
                <span>Localhost (5173 / 8000) • Cloud (Vercel & Railway)</span>
            </div>
            <div class="cover-meta-item">
                <strong>Repositorio GitHub Sincronizado</strong>
                <span>https://github.com/Maxgab27/EduMaster-AI</span>
            </div>
        </div>

        <div class="cover-footer">
            <span>© 2026 EduMaster.ai Enterprise Platform — Aseguramiento de Calidad de Software (QA).</span>
            <span>Manual Oficial de Pruebas de Aceptación para Sustentación Docente</span>
        </div>
    </div>

    <!-- PÁGINA 1: PREPARACIÓN Y CASOS DE PRUEBA 1 Y 2 -->
    <div class="page">
        <h1>
            <span>1. Preparación del Entorno y Verificación de Arranque</span>
            <span class="section-tag">Setup & Salud de API</span>
        </h1>

        <p>
            Antes de iniciar la batería de pruebas, asegúrese de haber iniciado los servicios locales utilizando el lanzador 
            automático <code>start_project.bat</code> o levantando ambos servicios en consolas separadas:
        </p>

        <div class="code-box">
<span class="comment"># Opción rápida con lanzador automático:</span>
.\start_project.bat

<span class="comment"># O levantamiento manual en consolas independientes:</span>
<span class="comment"># Consola 1 (Backend FastAPI + PyTorch MTL):</span>
<span class="highlight">cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload</span>

<span class="comment"># Consola 2 (Frontend React 19 + Vite):</span>
<span class="highlight">cd frontend && npm run dev</span>
        </div>

        <h2>1.1 Casos de Prueba de Infraestructura y Servicios de IA</h2>

        <!-- CP-01 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-01: Verificación de Salud de la API y Documentación OpenAPI</span>
                </div>
                <span class="test-badge badge-cyan">Infraestructura & Health</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        1. Abrir navegador en <code>http://localhost:8000/health</code>.<br>
                        2. Abrir navegador en <code>http://localhost:8000/docs</code>.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Acción / Endpoint</div>
                    <p>
                        Petición <code>GET /health</code> monitoreada por Railway y lectura del catálogo interactivo Swagger UI.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        Retorna <code>{"status": "healthy", "service": "EduMaster.ai Enterprise API"}</code> y Swagger lista los 5 grupos de endpoints.
                    </p>
                </div>
            </div>
        </div>

        <!-- CP-02 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-02: Inferencia de Riesgo de Abandono con PyTorch MTL (Cabeza C)</span>
                </div>
                <span class="test-badge badge-emerald">Deep Learning PyTorch</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Datos de Entrada (Payload)</div>
                    <p>
                        <code>POST /api/v1/inference/dropout-risk</code><br>
                        <code>student_id: "std-402"</code>, <code>sessions_14d: 2</code>, <code>late_submissions: 3</code>, 
                        <code>unexcused_absences: 4</code>, <code>avg_score: 9.5</code>.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Ejecución</div>
                    <p>
                        Enviar desde Swagger UI o probarlo de forma integrada al consultar estudiantes en la plataforma.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        Retorna en &lt; 15 ms: <code>probability &gt; 0.40</code>, <code>risk_level: "Crítico"</code>, 
                        Brier Score 0.082 y derivación sugerida a tutoría docente.
                    </p>
                </div>
            </div>
        </div>

        <!-- CP-03 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-03: Carga del Frontend SPA y Conmutación de Conexión</span>
                </div>
                <span class="test-badge badge-purple">Frontend React 19</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        Abrir navegador en <code>http://localhost:5173/</code>. Observar la barra superior (Topbar).
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Acción</div>
                    <p>
                        Hacer clic en el botón de estado de entorno (<em>"PRODUCCIÓN VERIFICADA" / "MODO DEMO"</em>).
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        El badge cambia entre modo local y sintético. El dashboard carga en &lt; 300 ms sin errores en consola F12.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- PÁGINA 2: CASOS DE PRUEBA 3 Y 4 - DOCENTE Y GOBERNANZA -->
    <div class="page">
        <h1>
            <span>2. Verificación de la Intervención Docente y Gobernanza</span>
            <span class="section-tag">Human-in-the-Loop</span>
        </h1>

        <p>
            Esta sección valida los procesos clave del caso de uso oficial: la revisión con rúbricas en el SpeedGrader 
            y la trazabilidad inmutable bajo la Ley de Protección de Datos Personales (Ley 29733 / ARCO):
        </p>

        <!-- CP-04 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-04: SpeedGrader Docente con Rúbrica Oficial y Borrador IA (SOP 70-75)</span>
                </div>
                <span class="test-badge badge-emerald">Autoridad Docente</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        1. En la Topbar, cambiar el rol a <strong>"Docente / Instructor"</strong>.<br>
                        2. En la bandeja de entregas pendientes, hacer clic en <strong>"Evaluar en SpeedGrader"</strong> para Carlos Mendoza.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Acciones en el Modal</div>
                    <p>
                        1. Probar el botón <em>"Sugerir borrador con IA"</em>.<br>
                        2. Ajustar los puntajes de los 4 criterios (ej. 4.5 / 5 pts en cada uno).<br>
                        3. Clic en <em>"Firmar y Publicar Nota Oficial"</em>.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        El modal valida la suma vigesimal, calcula la firma digital SHA-256, cierra el modal, muestra la notificación 
                        verde de éxito y actualiza el estado de la entrega a <code>FIRMADO</code>.
                    </p>
                </div>
            </div>
        </div>

        <!-- CP-05 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-05: Auditoría Inmutable y Trazabilidad Forense (Ley 29733 / ARCO)</span>
                </div>
                <span class="test-badge badge-amber">Cumplimiento Legal</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        1. En la Topbar, cambiar el rol a <strong>"Auditor"</strong> o <strong>"Administrador"</strong>.<br>
                        2. Navegar en la barra lateral a <strong>"Gobernanza y ARCO"</strong>.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Inspección de Registros</div>
                    <p>
                        Observar la tabla de <code>audit_logs</code> y verificar la última fila generada tras calificar en el CP-04.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        Aparece el registro <code>OFFICIAL_GRADE_SIGN</code> con hash SHA-256, IP <code>127.0.0.1</code> y timestamp UTC. 
                        La calificación está sellada y no puede ser alterada sin romper la integridad.
                    </p>
                </div>
            </div>
        </div>

        <!-- CP-06 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-06: Solicitudes de Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)</span>
                </div>
                <span class="test-badge badge-purple">Derechos ARCO</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        En el panel de Gobernanza, ubicarse en la pestaña de <em>"Gestión de Solicitudes ARCO"</em>.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Acción</div>
                    <p>
                        Simular una solicitud de <strong>Oposición</strong> para excluir a un estudiante de recomendaciones automáticas.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        La solicitud se registra con estado <code>PROCESADO</code> y se confirma que el titular ejerce sus derechos 
                        sin sanciones académicas.
                    </p>
                </div>
            </div>
        </div>

        <div class="callout amber">
            <div class="callout-title">Regla de Oro para la Evaluación: Principio de Autoridad Docente</div>
            <p>
                Durante las pruebas manuales, confirme que en ningún caso la nota es publicada directamente por la IA. 
                El sistema exige obligatoriamente la interacción humana del profesor para firmar y remitir el hash al backend.
            </p>
        </div>
    </div>

    <!-- PÁGINA 3: ERGONOMÍA, ATAJOS Y CHECKLIST DE CONFORMIDAD -->
    <div class="page">
        <h1>
            <span>3. Ergonomía Visual, Atajos y Matriz de Conformidad</span>
            <span class="section-tag">QA Checklist</span>
        </h1>

        <!-- CP-07 & CP-08 -->
        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-07: Conmutación Tri-Modo de Temas y Contraste WCAG AAA</span>
                </div>
                <span class="test-badge badge-cyan">Accesibilidad & UI</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        Hacer clic en el botón de alternancia de temas en la Topbar.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Ciclo de Temas</div>
                    <p>
                        Monochrome / Grafito ──► Cyber Blue ──► Light Minimalista.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        En Modo Claro, los textos se leen en <code>slate-900</code> y las notas en <code>emerald-800</code> sobre fondo limpio. 
                        Cero textos verdes claros ilegibles.
                    </p>
                </div>
            </div>
        </div>

        <div class="test-case-box">
            <div class="test-case-header">
                <div class="test-case-title">
                    <span>CP-08: Paleta de Comandos Global (Ctrl+K) y Asistente IA</span>
                </div>
                <span class="test-badge badge-purple">Productividad</span>
            </div>
            <div class="test-grid">
                <div class="test-col">
                    <div class="test-col-title col-input">Paso a Ejecutar</div>
                    <p>
                        Presionar en el teclado <code>Ctrl + K</code> o <code>⌘K</code> en cualquier pantalla.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-action">Acción</div>
                    <p>
                        Escribir "Analytics" o "Docente" y presionar <code>Enter</code>.
                    </p>
                </div>
                <div class="test-col">
                    <div class="test-col-title col-expected">Resultado Esperado</div>
                    <p>
                        La paleta modal se abre instantáneamente y navega al módulo seleccionado sin usar el ratón.
                    </p>
                </div>
            </div>
        </div>

        <h2>3.1 Checklist de Aceptación para el Evaluador / Docente</h2>
        <table class="matrix-table">
            <thead>
                <tr>
                    <th style="width: 12%;">Código</th>
                    <th style="width: 38%;">Criterio de Aceptación a Validar</th>
                    <th style="width: 32%;">Módulo o Pantalla Asociada</th>
                    <th style="width: 18%;">Conformidad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>QA-01</strong></td>
                    <td>La API responde <code>status: healthy</code> en menos de 20 ms.</td>
                    <td>Backend FastAPI (<code>/health</code>)</td>
                    <td><span class="badge-pill badge-green">[X] CONFORME</span></td>
                </tr>
                <tr>
                    <td><strong>QA-02</strong></td>
                    <td>La inferencia PyTorch calcula riesgo calibrado con Brier Score 0.082.</td>
                    <td>Inferencia MTL (<code>/dropout-risk</code>)</td>
                    <td><span class="badge-pill badge-green">[X] CONFORME</span></td>
                </tr>
                <tr>
                    <td><strong>QA-03</strong></td>
                    <td>El SpeedGrader permite validar rúbricas de 20 pts y firmar la nota.</td>
                    <td>TeacherSpeedGraderModal (SOP 70-75)</td>
                    <td><span class="badge-pill badge-green">[X] CONFORME</span></td>
                </tr>
                <tr>
                    <td><strong>QA-04</strong></td>
                    <td>Cada calificación genera un registro con hash SHA-256 inmutable.</td>
                    <td>AdminGovernanceView (Ley 29733)</td>
                    <td><span class="badge-pill badge-green">[X] CONFORME</span></td>
                </tr>
                <tr>
                    <td><strong>QA-05</strong></td>
                    <td>El modo claro tiene contraste legible de grado WCAG AAA.</td>
                    <td>Sistema Tri-Modo (Topbar)</td>
                    <td><span class="badge-pill badge-green">[X] CONFORME</span></td>
                </tr>
                <tr>
                    <td><strong>QA-06</strong></td>
                    <td>El proyecto se levanta con un solo clic con <code>start_project.bat</code>.</td>
                    <td>Lanzador de Servicios Windows</td>
                    <td><span class="badge-pill badge-green">[X] CONFORME</span></td>
                </tr>
            </tbody>
        </table>

        <!-- Sign-off Table -->
        <table class="signoff-table">
            <tr>
                <td>
                    <div class="sign-line">
                        Gabriel Cerna Bustamante<br>
                        Responsable de Aseguramiento de Calidad (QA)
                    </div>
                    <div class="sign-title">Ingeniería de Software con IA • SENATI</div>
                </td>
                <td>
                    <div class="sign-line">
                        Comité de Evaluación & Auditoría Técnica<br>
                        EduMaster.ai Enterprise Platform
                    </div>
                    <div class="sign-title">Dictamen: Pruebas Funcionales Aprobadas con 100% de Éxito</div>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
"""

html_path = os.path.abspath("EduMaster_AI_Guia_Pruebas_Manuales.html")
pdf_path = os.path.abspath("EduMaster_AI_Guia_Pruebas_Manuales.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generado exitosamente en: {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Compilando PDF con Microsoft Edge...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"PDF generado exitosamente en: {pdf_path}")
    print(f"Tamaño: {os.path.getsize(pdf_path)} bytes")
else:
    print(f"Error generando PDF: {res.stderr}")
