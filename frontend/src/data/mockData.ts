import { 
  UserProfile, 
  MetricCardData, 
  SkillCategory, 
  Recommendation, 
  ActivityEvent, 
  RegionProgress,
  NeuralNode,
  StudentTask,
  PendingSubmission,
  AtRiskStudent,
  AuditLogEntry,
  ArcoRequest
} from '../types';

export const currentUser: UserProfile = {
  id: 'usr-admin-01',
  name: 'Dra. López',
  title: 'Administrador Principal',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  organization: 'Universidad Tecnológica Enterprise',
  onlineCount: 1248,
};

export const metricCards: MetricCardData[] = [
  {
    title: 'Alumnos',
    value: '24,593',
    change: '+12.5%',
    isPositive: true,
    subtext: 'vs mes anterior',
    iconName: 'Users'
  },
  {
    title: 'Cursos',
    value: '1,248',
    change: '+14.2%',
    isPositive: true,
    subtext: 'en catálogo oficial',
    iconName: 'BookOpen'
  },
  {
    title: 'Horas de Aprendizaje',
    value: '89,450',
    change: '+23.7%',
    isPositive: true,
    subtext: 'acumulado mensual',
    iconName: 'Clock'
  },
  {
    title: 'Certificaciones',
    value: '5,782',
    change: '+8.5%',
    isPositive: true,
    subtext: 'con verificación QR',
    iconName: 'Award'
  }
];

export const revenueChartData = {
  total: '$342,150',
  change: '+12.5% vs. mes anterior',
  series: [
    { label: 'Suscripciones', amount: '$342,150', color: '#087FE5' },
    { label: 'Cursos', amount: '$98,150', color: '#8B4DFF' },
    { label: 'Otros Ingresos', amount: '$24,000', color: '#00BFA6' }
  ],
  months: [
    { month: 'Ene', subscriptions: 180, courses: 45, others: 12 },
    { month: 'Feb', subscriptions: 210, courses: 55, others: 14 },
    { month: 'Mar', subscriptions: 230, courses: 62, others: 15 },
    { month: 'Abr', subscriptions: 260, courses: 70, others: 18 },
    { month: 'May', subscriptions: 285, courses: 78, others: 19 },
    { month: 'Jun', subscriptions: 295, courses: 82, others: 20 },
    { month: 'Jul', subscriptions: 310, courses: 86, others: 22 },
    { month: 'Ago', subscriptions: 318, courses: 89, others: 22 },
    { month: 'Sep', subscriptions: 325, courses: 92, others: 23 },
    { month: 'Oct', subscriptions: 332, courses: 95, others: 23 },
    { month: 'Nov', subscriptions: 342, courses: 98, others: 24 },
    { month: 'Dic', subscriptions: 360, courses: 105, others: 26 }
  ]
};

export const regionsData: RegionProgress[] = [
  { region: 'América del Norte', students: 8450, change: '+12.5%', color: '#20C8F5' },
  { region: 'Europa', students: 6120, change: '+8.9%', color: '#087FE5' },
  { region: 'Asia', students: 7890, change: '+11.3%', color: '#8B4DFF' },
  { region: 'América del Sur', students: 2980, change: '+6.7%', color: '#00BFA6' },
  { region: 'África', students: 1820, change: '+5.1%', color: '#F59E0B' },
  { region: 'Oceanía', students: 1760, change: '+4.8%', color: '#EC4899' }
];

export const completionStats = {
  rate: 78,
  change: '+12.5%',
  slices: [
    { label: 'Completados', percent: 78, color: '#00BFA6' },
    { label: 'En Progreso', percent: 15, color: '#087FE5' },
    { label: 'No Iniciados', percent: 7, color: '#EF4444' }
  ]
};

export const skillMasteryData: SkillCategory[] = [
  {
    id: 'ai',
    name: 'Inteligencia Artificial',
    certifiedByDocent: true,
    levels: { aprender: 98, practicar: 85, aplicar: 72, avanzado: 54, experto: 28 }
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    certifiedByDocent: true,
    levels: { aprender: 92, practicar: 88, aplicar: 68, avanzado: 46, experto: 22 }
  },
  {
    id: 'ds',
    name: 'Ciencia de Datos',
    certifiedByDocent: false,
    levels: { aprender: 86, practicar: 76, aplicar: 62, avanzado: 38, experto: 15 }
  },
  {
    id: 'web',
    name: 'Desarrollo Web',
    certifiedByDocent: true,
    levels: { aprender: 99, practicar: 94, aplicar: 87, avanzado: 72, experto: 48 }
  },
  {
    id: 'cloud',
    name: 'Nube y DevOps',
    certifiedByDocent: false,
    levels: { aprender: 82, practicar: 68, aplicar: 52, avanzado: 34, experto: 12 }
  }
];

