# -*- coding: utf-8 -*-
import subprocess
import os

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>EduMaster.ai - Análisis y Mapeo Técnico-Estratégico Enterprise</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 16mm 20mm 16mm;
            @bottom-right {
                content: counter(page);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 8.5pt;
                color: #64748b;
            }
            @bottom-left {
                content: "EDUMASTER.AI | INFORME TÉCNICO Y ESTRATÉGICO ENTERPRISE";
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 8.5pt;
                color: #64748b;
                text-transform: uppercase;
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
            color: #1e293b;
            line-height: 1.55;
            font-size: 9.5pt;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Cover Page */
        .cover-page {
            page-break-after: always;
            background: linear-gradient(135deg, #040d1a 0%, #06152B 50%, #0A1F3D 100%);
            color: #ffffff;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 70px 60px;
            position: relative;
            box-sizing: border-box;
        }

        .cover-page::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
                radial-gradient(circle at 80% 20%, rgba(32, 200, 245, 0.12) 0%, transparent 40%),
                radial-gradient(circle at 20% 80%, rgba(139, 77, 255, 0.12) 0%, transparent 40%);
            pointer-events: none;
        }

        .cover-header {
            border-bottom: 2px solid rgba(8, 127, 229, 0.4);
            padding-bottom: 25px;
        }

        .brand-badge {
            display: inline-block;
            background: rgba(8, 127, 229, 0.2);
            border: 1px solid #087FE5;
            color: #20C8F5;
            font-size: 9pt;
            font-weight: 700;
            padding: 6px 16px;
            border-radius: 20px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        .cover-title {
            font-size: 32pt;
            font-weight: 900;
            color: #ffffff;
            line-height: 1.15;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
        }

        .cover-title span {
            color: #20C8F5;
        }

        .cover-subtitle {
            font-size: 13pt;
            font-weight: 400;
            color: #94a3b8;
            max-width: 650px;
            line-height: 1.4;
            margin: 15px 0 0 0;
        }

        .cover-slogan {
            margin-top: 25px;
            display: inline-flex;
            gap: 15px;
            font-size: 10pt;
            font-weight: 800;
            color: #00BFA6;
            letter-spacing: 2px;
        }

        .cover-metadata {
            background: rgba(10, 31, 61, 0.85);
            border: 1px solid rgba(8, 127, 229, 0.4);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(10px);
            margin-top: 40px;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            font-size: 9pt;
        }

        .meta-item strong {
            color: #20C8F5;
            display: block;
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }

        .meta-item span {
            color: #f1f5f9;
            font-size: 9pt;
        }

        .cover-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #64748b;
        }

        /* Content Pages */
        .content {
            padding: 0;
        }

        h1, h2, h3, h4 {
            color: #06152B;
            font-weight: 700;
            page-break-after: avoid;
        }

        h1 {
            font-size: 18pt;
            border-bottom: 2.5px solid #087FE5;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 16px;
            letter-spacing: -0.3px;
        }

        h2 {
            font-size: 13pt;
            border-left: 4px solid #087FE5;
            padding-left: 10px;
            margin-top: 24px;
            margin-bottom: 12px;
            color: #0A1F3D;
        }

        h3 {
            font-size: 10.5pt;
            margin-top: 16px;
            margin-bottom: 8px;
            color: #0f172a;
        }

        p {
            margin: 0 0 10px 0;
            text-align: justify;
        }

        ul, ol {
            margin: 0 0 12px 0;
            padding-left: 22px;
        }

        li {
            margin-bottom: 5px;
        }

        /* Callouts / Alerts */
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin: 14px 0;
            font-size: 9pt;
            page-break-inside: avoid;
        }

        .alert-danger {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }

        .alert-warning {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }

        .alert-info {
            background-color: #f0f9ff;
            border-left: 4px solid #087FE5;
            color: #0369a1;
        }

        .alert-success {
            background-color: #f0fdf4;
            border-left: 4px solid #00BFA6;
            color: #065f46;
        }

        .alert-title {
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
            text-transform: uppercase;
            font-size: 8pt;
            letter-spacing: 0.5px;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 8.5pt;
            page-break-inside: avoid;
        }

        th, td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #0A1F3D;
            color: #ffffff;
            font-weight: 600;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        /* Diagrams & Boxes */
        .diagram-box {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px;
            margin: 14px 0;
            page-break-inside: avoid;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 8pt;
            color: #0f172a;
            white-space: pre;
            line-height: 1.4;
            overflow-x: auto;
        }

        .kpi-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 7.5pt;
            font-weight: 700;
            background: #e2e8f0;
            color: #334155;
            margin-right: 4px;
        }

        .tag-blue { background: #e0f2fe; color: #0369a1; }
        .tag-purple { background: #f3e8ff; color: #7e22ce; }
        .tag-teal { background: #ccfbf1; color: #0f766e; }
        .tag-red { background: #fee2e2; color: #b91c1c; }

        .page-break {
            page-break-after: always;
        }

        .signature-table {
            width: 100%;
            margin-top: 35px;
            border: none;
            page-break-inside: avoid;
        }

        .signature-table td {
            border: none;
            padding: 20px;
            text-align: center;
            width: 33.33%;
            background: transparent !important;
        }

        .signature-line {
            border-top: 1px solid #94a3b8;
            margin-top: 45px;
            padding-top: 6px;
            font-size: 8pt;
            font-weight: 600;
            color: #475569;
        }
    </style>
</head>
<body>

    <!-- PORTADA EJECUTIVA -->
    <div class="cover-page">
        <div class="cover-header">
            <div class="brand-badge">EDUMASTER.AI ENTERPRISE ARCHITECTURE</div>
            <h1 class="cover-title">INFORME TÉCNICO Y ESTRATÉGICO DE ARQUITECTURA</h1>
            <div class="cover-subtitle">Mapeo Integral de Especificaciones, Manual Operativo de Procedimientos (SOPs) y Evaluación de Riesgos Críticos de Implementación</div>
            <div class="cover-slogan">
                <span>APRENDE</span> • <span>PRACTICA</span> • <span>DESTACA</span>
            </div>
        </div>

        <div class="cover-metadata">
            <div class="meta-grid">
                <div class="meta-item">
                    <strong>Proyecto</strong>
                    <span>EduMaster.ai – Plataforma de Aprendizaje Inteligente y MLOps</span>
                </div>
                <div class="meta-item">
                    <strong>Versión / Fecha</strong>
                    <span>Versión 1.0 Enterprise • Noviembre 2026</span>
                </div>
                <div class="meta-item">
                    <strong>Documentos de Origen</strong>
                    <span>Especificación Técnica (22 págs.) & Manual de Procedimientos (19 págs.)</span>
                </div>
                <div class="meta-item">
                    <strong>Nivel de Criticidad</strong>
                    <span>Producción Profesional Enterprise / Cumplimiento Legal Ley 29733</span>
                </div>
                <div class="meta-item">
                    <strong>Stack Tecnológico</strong>
                    <span>React 19 + TypeScript, FastAPI, PostgreSQL, PyTorch, Celery/Redis</span>
                </div>
                <div class="meta-item">
                    <strong>Audiencia</strong>
                    <span>Dirección Ejecutiva, Arquitectura, Data Science, QA, SRE y Auditoría</span>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            <span>Documento Confidencial de Arquitectura e Ingeniería de Sistemas</span>
            <span>Entorno Enterprise • 2026</span>
        </div>
    </div>

    <!-- CUERPO DEL INFORME -->
    <div class="content">

        <h1>1. Resumen Ejecutivo y Visión del Proyecto</h1>
        <p>El presente informe técnico proporciona una síntesis rigurosa, forense y estratégica de la documentación oficial del sistema <strong>EduMaster.ai</strong>. La plataforma ha sido conceptualizada como una solución corporativa de última generación que unifica la administración académica transaccional (LMS core), el seguimiento de aprendizaje en tiempo real y la predicción algorítmica mediante redes neuronales artificiales profundas.</p>
        
        <p>Dado que el proyecto posee objetivos de <strong>operación profesional y corporativa</strong>, cada decisión de diseño, estructura de base de datos, tubería de datos (DataOps) y ciclo de vida de machine learning (MLOps) ha sido planificada para eliminar fallos sistémicos que comprometan la legalidad institucional, la estabilidad de la infraestructura o la equidad pedagógica.</p>

        <div class="alert alert-info">
            <div class="alert-title">Principio Rector de Transparencia Activa</div>
            Queda estrictamente prohibido simular actividad algorítmica mediante animaciones cosméticas. Cada elemento visual en la interfaz debe estar respaldado por un endpoint autenticado, una consulta transaccional o un estado verificable de inferencia/entrenamiento. Si el backend no reporta eventos en vivo, la interfaz indicará de forma inequívoca <em>"Sin conexión"</em> o <em>"Última actualización"</em>.
        </div>

        <div class="diagram-box">
                       EDUMASTER.AI: TOPOLOGÍA ARQUITECTURAL DE ALTO NIVEL
                       
   [Cliente Web SPA] ──(HTTPS/WSS)──► [API Gateway / FastAPI Backend]
   (React 19 + TS + Vite)               │
                                        ├──► [PostgreSQL] (Datos OLTP + RLS + Particionamiento)
                                        ├──► [Transactional Outbox] ──► [Redis Streams]
                                        │                                    │
                                        ▼                                    ▼
                              [Celery / RQ Workers]               [Event Publisher / SSE]
                                        │                                    │
                         ┌──────────────┴──────────────┐                     │
                         ▼                             ▼                     │
                 [DataOps / DVC ETL]          [PyTorch Inference API]        │
                         │                             │                     │
                 [MLflow Registry] ◄───────────────────┘                     │
                         │                                                   │
                         └───────────────────────────────────────────────────┘
        </div>

        <div class="page-break"></div>

        <h1>PARTE I: Mapeo Integral del Documento 1 (Especificación Funcional y Técnica)</h1>
        
        <h2>1.1 Delimitación de Alcance y Exclusiones de Seguridad (Non-Goals)</h2>
        <p>El Documento 1 fija las fronteras operativas del sistema, definiendo con total nitidez lo que la plataforma <strong>no debe hacer bajo ninguna circunstancia</strong> para evitar pasivos legales y éticos:</p>
        <ul>
            <li><strong>No Automatización Punitiva:</strong> Queda terminantemente prohibido que un modelo de IA aplique sanciones, suspensiones o calificaciones oficiales definitivas sin supervisión humana obligatoria (<em>Human-in-the-loop</em>).</li>
            <li><strong>No Vigilancia Invasiva:</strong> Exclusión explícita de biometría, reconocimiento facial o inferencia de estados emocionales.</li>
            <li><strong>No Reentrenamiento no Supervisado en Producción:</strong> Los reentrenamientos son asíncronos, pasan por validación en Staging, aprobación del Data Owner y registro en Model Registry antes de su promoción.</li>
            <li><strong>No "Venta de Humo" Predictiva:</strong> Prohibido emitir predicciones de riesgo de deserción o finalización sin contar previamente con datasets históricos auditados y representativos.</li>
        </ul>

        <h2>1.2 Matriz de Roles y Gobernanza de Accesos (RBAC / ABAC)</h2>
        <p>La seguridad se aplica de forma mandatoria en el backend. Ocultar componentes en React no constituye un control de seguridad. Se implementa control basado en roles (RBAC) y atributos de contexto (ABAC):</p>

        <table>
            <thead>
                <tr>
                    <th>Recurso / Entidad</th>
                    <th>Superadmin / Admin</th>
                    <th>Docente / Instructor</th>
                    <th>Estudiante</th>
                    <th>Analista de Datos</th>
                    <th>ML Engineer</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Usuarios y Roles</strong></td>
                    <td>CRUD Completo</td>
                    <td>Lectura Limitada</td>
                    <td>Propio Perfil</td>
                    <td>Seudonimizado</td>
                    <td>Sin acceso por defecto</td>
                </tr>
                <tr>
                    <td><strong>Cursos y Mallas</strong></td>
                    <td>CRUD Completo</td>
                    <td>Asignados únicamente</td>
                    <td>Inscritos</td>
                    <td>Lectura Agregada</td>
                    <td>Sin acceso</td>
                </tr>
                <tr>
                    <td><strong>Calificaciones</strong></td>
                    <td>Total / Auditoría</td>
                    <td>Sus grupos y rúbricas</td>
                    <td>Propias</td>
                    <td>Agregadas y anonimizadas</td>
                    <td>Variables de entrenamiento</td>
                </tr>
                <tr>
                    <td><strong>Datasets de Entrenamiento</strong></td>
                    <td>Aprobación de acceso</td>
                    <td>Sin acceso</td>
                    <td>Sin acceso</td>
                    <td>Extracción y Limpieza</td>
                    <td>Consumo y Split Temporal</td>
                </tr>
                <tr>
                    <td><strong>Modelos y Despliegues</strong></td>
                    <td>Aprobación de paso a Prod</td>
                    <td>Consulta de inferencias</td>
                    <td>Recomendaciones útiles</td>
                    <td>Evaluación de métricas</td>
                    <td>Entrenamiento y Registro</td>
                </tr>
                <tr>
                    <td><strong>Auditoría Transversal</strong></td>
                    <td>Consulta completa</td>
                    <td>Propia actividad</td>
                    <td>Propia actividad</td>
                    <td>Lectura autorizada</td>
                    <td>Eventos y Logs de ML</td>
                </tr>
            </tbody>
        </table>

        <h2>1.3 Arquitectura Técnica y Stack Tecnológico</h2>
        <ul>
            <li><strong>Frontend:</strong> React 19 + TypeScript en modo estricto, empaquetado con Vite. Utiliza Tailwind CSS y componentes primitivos accesibles de shadcn/ui. El grafo neuronal se dibuja en Canvas/WebGL desacoplado del render de React.</li>
            <li><strong>Backend API:</strong> Python 3.12+ estructurado en FastAPI con validación por Pydantic v2. Arquitectura de Monolito Modular con routers delgados, servicios de aplicación y repositorios desacoplados.</li>
            <li><strong>Persistencia Relacional:</strong> PostgreSQL utilizando UUID v4 como identificador interno universal, claves foráneas estrictas, timestamps en UTC y particionamiento mensual en tablas de alta concurrencia.</li>
            <li><strong>Eventos y Asincronía:</strong> Patrón Transactional Outbox + Redis Streams para publicación atómica de eventos de dominio; Redis + Celery para tareas en segundo plano.</li>
            <li><strong>Ecosistema MLOps:</strong> PyTorch (módulos <code>torch.nn</code>), MLflow para Experiment Tracking y Model Registry, y DVC para control de versiones de datos sobre almacenamiento compatible con S3.</li>
        </ul>

        <div class="page-break"></div>

        <h2>1.4 Arquitectura Deep Learning: EduMaster Multi-Task Learning Network</h2>
        <p>El sistema rechaza arquitecturas de caja negra genéricas y adopta un modelo multitarea estructurado con representación compartida y cuatro cabezas de salida independientes:</p>

        <table>
            <thead>
                <tr>
                    <th>Componente de Red</th>
                    <th>Diseño Propuesto</th>
                    <th>Propósito y Función Matemática</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Entrada Tabular</strong></td>
                    <td>Normalización Z-Score + Embeddings Categóricos</td>
                    <td>Procesamiento del perfil académico, antecedentes e interacciones agregadas.</td>
                </tr>
                <tr>
                    <td><strong>Rama Temporal</strong></td>
                    <td>GRU (Gated Recurrent Unit) / Transformer Encoder</td>
                    <td>Captura de dinámicas secuenciales y ventanas temporales de navegación.</td>
                </tr>
                <tr>
                    <td><strong>Capa de Fusión</strong></td>
                    <td>Concatenación + Dense + LayerNorm + Dropout</td>
                    <td>Integración de representaciones estáticas y temporales evitando co-adaptación.</td>
                </tr>
                <tr>
                    <td><strong>Cabeza A (Finalización)</strong></td>
                    <td>Sigmoide calibrada + Función BCE</td>
                    <td>Estimación probabilística de completar el curso en una ventana de 30 días.</td>
                </tr>
                <tr>
                    <td><strong>Cabeza B (Dominio)</strong></td>
                    <td>Softmax ordinal / Regresión acotada</td>
                    <td>Predicción de nivel de maestría en competencias curriculares (1 a 5).</td>
                </tr>
                <tr>
                    <td><strong>Cabeza C (Riesgo)</strong></td>
                    <td>Sigmoide + Brier Score Calibration</td>
                    <td>Detección temprana de desconexión y riesgo de deserción para apoyo docente.</td>
                </tr>
                <tr>
                    <td><strong>Cabeza D (Recomendación)</strong></td>
                    <td>Ranking Loss / Multi-Clase Top-K</td>
                    <td>Ordenamiento de recursos, lecciones y actividades de refuerzo.</td>
                </tr>
            </tbody>
        </table>

        <div class="alert alert-warning">
            <div class="alert-title">Decisión Mandatoria Basada en Baselines</div>
            Antes de publicar cualquier modelo de red neuronal profunda, el equipo de Machine Learning tiene la obligación contractual de entrenar y evaluar <strong>baselines interpretables</strong> (Regresión Logística, Árboles de Decisión, XGBoost). Si la red neuronal no demuestra una ganancia estadísticamente significativa en métricas de calibración (PR-AUC, ROC-AUC, Brier) y equidad sobre el baseline, no será promovida a producción.
        </div>

        <h2>1.5 DataOps: Prevención de Fuga de Datos (Data Leakage) y Calidad</h2>
        <p>Para evitar predicciones fraudulentas y sobreajuste, el pipeline de datos impone reglas matemáticas estrictas:</p>
        <ul>
            <li><strong>Prohibición de Random Split:</strong> El conjunto de datos jamás se dividirá aleatoriamente. Se exige <strong>Split Temporal</strong>: entrenamiento con periodos históricos pasados, validación con el periodo intermedio y evaluación con el periodo más reciente.</li>
            <li><strong>Ventanas Temporales Estrictas:</strong> Ninguna variable posterior al evento a predecir puede formar parte del vector de características.</li>
            <li><strong>Criterios de Calidad Mínima:</strong> $\ge 98\%$ completitud en campos críticos, 0 duplicados en identificadores de eventos, y verificación de rangos físicos de tiempo activo (descartando sesiones artificiales).</li>
        </ul>

        <h2>1.6 Seguridad y Cumplimiento Normativo (Ley N.° 29733 de Perú)</h2>
        <p>El tratamiento de datos de estudiantes y menores de edad impone una disciplina de seguridad de nivel bancario:</p>
        <ul>
            <li><strong>Base Legal y Consentimiento:</strong> Cumplimiento estricto de la Ley N.° 29733 (Ley de Protección de Datos Personales de Perú) y su reglamento. Implementación de cláusulas de consentimiento expreso y mecanismos para atención de derechos ARCO.</li>
            <li><strong>Aislamiento Multi-Tenant:</strong> Validación de <code>organization_id</code> en cada endpoint y consulta relacional, complementado con Row Level Security (RLS) en PostgreSQL.</li>
            <li><strong>Auditoría Inmutable:</strong> Registro indeleble en la tabla <code>audit_logs</code> de cambios de notas, emisión de certificados, promociones de modelos y exportaciones masivas de datos.</li>
        </ul>

        <div class="page-break"></div>

        <h1>PARTE II: Mapeo Integral del Documento 2 (Manual de Funcionamiento y SOPs)</h1>

        <h2>2.1 Auditoría del Dashboard de Referencia y Tratamiento de Datos DEMO</h2>
        <p>El Documento 2 desglosa la captura visual oficial del sistema y establece una advertencia categórica para el equipo de desarrollo: <strong>los valores exhibidos en el diseño (ingresos por $342,150, precisión del 99.8%, 24,593 estudiantes) son elementos ficticios de referencia gráfica</strong>. Durante la fase de construcción, toda métrica debe estar rotulada con la etiqueta <code>DEMO</code> hasta que provenga de una base de datos institucional autorizada.</p>

        <table>
            <thead>
                <tr>
                    <th>Zona del Dashboard</th>
                    <th>Significado Operativo</th>
                    <th>Fuente de Datos Productiva Exigida</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Barra de Navegación Lateral</strong></td>
                    <td>Ruteo protegido por permisos</td>
                    <td>Contexto de seguridad decodificado del JWT en sesión.</td>
                </tr>
                <tr>
                    <td><strong>Tarjetas de KPIs Superiores</strong></td>
                    <td>Actividad, estudiantes activos, certificados</td>
                    <td>Vistas materializadas en PostgreSQL actualizadas por eventos.</td>
                </tr>
                <tr>
                    <td><strong>Gráfico de Ingresos vs Progreso</strong></td>
                    <td>Tendencia financiera o académica</td>
                    <td>Solo mostrar ingresos si existe e-commerce; si no, sustituir por horas efectivas.</td>
                </tr>
                <tr>
                    <td><strong>Visualizador Neuronal Animado</strong></td>
                    <td>Inspección de topología y estado de ML</td>
                    <td>Metadatos del Model Registry y telemetría de inferencia vía WebSocket.</td>
                </tr>
                <tr>
                    <td><strong>Heatmap de Habilidades</strong></td>
                    <td>Dominio de competencias por nivel</td>
                    <td>Separación estricta entre nota docente y score estimado por IA.</td>
                </tr>
                <tr>
                    <td><strong>Feed de Actividad Reciente</strong></td>
                    <td>Eventos en vivo del campus</td>
                    <td>Canal SSE/WebSocket filtrado estrictamente por organización y rol.</td>
                </tr>
            </tbody>
        </table>

        <h2>2.2 Flujos Integrales de Negocio End-to-End (E2E)</h2>
        <ol>
            <li><strong>Ciclo de Matrícula y Aprendizaje (SOP 7–13):</strong> Alta de cohorte $\rightarrow$ asignación de ruta curricular $\rightarrow$ consumo de lección $\rightarrow$ emisión del evento <code>learning.progress.updated</code> $\rightarrow$ actualización reactiva del dashboard del estudiante.</li>
            <li><strong>Ciclo de Evaluación y Calificación (SOP 14–19):</strong> Publicación de rúbrica $\rightarrow$ entrega de evidencia por el alumno $\rightarrow$ validación de vigencia $\rightarrow$ cálculo de nota oficial por docente $\rightarrow$ persistencia separada de la estimación algorítmica.</li>
            <li><strong>Ciclo de Recomendación Adaptativa (SOP 20–25):</strong> Extracción de características $\rightarrow$ inferencia en PyTorch $\rightarrow$ aplicación de filtros de catálogo y prerrequisitos $\rightarrow$ presentación al usuario con justificación pedagógica $\rightarrow$ registro de retroalimentación (útil / no útil).</li>
            <li><strong>Ciclo de Emisión de Certificados (SOP 26–30):</strong> Verificación de requisitos de egreso $\rightarrow$ comprobación de duplicados $\rightarrow$ estampado de folio único y código QR $\rightarrow$ renderizado PDF $\rightarrow$ verificación pública en portal seguro.</li>
        </ol>

        <h2>2.3 Procedimientos Operativos Estandarizados (SOPs) por Rol</h2>
        <ul>
            <li><strong>Administrador Institucional (SOP 59–64):</strong> Configuración de catálogos, asignación de docentes, validación de accesibilidad y publicación de ofertas académicas.</li>
            <li><strong>Coordinador de Carrera (SOP 65–69):</strong> Estructuración de árboles de competencias, ordenamiento de prerrequisitos y seguimiento de cohortes.</li>
            <li><strong>Docente / Instructor (SOP 70–75):</strong> Definición de ponderaciones, corrección de evaluaciones con rúbricas y validación manual de evidencias de competencias.</li>
            <li><strong>Estudiante (SOP 76–81):</strong> Navegación por la ruta de aprendizaje, realización de exámenes interactivos y revisión de recomendaciones adaptativas.</li>
            <li><strong>Analista de Datos (SOP 82–87):</strong> Extracción de fuentes autorizadas, seudonimización de identidad, verificación de completitud y versionado de datasets con DVC.</li>
            <li><strong>ML Engineer (SOP 88–94):</strong> Ejecución de baselines, entrenamiento asíncrono con Celery, logging en MLflow, evaluación de equidad y pruebas en shadow inference.</li>
        </ul>

        <div class="page-break"></div>

        <h2>2.4 Protocolo de Actualización en Tiempo Real y Máquina de Estados del Grafo Neuronal</h2>
        <p>El flujo de tiempo real sigue una secuencia determinista en 6 etapas (SOP 52–58) que sincroniza la base de datos con la interfaz:</p>

        <div class="diagram-box">
                      CICLO DE ACTUALIZACIÓN EN TIEMPO REAL (6 TIEMPOS)
                      
   1. Acción Académica ──► 2. API Endpoint ──► 3. Transacción BD + Outbox
   (Entrega de tarea)      (FastAPI valida)     (Commit relacional atómico)
                                                           │
   6. UI en Vivo      ◄── 5. Canal SSE/WS  ◄── 4. Worker de Eventos
   (Refresco granular)     (Filtro Tenant)      (Redis Streams publica)
        </div>

        <p>Asimismo, el <strong>Visualizador Neuronal</strong> opera bajo una máquina de estados finita estricta para garantizar la veracidad de la información visual:</p>
        <ul>
            <li><strong>Detenido:</strong> Topología visible en reposo, sin pulsos de actividad; indica la fecha y hora de la última ejecución.</li>
            <li><strong>Cargando Datos:</strong> Spinner técnico que identifica el dataset y la versión en lectura.</li>
            <li><strong>Entrenando:</strong> Animación bidireccional (propagación y retropropagación), métricas de pérdida (<em>loss</em>) y reporte de época en vivo.</li>
            <li><strong>Validando:</strong> Cálculo de métricas sobre el conjunto de test sin pulsos en los enlaces neuronales.</li>
            <li><strong>Publicado:</strong> Estado de régimen permanente con versión activa identificada en el Model Registry.</li>
            <li><strong>Inferencia Activa:</strong> Pulso hacia adelante (izquierda a derecha) detonado por una solicitud real de recomendación.</li>
            <li><strong>Error:</strong> Resaltado de advertencia con <code>correlation_id</code> y enlace al log centralizado.</li>
        </ul>

        <h2>2.5 Metodología de Trabajo, Criterios de Aceptación y Despliegue</h2>
        <ul>
            <li><strong>Cadencia de Trabajo:</strong> Scrum en sprints de dos semanas, integrado con prácticas continuas de DataOps y MLOps.</li>
            <li><strong>Definition of Ready (DoR):</strong> Historias con objetivo definido, criterios de aceptación verificables, contrato OpenAPI y análisis de impacto en privacidad.</li>
            <li><strong>Definition of Done (DoD):</strong> Código con TypeScript estricto, pruebas unitarias y E2E aprobadas, validación de autorización en backend, registros de auditoría y artefactos de ML versionados con Model Card.</li>
            <li><strong>Estrategia de Despliegue y Recuperación:</strong> Despliegue secuencial sin tiempo de inactividad (Base de datos $\rightarrow$ API $\rightarrow$ Frontend), canary release para modelos de inferencia, y objetivos de continuidad:
                $$\text{RPO} \le 24 \text{ horas} \quad \text{y} \quad \text{RTO} \le 4 \text{ horas}$$
            </li>
        </ul>

        <div class="page-break"></div>

        <h1>PARTE III: Evaluación Crítica, Riesgos Fatales y Hoja de Ruta Estratégica</h1>

        <h2>3.1 Análisis Forense de Riesgos Fatales en un Entorno Profesional</h2>
        <p>Un análisis profesional exige evaluar las condiciones de contorno bajo las cuales el proyecto podría fracasar si se ignoran las especificaciones técnicas:</p>

        <div class="alert alert-danger">
            <div class="alert-title">Riesgo Fatal 1: Fuga de Aislamiento Multi-Tenant y Responsabilidad Penal/Legal</div>
            Si el aislamiento de datos descansa únicamente en filtros de la interfaz o parámetros enviados por el cliente, una inyección o un error de consulta expondrá datos académicos de una institución a otra. Bajo la Ley N.° 29733 de Perú y estándares internacionales, la exposición de registros de calificaciones o datos de menores acarrea sanciones administrativas multimillonarias, pérdida de licencias institucionales y responsabilidad civil y penal para los directivos.
            <br><strong>Mitigación Ineludible:</strong> Implementar Row Level Security (RLS) en PostgreSQL y pruebas automatizadas de penetración multi-tenant en el pipeline de CI/CD.
        </div>

        <div class="alert alert-danger">
            <div class="alert-title">Riesgo Fatal 2: Falacia de Rendimiento Predictivo por Data Leakage Temporal</div>
            El error más recurrente en machine learning educativo es entrenar modelos con división aleatoria simple. Esto contamina el entrenamiento con información futura del estudiante, haciendo que el modelo memorice trayectorias en lugar de predecir. En producción, la red neuronal generará alertas falsas de deserción o recomendaciones erráticas, destruyendo la confianza de docentes y directivos.
            <br><strong>Mitigación Ineludible:</strong> Validación temporal estricta y obligación de superar baselines tradicionales simples antes de autorizar el despliegue de PyTorch.
        </div>

        <div class="alert alert-warning">
            <div class="alert-title">Riesgo Fatal 3: Colapso del Frontend por Saturación del Event Loop</div>
            Acoplar el renderizado de gráficos SVG de alta densidad o la red neuronal animada al árbol de componentes de React ocasionará caídas severas de cuadros por segundo ($< 15\text{ FPS}$) ante ráfagas de eventos por WebSocket. La experiencia de usuario se tornará inoperable.
            <br><strong>Mitigación Ineludible:</strong> Componentes de visualización aislados en Canvas o WebGL con ciclo de vida independiente mediante <code>requestAnimationFrame</code>.
        </div>

        <h2>3.2 Decisiones Estratégicas Ineludibles para el Product Owner</h2>
        <p>Para evitar retrasos y sobrecostes, la dirección del proyecto debe definir de inmediato:</p>
        <ol>
            <li><strong>Multi-Tenancy desde el Día Cero:</strong> Se debe confirmar la arquitectura multi-institución desde la concepción del esquema relacional, independientemente de que el primer piloto se realice con un único cliente.</li>
            <li><strong>Naturaleza del Dashboard:</strong> Reemplazar la métrica comercial de "Ingresos" por indicadores académicos reales si la plataforma operará bajo un modelo B2B o institucional cerrado.</li>
            <li><strong>Origen del Dataset Inicial:</strong> Aprobar formalmente el generador estadístico de datos sintéticos rotulados <code>DEMO</code> para las etapas de desarrollo y pruebas de carga hasta obtener convenios de datos reales.</li>
        </ol>

        <h2>3.3 Hoja de Ruta Técnica y Orden de Precedencia (Ruta Crítica)</h2>

        <table>
            <thead>
                <tr>
                    <th>Fase de Construcción</th>
                    <th>Duración Est.</th>
                    <th>Entregables Mandatorios y Puertas de Calidad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Fase 0: Descubrimiento y Gobernanza</strong></td>
                    <td>1–2 semanas</td>
                    <td>Backlog refinado, glosario de métricas y marco legal de privacidad aprobado.</td>
                </tr>
                <tr>
                    <td><strong>Fase 1: Fundaciones y Seguridad</strong></td>
                    <td>2 semanas</td>
                    <td>Monorepo configurado, pipeline CI/CD, esquemas RBAC/ABAC y RLS en PostgreSQL.</td>
                </tr>
                <tr>
                    <td><strong>Fase 2: Core Académico Transaccional</strong></td>
                    <td>3–5 semanas</td>
                    <td>Gestión de cursos, rutas, evaluaciones, calificaciones y motor de eventos.</td>
                </tr>
                <tr>
                    <td><strong>Fase 3: Dashboard y Tiempo Real</strong></td>
                    <td>2–3 semanas</td>
                    <td>WebSocket/SSE operativo, visualizador neuronal aislado y widgets analíticos.</td>
                </tr>
                <tr>
                    <td><strong>Fase 4: DataOps y Baselines</strong></td>
                    <td>2–4 semanas</td>
                    <td>Pipeline ETL, DVC, seudonimización y modelos de referencia interpretables.</td>
                </tr>
                <tr>
                    <td><strong>Fase 5: Red Neuronal Multi-Task</strong></td>
                    <td>3–5 semanas</td>
                    <td>Modelo PyTorch entrenado, calibrado, registrado en MLflow y auditado.</td>
                </tr>
                <tr>
                    <td><strong>Fase 6: Inferencia y Guardrails</strong></td>
                    <td>2–3 semanas</td>
                    <td>Servicio de predicción desacoplado, explicabilidad y supervisión docente.</td>
                </tr>
                <tr>
                    <td><strong>Fase 7: Hardening y Producción</strong></td>
                    <td>2–3 semanas</td>
                    <td>Pruebas de carga, auditoría OWASP, simulacros de recuperación y despliegue final.</td>
                </tr>
            </tbody>
        </table>

        <h2>3.4 Veredicto Final de Arquitectura</h2>
        <p>Los dos documentos analizados presentan una consistencia técnica y una madurez de ingeniería sobresalientes. La documentación no comete la ingenuidad de prometer magia algorítmica: establece con meridiana claridad que la <strong>Inteligencia Artificial es un sistema probabilístico subordinado al criterio del educador humano</strong>, sustentado sobre una arquitectura transaccional sólida, contratos de integración limpios y gobernanza de datos estricta.</p>
        
        <p>El éxito del proyecto radicará en ejecutar rigurosamente los procedimientos estandarizados (SOPs) del Documento 2 respetando las fronteras arquitectónicas del Documento 1. La disciplina en el cumplimiento de estas especificaciones garantizará que EduMaster.ai se posicione como una plataforma de clase mundial, robusta, escalable y éticamente intachable.</p>

        <!-- TABLA DE FIRMAS DE APROBACIÓN -->
        <table class="signature-table">
            <tr>
                <td>
                    <div class="signature-line">
                        Arquitecto Principal de Soluciones<br>
                        Líder de Infraestructura y Seguridad
                    </div>
                </td>
                <td>
                    <div class="signature-line">
                        Staff Machine Learning Engineer<br>
                        Líder de DataOps y MLOps
                    </div>
                </td>
                <td>
                    <div class="signature-line">
                        Product Owner & Sponsor Ejecutivo<br>
                        Dirección del Proyecto EduMaster.ai
                    </div>
                </td>
            </tr>
        </table>

    </div>

</body>
</html>
"""

html_path = os.path.abspath("EduMaster_AI_Informe_Ejecutivo.html")
pdf_path = os.path.abspath("EduMaster_AI_Informe_Ejecutivo.pdf")

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
