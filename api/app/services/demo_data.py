"""Datos DEMO del dashboard, equivalentes al adaptador frontend sin API."""

from __future__ import annotations

from app.schemas import (
    ActivityEvent,
    DashboardSummary,
    MetricCard,
    NeuralVisualizerState,
    RegionProgress,
    SkillCategory,
    SkillLevels,
)
from app.services.inference import neural_status


def dashboard_summary() -> DashboardSummary:
    status = neural_status()
    return DashboardSummary(
        metrics=[
            MetricCard(
                title="Alumnos",
                value="24,593",
                change="+12.5%",
                isPositive=True,
                subtext="DEMO · dato sintetico",
                iconName="Users",
            ),
            MetricCard(
                title="Cursos",
                value="1,248",
                change="+14.2%",
                isPositive=True,
                subtext="DEMO · dato sintetico",
                iconName="BookOpen",
            ),
            MetricCard(
                title="Horas de Aprendizaje",
                value="89,450",
                change="+23.7%",
                isPositive=True,
                subtext="DEMO · dato sintetico",
                iconName="Clock",
            ),
            MetricCard(
                title="Certificaciones",
                value="5,782",
                change="+8.5%",
                isPositive=True,
                subtext="DEMO · dato sintetico",
                iconName="Award",
            ),
        ],
        regions=[
            RegionProgress(region="América del Norte", students=8450, change="+12.5%", color="#20C8F5"),
            RegionProgress(region="Europa", students=6120, change="+8.9%", color="#087FE5"),
            RegionProgress(region="Asia", students=7890, change="+11.3%", color="#8B4DFF"),
            RegionProgress(region="América del Sur", students=2980, change="+6.7%", color="#00BFA6"),
            RegionProgress(region="África", students=1820, change="+5.1%", color="#F59E0B"),
            RegionProgress(region="Oceanía", students=1760, change="+4.8%", color="#EC4899"),
        ],
        skills=[
            SkillCategory(
                id="ai",
                name="Inteligencia Artificial",
                levels=SkillLevels(aprender=98, practicar=85, aplicar=72, avanzado=54, experto=28),
                certifiedByDocent=True,
            ),
            SkillCategory(
                id="ml",
                name="Machine Learning",
                levels=SkillLevels(aprender=92, practicar=88, aplicar=68, avanzado=46, experto=22),
                certifiedByDocent=True,
            ),
            SkillCategory(
                id="ds",
                name="Ciencia de Datos",
                levels=SkillLevels(aprender=86, practicar=76, aplicar=62, avanzado=38, experto=15),
                certifiedByDocent=False,
            ),
            SkillCategory(
                id="web",
                name="Desarrollo Web",
                levels=SkillLevels(aprender=99, practicar=94, aplicar=87, avanzado=72, experto=48),
                certifiedByDocent=True,
            ),
            SkillCategory(
                id="cloud",
                name="Nube y DevOps",
                levels=SkillLevels(aprender=82, practicar=68, aplicar=52, avanzado=34, experto=12),
                certifiedByDocent=False,
            ),
        ],
        activity=[
            ActivityEvent(
                id="act-1",
                icon="check",
                title="Curso de Python completado",
                description="DEMO · Estudiante sintético finalizó la actividad",
                timeAgo="Hace 2 h",
                user="Sofia R. (DEMO)",
                status="success",
            ),
            ActivityEvent(
                id="act-2",
                icon="award",
                title="Certificado DEMO emitido",
                description="DEMO · Folio generado solo en entorno de prueba",
                timeAgo="Hace 3 h",
                user="Carlos M. (DEMO)",
                status="success",
            ),
            ActivityEvent(
                id="act-3",
                icon="play",
                title="Nuevo curso iniciado",
                description="DEMO · Cohorte sintética comenzó módulo",
                timeAgo="Hace 5 h",
                user="Cohorte DL (DEMO)",
                status="info",
            ),
            ActivityEvent(
                id="act-4",
                icon="target",
                title="Meta de aprendizaje alcanzada",
                description="DEMO · Indicador de prueba, no reporte oficial",
                timeAgo="Hace 1 día",
                user="Facultad Ing. (DEMO)",
                status="warning",
            ),
        ],
        neural=NeuralVisualizerState(
            status=status.status,
            epoch=status.trained_epochs,
            loss=round(status.last_train_loss or 0.0, 4),
            valMetric=round(status.last_val_loss or 0.0, 4),
            modelVersion=status.model_version,
            publicationDecision=status.publication_decision,
        ),
    )