export const initialRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    prefix: 'Repasa',
    title: 'Inteligencia Artificial Avanzada',
    course: 'Transformers & LLM Architecture v2',
    difficulty: 'Avanzado',
    rationale: 'Brecha detectada en mecanismos de auto-atención multi-cabeza (score 54%).',
    confidence: 0.94,
    status: 'nueva'
  },
  {
    id: 'rec-2',
    prefix: 'Completa',
    title: 'Machine Learning Básico',
    course: 'Fundamentos de Regresión y Clasificación',
    difficulty: 'Básico',
    rationale: 'Falta entrega de actividad práctica evaluada para certificación oficial.',
    confidence: 0.98,
    status: 'nueva'
  },
  {
    id: 'rec-3',
    prefix: 'Sigue',
    title: 'Ruta de Ciencia de Datos',
    course: 'Data Science & Feature Engineering Pipeline',
    difficulty: 'Intermedio',
    rationale: 'Continuidad recomendada tras aprobar Análisis Exploratorio con 96%.',
    confidence: 0.89,
    status: 'nueva'
  },
  {
    id: 'rec-4',
    prefix: 'Realiza',
    title: 'Proyecto Final de Python',
    course: 'FastAPI Microservices & Clean Architecture',
    difficulty: 'Avanzado',
    rationale: 'Permitirá desbloquear la insignia de Dominio Experto en Backend.',
    confidence: 0.91,
    status: 'nueva'
  },
  {
    id: 'rec-5',
    prefix: 'Explora',
    title: 'Nuevos Cursos en IA',
    course: 'Visión Computacional & Diffusion Models',
    difficulty: 'Intermedio',
    rationale: 'Alta afinidad con tus intereses y habilidades dominadas de Álgebra Lineal.',
    confidence: 0.87,
    status: 'nueva'
  }
];

export const recentActivities: ActivityEvent[] = [
  {
    id: 'act-1',
    icon: 'check',
    title: 'Curso de Python completado',
    description: 'Estudiante Sofia Ramírez finalizó con nota 19.5/20',
    timeAgo: 'Hace 2 h',
    user: 'Sofia R.',
    status: 'success'
  },
  {
    id: 'act-2',
    icon: 'award',
    title: 'Certificado emitido correctamente',
    description: 'Folio EDU-2026-98124 firmado con código QR',
    timeAgo: 'Hace 3 h',
    user: 'Carlos M.',
    status: 'success'
  },
  {
    id: 'act-3',
    icon: 'play',
    title: 'Nuevo curso iniciado',
    description: 'Cohorte 2026-II comenzó módulo de Deep Learning',
    timeAgo: 'Hace 5 h',
    user: 'Cohorte DL',
    status: 'info'
  },
  {
    id: 'act-4',
    icon: 'book',
    title: 'Examen de Machine Learning aprobado',
    description: '142 alumnos registraron intento con rúbrica oficial',
    timeAgo: 'Hace 1 día',
    user: 'Grupo A',
    status: 'success'
  },
  {
    id: 'act-5',
    icon: 'target',
    title: 'Meta de aprendizaje alcanzada (90%)',
    description: 'Objetivo de retención mensual cumplido por la facultad',
    timeAgo: 'Hace 1 día',
    user: 'Facultad Ing.',
    status: 'warning'
  }
];

export const neuralLayersNodes: Record<string, NeuralNode[]> = {
  input: [
    { id: 'in-1', name: 'Uso de la Plataforma', layer: 'input', value: 0.88, activation: 'Linear', shape: '(B, 14)', description: 'Frecuencia de sesiones y días de uso en ventana 14d.' },
    { id: 'in-2', name: 'Rendimiento', layer: 'input', value: 0.94, activation: 'MinMax', shape: '(B, 1)', description: 'Promedio normalizado de evaluaciones sumativas.' },
    { id: 'in-3', name: 'Participación', layer: 'input', value: 0.76, activation: 'Linear', shape: '(B, 8)', description: 'Aportes a foros, debates y feedback de compañeros.' },
    { id: 'in-4', name: 'Interacciones', layer: 'input', value: 0.82, activation: 'LogScale', shape: '(B, 1)', description: 'Eventos de click y reproducción de video con foco.' },
    { id: 'in-5', name: 'Asistencias', layer: 'input', value: 0.96, activation: 'Percent', shape: '(B, 1)', description: 'Asistencia sincrónica y entregas dentro de plazo.' },
    { id: 'in-6', name: 'Comentarios', layer: 'input', value: 0.65, activation: 'NLP-Emb', shape: '(B, 64)', description: 'Vector de sentimiento y claridad en retroalimentación.' }
  ],
  embedding: [
    { id: 'emb-1', name: 'Estudiante Latente e_1', layer: 'embedding', value: 0.84, activation: 'LayerNorm', shape: '(B, 128)', description: 'Representación densa del perfil académico.' },
    { id: 'emb-2', name: 'Estudiante Latente e_2', layer: 'embedding', value: 0.72, activation: 'LayerNorm', shape: '(B, 128)', description: 'Vector de estilo de aprendizaje y ritmo.' },
    { id: 'emb-3', name: 'Estudiante Latente e_3', layer: 'embedding', value: 0.91, activation: 'LayerNorm', shape: '(B, 128)', description: 'Resiliencia ante evaluaciones complejas.' },
    { id: 'emb-4', name: 'Estudiante Latente e_4', layer: 'embedding', value: 0.63, activation: 'LayerNorm', shape: '(B, 128)', description: 'Consistencia temporal entre semanas lectivas.' },
    { id: 'emb-5', name: 'Estudiante Latente e_5', layer: 'embedding', value: 0.79, activation: 'LayerNorm', shape: '(B, 128)', description: 'Interés temático afín a programación.' },
    { id: 'emb-6', name: 'Estudiante Latente e_6', layer: 'embedding', value: 0.88, activation: 'LayerNorm', shape: '(B, 128)', description: 'Interés temático afín a matemática y datos.' }
  ],
  analysis: [
    { id: 'an-1', name: 'GRU Celda Oculta h_1', layer: 'analysis', value: 0.78, activation: 'Tanh', shape: '(B, 256)', description: 'Memoria de trayectoria y aceleración del aprendizaje.' },
    { id: 'an-2', name: 'GRU Celda Oculta h_2', layer: 'analysis', value: 0.85, activation: 'Tanh', shape: '(B, 256)', description: 'Detección de patrones de estancamiento temporal.' },
    { id: 'an-3', name: 'GRU Celda Oculta h_3', layer: 'analysis', value: 0.92, activation: 'Tanh', shape: '(B, 256)', description: 'Interacción recurrente y recuperación de lagunas.' },
    { id: 'an-4', name: 'GRU Celda Oculta h_4', layer: 'analysis', value: 0.69, activation: 'Tanh', shape: '(B, 256)', description: 'Sensibilidad a variaciones en dificultad de exámenes.' },
    { id: 'an-5', name: 'GRU Celda Oculta h_5', layer: 'analysis', value: 0.81, activation: 'Tanh', shape: '(B, 256)', description: 'Estimador acumulativo de persistencia.' },
    { id: 'an-6', name: 'GRU Celda Oculta h_6', layer: 'analysis', value: 0.87, activation: 'Tanh', shape: '(B, 256)', description: 'Fusión no-lineal con tasa Dropout de 0.25.' }
  ],
  output: [
    { id: 'out-1', name: 'Recomendaciones', layer: 'output', value: 0.94, activation: 'Softmax/TopK', shape: '(B, 5)', description: 'Cabecera D: Top-K recursos priorizados pedagógicamente.' },
    { id: 'out-2', name: 'Rutas de Aprendizaje', layer: 'output', value: 0.88, activation: 'Sigmoid', shape: '(B, 12)', description: 'Optimización de caminos de avance curricular.' },
    { id: 'out-3', name: 'Alertas Inteligentes', layer: 'output', value: 0.12, activation: 'Sigmoid (Calibrado)', shape: '(B, 1)', description: 'Cabecera C: Alerta de riesgo de deserción o abandono.' },
    { id: 'out-4', name: 'Predicciones', layer: 'output', value: 0.91, activation: 'BCE Calibrado', shape: '(B, 1)', description: 'Cabecera A: Probabilidad estimada de finalización a 30d.' },
    { id: 'out-5', name: 'Rendimiento', layer: 'output', value: 0.89, activation: 'Ordinal Reg', shape: '(B, 5)', description: 'Cabecera B: Estimación de dominio competencial.' },
    { id: 'out-6', name: 'Certificaciones', layer: 'output', value: 0.96, activation: 'Threshold', shape: '(B, 1)', description: 'Cumplimiento oficial de rúbricas para folio y QR.' }
  ]
};

export const studentTasks: StudentTask[] = [
  {
    id: 'st-1',
    title: 'Laboratorio 3: Backpropagation y Descenso de Gradiente en PyTorch',
    course: 'DL-401: Arquitectura de Redes Neuronales',
    dueDate: 'Hoy, 23:59',
    urgency: 'urgent',
    weight: '25%',
    points: 20,
    status: 'pending'
  },
  {
    id: 'st-2',
    title: 'Proyecto Parcial: Pipeline de Limpieza y Split Temporal con DVC',
    course: 'OPS-301: MLOps Enterprise',
    dueDate: 'En 3 días',
    urgency: 'upcoming',
    weight: '35%',
    points: 20,
    status: 'pending'
  },
  {
    id: 'st-3',
    title: 'Cuestionario de Auto-Atención y Complejidad O(N²)',
    course: 'DL-401: Arquitectura de Redes Neuronales',
    dueDate: '28 Nov 2026',
    urgency: 'upcoming',
    weight: '15%',
    points: 20,
    status: 'pending'
  },
  {
    id: 'st-4',
    title: 'Evaluación Formativa: Regresión Logística y Brier Score Calibration',
    course: 'ML-201: Machine Learning Baselines',
    dueDate: '12 Nov 2026',
    urgency: 'completed',
    weight: '15%',
    points: 20,
    status: 'graded',
    grade: 19.2
  }
];

export const pendingSubmissions: PendingSubmission[] = [
  {
    id: 'sub-101',
    studentId: 'std-204',
    studentName: 'Sofia Ramírez Vargas',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    course: 'DL-401: Redes Neuronales',
    assignmentTitle: 'Implementación de Atención Cruzada Multi-Cabeza',
    submittedAt: 'Hace 45 min',
    estimatedAiScore: 18.5,
    status: 'pending',
    codeSnippet: `import torch\nimport torch.nn as nn\n\nclass CrossAttention(nn.Module):\n    def __init__(self, d_model=256, n_heads=8):\n        super().__init__()\n        self.d_model = d_model\n        self.n_heads = n_heads\n        self.head_dim = d_model // n_heads\n        self.q_proj = nn.Linear(d_model, d_model)\n        self.k_proj = nn.Linear(d_model, d_model)\n        self.v_proj = nn.Linear(d_model, d_model)\n        self.out_proj = nn.Linear(d_model, d_model)\n\n    def forward(self, q, kv, mask=None):\n        B, L, _ = q.shape\n        Q = self.q_proj(q).view(B, L, self.n_heads, self.head_dim).transpose(1, 2)\n        # Proyecciones K y V correctamente normalizadas\n        K = self.k_proj(kv).view(B, -1, self.n_heads, self.head_dim).transpose(1, 2)\n        V = self.v_proj(kv).view(B, -1, self.n_heads, self.head_dim).transpose(1, 2)\n        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)\n        if mask is not None:\n            scores = scores.masked_fill(mask == 0, -1e9)\n        attn = torch.softmax(scores, dim=-1)\n        return self.out_proj(torch.matmul(attn, V).transpose(1, 2).reshape(B, L, self.d_model))`,
    rubricScores: [
      { criteria: 'Correctitud Matemática del Escalado (1/√d_k)', maxPts: 5, score: 5 },
      { criteria: 'Manejo de Tensores y Shapes Multidimensionales', maxPts: 5, score: 5 },
      { criteria: 'Eficiencia Computacional y Ausencia de Bucles Python', maxPts: 5, score: 4.5 },
      { criteria: 'Claridad de Código y Tipado PEP 484', maxPts: 5, score: 4 }
    ],
    feedback: 'Excelente estructura tensorial. Considera añadir dropout residual tras la proyección final para evitar sobreajuste en secuencias largas.'
  },
  {
    id: 'sub-102',
    studentId: 'std-205',
    studentName: 'Mateo Vargas Quispe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    course: 'OPS-301: MLOps Enterprise',
    assignmentTitle: 'Pipeline de Ingesta DVC y Versionado de Dataset',
    submittedAt: 'Hace 2 horas',
    estimatedAiScore: 16.0,
    status: 'pending',
    codeSnippet: `stages:\n  prepare:\n    cmd: python src/prepare_data.py --split-temporal\n    deps:\n      - data/raw_events.csv\n      - src/prepare_data.py\n    outs:\n      - data/processed/train.parquet\n      - data/processed/val.parquet\n      - data/processed/test.parquet`,
    rubricScores: [
      { criteria: 'Definición Declarativa de Etapas dvc.yaml', maxPts: 5, score: 4.5 },
      { criteria: 'Garantía de Split Temporal sin Fuga de Datos', maxPts: 5, score: 4 },
      { criteria: 'Manejo de Parquet y Tipos Optimizados', maxPts: 5, score: 4 },
      { criteria: 'Documentación y Reproducibilidad', maxPts: 5, score: 3.5 }
    ],
    feedback: 'Buen pipeline. Asegúrate de añadir los hashes md5 en el lockfile para garantizar reproducibilidad en Staging.'
  },
  {
    id: 'sub-103',
    studentId: 'std-208',
    studentName: 'Lucía Fernández Morales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    course: 'SEC-501: Privacidad Ley 29733',
    assignmentTitle: 'Protocolo de Seudonimización con SHA-256 Salted',
    submittedAt: 'Hace 4 horas',
    estimatedAiScore: 19.0,
    status: 'pending',
    codeSnippet: `import hmac\nimport hashlib\n\ndef pseudonymize_student_id(national_id: str, secret_salt: bytes) -> str:\n    """Cumplimiento Ley 29733 Art. 2: Disociación de Identidad."""\n    return hmac.new(secret_salt, national_id.encode('utf-8'), hashlib.sha256).hexdigest()`,
    rubricScores: [
      { criteria: 'Cumplimiento Legal Ley 29733 (No Reversibilidad)', maxPts: 5, score: 5 },
      { criteria: 'Uso de Criptografía Robusta (HMAC-SHA256)', maxPts: 5, score: 5 },
      { criteria: 'Gestión Segura del Salt Secreto', maxPts: 5, score: 4.5 },
      { criteria: 'Pruebas Unitarias de Colisión', maxPts: 5, score: 4.5 }
    ],
    feedback: 'Implementación impecable con apego a los estándares del Ministerio de Justicia y DDHH.'
  }
];

export const atRiskStudents: AtRiskStudent[] = [
  {
    id: 'risk-1',
    name: 'Jorge Luis Huamán',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    course: 'DL-401: Redes Neuronales',
    riskScore: 88,
    daysInactive: 9,
    missingAssignments: 3,
    lastActive: 'Hace 9 días',
    suggestedAction: 'Programar sesión de mentoría síncrona de 15 min.',
    status: 'critical'
  },
  {
    id: 'risk-2',
    name: 'Andrea Celeste Torres',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    course: 'OPS-301: MLOps Enterprise',
    riskScore: 74,
    daysInactive: 6,
    missingAssignments: 2,
    lastActive: 'Hace 6 días',
    suggestedAction: 'Enviar recordatorio con enlace a grabación de repaso.',
    status: 'warning'
  },
  {
    id: 'risk-3',
    name: 'Renato Castillo Peña',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    course: 'ML-201: Machine Learning Baselines',
    riskScore: 68,
    daysInactive: 5,
    missingAssignments: 1,
    lastActive: 'Hace 5 días',
    suggestedAction: 'Habilitar prórroga controlada de 48h con rúbrica penalizada.',
    status: 'warning'
  }
];

export const auditLogEntries: AuditLogEntry[] = [
  {
    id: 'aud-901',
    timestamp: '2026-11-21 11:42:09 UTC',
    actor: 'Dr. Alejandro Morales',
    role: 'Docente Titular',
    action: 'GRADE_OVERRIDE_OFFICIAL',
    target: 'Evaluación Lab-3 • Estudiante std-204 (18.5/20)',
    ipAddress: '190.236.44.12',
    status: 'success',
    correlationId: 'tx-8fa29c41'
  },
  {
    id: 'aud-902',
    timestamp: '2026-11-21 11:15:33 UTC',
    actor: 'Dra. López',
    role: 'Superadmin',
    action: 'MODEL_PROMOTED_TO_PRODUCTION',
    target: 'PyTorch MTL v2.4 (PR-AUC 0.914 > Baseline 0.865)',
    ipAddress: '190.236.44.10',
    status: 'success',
    correlationId: 'tx-3be178a9'
  },
  {
    id: 'aud-903',
    timestamp: '2026-11-21 10:50:11 UTC',
    actor: 'Ing. Carlos Mendoza',
    role: 'ML Engineer',
    action: 'DATASET_EXPORT_PSEUDONYMIZED',
    target: 'Cohorte 2026-II • 12,450 registros disociados',
    ipAddress: '200.48.91.5',
    status: 'flagged',
    correlationId: 'tx-12ef54c8'
  },
  {
    id: 'aud-904',
    timestamp: '2026-11-21 09:30:20 UTC',
    actor: 'Sistema Automatizado Celery',
    role: 'System Worker',
    action: 'CERTIFICATE_GENERATED_QR',
    target: 'Folio EDU-2026-98126 • Hash SHA-256 verificado',
    ipAddress: '10.0.4.15',
    status: 'success',
    correlationId: 'tx-77ad0092'
  },
  {
    id: 'aud-905',
    timestamp: '2026-11-21 08:12:44 UTC',
    actor: 'IP No Autorizada',
    role: 'Externo Anónimo',
    action: 'AUTH_FAILED_RATE_LIMIT',
    target: 'Intento de fuerza bruta en /api/v1/auth/login',
    ipAddress: '45.142.214.88',
    status: 'denied',
    correlationId: 'tx-00fc48e1'
  }
];

export const arcoRequests: ArcoRequest[] = [
  {
    id: 'arc-01',
    folio: 'ARCO-2026-0042',
    applicant: 'Elena Ramos Valdivia',
    type: 'Cancelación',
    status: 'En Proceso',
    submittedDate: '18 Nov 2026',
    deadline: '28 Nov 2026 (10 días hábiles)',
    legalRepresentative: 'Abg. Roberto Castillo (DPO Institucional)'
  },
  {
    id: 'arc-02',
    folio: 'ARCO-2026-0041',
    applicant: 'David Gonzalo Pineda',
    type: 'Rectificación',
    status: 'Atendida',
    submittedDate: '10 Nov 2026',
    deadline: '20 Nov 2026',
    legalRepresentative: 'Dra. López (Secretaría Académica)'
  },
  {
    id: 'arc-03',
    folio: 'ARCO-2026-0040',
    applicant: 'Valeria Solís Miranda',
    type: 'Acceso',
    status: 'Atendida',
    submittedDate: '04 Nov 2026',
    deadline: '14 Nov 2026',
    legalRepresentative: 'Abg. Roberto Castillo (DPO Institucional)'
  }
];

export const mlopsTelemetry = {
  inferenceLatencyP95: '18.4 ms',
  inferenceLatencyP99: '24.1 ms',
  activeModelVersion: 'edumaster-mtl-v2.4-prod',
  modelAccuracyPR: '0.914 PR-AUC',
  baselineAdvantage: '+4.9% vs LightGBM',
  celeryQueues: {
    inference: { length: 3, workers: 8, status: 'healthy' },
    training: { length: 0, workers: 2, status: 'idle' },
    reports: { length: 1, workers: 4, status: 'healthy' }
  },
  redisStreams: {
    status: 'online',
    throughput: '4,280 eventos/seg',
    unprocessedEvents: 0
  },
  circuitBreaker: {
    enabled: true,
    fallbackBaseline: 'LightGBM-MultiOutput-v1.8',
    errorThreshold: '0.5%'
  }
};

