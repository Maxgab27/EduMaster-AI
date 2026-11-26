import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Activity, 
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { neuralLayersNodes } from '../../data/mockData';
import { DashboardSummary, NeuralNode, ThemeMode } from '../../types';

interface NeuralVisualizerProps {
  theme?: ThemeMode;
  onSelectNode?: (node: NeuralNode) => void;
  neural?: DashboardSummary['neural'];
}

export const NeuralVisualizer: React.FC<NeuralVisualizerProps> = ({ 
  theme = 'monochrome', 
  onSelectNode,
  neural
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [mode, setMode] = useState<'inferencia' | 'entrenamiento'>('inferencia');
  
  // Nodo seleccionado: por defecto el primer nodo de entrada para que el panel de la derecha siempre tenga contenido activo
  const [selectedNode, setSelectedNode] = useState<NeuralNode>(neuralLayersNodes.input[0]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [stimulatedNodeId, setStimulatedNodeId] = useState<string | null>(null);
  
  const epoch = neural?.epoch ?? 0;
  const loss = neural?.loss ?? 0;
  const valMetric = neural?.valMetric ?? 0;
  const modelVersion = neural?.modelVersion ?? 'demo-local';
  const runtimeStatus = neural?.status ?? 'detenido';
  const [speed, setSpeed] = useState<number>(1);
  const [pulsePhase, setPulsePhase] = useState<number>(0);
  const animFrameId = useRef<number | null>(null);

  // Animación continua y fluida de las sinapsis y pulsos
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setPulsePhase(prev => {
          const step = mode === 'inferencia' ? 38 * speed * delta : -38 * speed * delta;
          return (prev + step) % 100;
        });
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, speed, mode]);

  const handleNodeClick = (node: NeuralNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const handleModeToggle = () => {
    const nextMode = mode === 'inferencia' ? 'entrenamiento' : 'inferencia';
    setMode(nextMode);
  };

  const handleStimulate = () => {
    if (!selectedNode) return;
    setStimulatedNodeId(selectedNode.id);
    setTimeout(() => setStimulatedNodeId(null), 1200);
  };

  // Dimensiones compactas del lienzo SVG para empujarlo a la izquierda
  const svgWidth = 560;
  const svgHeight = 340;

  // Theming colors
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const colColors = isMono 
    ? { input: '#E5E7EB', embedding: '#CBD5E1', analysis: '#9CA3AF', output: '#FFFFFF' }
    : isLight
    ? { input: '#0F172A', embedding: '#2563EB', analysis: '#475569', output: '#0F172A' }
    : { input: '#20C8F5', embedding: '#087FE5', analysis: '#8B4DFF', output: '#00BFA6' };

  // Distribución horizontal de las 4 columnas
  const columns = [
    { key: 'input', label: 'ENTRADA', x: 80, color: colColors.input, nodes: neuralLayersNodes.input },
    { key: 'embedding', label: 'LATENTE', x: 210, color: colColors.embedding, nodes: neuralLayersNodes.embedding },
    { key: 'analysis', label: 'ANÁLISIS GRU', x: 340, color: colColors.analysis, nodes: neuralLayersNodes.analysis },
    { key: 'output', label: 'SALIDA', x: 470, color: colColors.output, nodes: neuralLayersNodes.output },
  ];

  const getNodeY = (index: number, count: number) => {
    const topMargin = 55;
    const bottomMargin = 300;
    return topMargin + (index * (bottomMargin - topMargin)) / (count - 1);
  };

  // Comprobar si una conexión está activa según el nodo seleccionado o hovered
  const isConnectionActive = (layerFrom: string, idxFrom: number, layerTo: string, idxTo: number) => {
    const activeId = hoveredNodeId || selectedNode?.id;
    if (!activeId) return false;

    if (activeId.startsWith('in-') && layerFrom === 'input') {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return activeIdx === idxFrom;
    }
    if (activeId.startsWith('out-') && layerTo === 'output') {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return activeIdx === idxTo;
    }
    if (activeId.startsWith('emb-') && (layerFrom === 'embedding' || layerTo === 'embedding')) {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return (layerTo === 'embedding' && idxTo === activeIdx) || (layerFrom === 'embedding' && idxFrom === activeIdx);
    }
    if (activeId.startsWith('an-') && (layerFrom === 'analysis' || layerTo === 'analysis')) {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return (layerTo === 'analysis' && idxTo === activeIdx) || (layerFrom === 'analysis' && idxFrom === activeIdx);
    }
    return false;
  };

  const pulseColor = isMono 
    ? '#FFFFFF' 
    : isLight 
    ? '#0F172A' 
    : (mode === 'inferencia' ? '#20C8F5' : '#8B4DFF');

  // Datos pedagógicos del nodo activo para el panel lateral derecho
  const activeNode = selectedNode || neuralLayersNodes.input[0];
  const activeLayer = activeNode.layer;

  const layerMeta = {
    input: {
      category: 'Capa 1 · Nivel de Entrada',
      badgeColor: isMono ? 'bg-white/10 text-white border-white/20' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      formula: 'x_{norm} = \\frac{x - \\mu}{\\sigma}',
      formulaDesc: 'Normalización estándar por feature con ventanas deslizantes de 14 días.'
    },
    embedding: {
      category: 'Capa 2 · Espacio Latente',
      badgeColor: isMono ? 'bg-white/10 text-white border-white/20' : 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      formula: 'e_i = \\text{LayerNorm}(W_e \\cdot x + b_e)',
      formulaDesc: 'Proyección densa de 128 dimensiones con regularización de varianza.'
    },
    analysis: {
      category: 'Capa 3 · Análisis Temporal GRU',
      badgeColor: isMono ? 'bg-white/10 text-white border-white/20' : 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      formula: 'h_t = \\tanh(W_h h_{t-1} + W_x x_t)',
      formulaDesc: 'Compuertas de actualización y reset para detectar estancamiento académico.'
    },
    output: {
      category: 'Capa 4 · Salida Multitarea (MTL)',
      badgeColor: isMono ? 'bg-white/10 text-white border-white/20' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      formula: '\\hat{y} = \\sigma(W_o \\cdot h_t)',
      formulaDesc: 'Predicción calibrada multiobjetivo (deserción, nota, alertas, certificación).'
    }
  }[activeLayer];

  // Cálculo de las rutas EXACTAS de sinapsis para los pulsos luminosos 100% alineados
  const getFlowingPaths = (): string[] => {
    const paths: string[] = [];
    const activeId = hoveredNodeId || selectedNode?.id;

    // Si hay un nodo seleccionado, generamos pulsos a lo largo de sus sinapsis activas exactas
    if (activeId) {
      if (activeId.startsWith('in-')) {
        const i = parseInt(activeId.split('-')[1]) - 1;
        columns[1].nodes.forEach((_, j) => {
          const x1 = columns[0].x;
          const y1 = getNodeY(i, columns[0].nodes.length);
          const x2 = columns[1].x;
          const y2 = getNodeY(j, columns[1].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
      } else if (activeId.startsWith('emb-')) {
        const j = parseInt(activeId.split('-')[1]) - 1;
        // Hacia atrás
        columns[0].nodes.forEach((_, i) => {
          const x1 = columns[0].x;
          const y1 = getNodeY(i, columns[0].nodes.length);
          const x2 = columns[1].x;
          const y2 = getNodeY(j, columns[1].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
        // Hacia adelante
        columns[2].nodes.forEach((_, k) => {
          const x1 = columns[1].x;
          const y1 = getNodeY(j, columns[1].nodes.length);
          const x2 = columns[2].x;
          const y2 = getNodeY(k, columns[2].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
      } else if (activeId.startsWith('an-')) {
        const j = parseInt(activeId.split('-')[1]) - 1;
        columns[1].nodes.forEach((_, i) => {
          const x1 = columns[1].x;
          const y1 = getNodeY(i, columns[1].nodes.length);
          const x2 = columns[2].x;
          const y2 = getNodeY(j, columns[2].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
        columns[3].nodes.forEach((_, k) => {
          const x1 = columns[2].x;
          const y1 = getNodeY(j, columns[2].nodes.length);
          const x2 = columns[3].x;
          const y2 = getNodeY(k, columns[3].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
      } else if (activeId.startsWith('out-')) {
        const j = parseInt(activeId.split('-')[1]) - 1;
        columns[2].nodes.forEach((_, i) => {
          const x1 = columns[2].x;
          const y1 = getNodeY(i, columns[2].nodes.length);
          const x2 = columns[3].x;
          const y2 = getNodeY(j, columns[3].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
      }
    }

    // Si no hay nodo o para acompañar con flujo continuo, añadimos el flujo representativo
    if (paths.length === 0) {
      const transitions = [
        { c1: 0, c2: 1, pairs: [[0, 0], [1, 2], [2, 1], [3, 3], [4, 5], [5, 4]] },
        { c1: 1, c2: 2, pairs: [[0, 1], [1, 0], [2, 2], [3, 4], [4, 3], [5, 5]] },
        { c1: 2, c2: 3, pairs: [[0, 0], [1, 1], [2, 3], [3, 2], [4, 5], [5, 4]] },
      ];

      transitions.forEach(tr => {
        tr.pairs.forEach(([i, j]) => {
          const x1 = columns[tr.c1].x;
          const y1 = getNodeY(i, columns[tr.c1].nodes.length);
          const x2 = columns[tr.c2].x;
          const y2 = getNodeY(j, columns[tr.c2].nodes.length);
          paths.push(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
        });
      });
    }

    return paths;
  };

  const flowingPaths = getFlowingPaths();

  return (
    <div className="glass-panel relative flex flex-col h-full overflow-hidden border rounded-2xl shadow-panel">
      {/* Visual Header */}
      <div className={`flex flex-wrap items-center justify-between px-5 py-3 border-b backdrop-blur-md ${
        isMono
          ? 'bg-black/25 border-white/10 text-gray-100'
          : isLight
          ? 'bg-white/40 border-slate-200/60 text-slate-900'
          : 'bg-black/30 border-white/10 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl p-0.5 border ${
            isMono ? 'bg-white/10 border-white/15 text-white' : isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-edumaster-blue/20 border-edumaster-blue text-edumaster-cyan'
          }`}>
            <div className="w-full h-full rounded-[10px] flex items-center justify-center">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight m-0">
                Arquitectura de Aprendizaje Inteligente
              </h2>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isMono 
                  ? 'bg-white/10 border-white/15 text-zinc-200' 
                  : isLight 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DEMO · MTL
              </span>
            </div>
            <p className="text-[10px] opacity-60 m-0">
              Red Neuronal Multitarea: Inferencia explicable y trazabilidad de pesos por nodo.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleModeToggle}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 backdrop-blur-md ${
              mode === 'inferencia'
                ? (isLight 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : isMono 
                    ? 'bg-white text-zinc-950 font-black border-white' 
                    : 'bg-edumaster-blue/30 border-edumaster-cyan text-edumaster-cyan shadow-glowCyan')
                : (isLight 
                    ? 'bg-violet-600 text-white border-violet-600' 
                    : isMono 
                    ? 'bg-white/20 text-white border-white font-bold' 
                    : 'bg-edumaster-violet/30 border-edumaster-violet text-purple-200')
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="capitalize">{mode === 'inferencia' ? 'Inferencia' : 'Entrenamiento'}</span>
          </button>

          <div className={`flex items-center border rounded-xl overflow-hidden backdrop-blur-md ${
            isLight ? 'bg-white/60 border-slate-200' : 'bg-black/25 border-white/10'
          }`}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 opacity-80 hover:opacity-100 transition-opacity"
              title={isPlaying ? 'Pausar animación' : 'Reanudar animación'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
              className="px-2 h-7 text-[11px] font-mono font-bold opacity-80 hover:opacity-100 flex items-center justify-center"
              title="Velocidad de pulsos"
            >
              {speed}x
            </button>
          </div>
        </div>
      </div>

      {/* Main Body: Gráfico a la izquierda + Panel de Inspección del Nodo Seleccionado a la derecha */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch min-h-[350px]">
        
        {/* LADO IZQUIERDO: Gráfico SVG de la Red Neuronal (Empujado a la izquierda) */}
        <div className={`relative flex-1 p-2 select-none flex items-center justify-center overflow-hidden backdrop-blur-md ${
          isMono ? 'bg-black/20' : isLight ? 'bg-white/30' : 'bg-black/25'
        }`}>
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full max-h-[370px]"
          >
            <defs>
              {/* Degradados de sinapsis */}
              <linearGradient id="syn-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colColors.input} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colColors.embedding} stopOpacity="0.3" />
              </linearGradient>

              <linearGradient id="syn-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colColors.embedding} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colColors.analysis} stopOpacity="0.3" />
              </linearGradient>

              <linearGradient id="syn-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colColors.analysis} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colColors.output} stopOpacity="0.3" />
              </linearGradient>

              <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Encabezados de Columna */}
            {columns.map(col => (
              <g key={col.key}>
                <text
                  x={col.x}
                  y={24}
                  textAnchor="middle"
                  fill={col.color}
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="0.8"
                  className="select-none uppercase"
                >
                  {col.label}
                </text>
                <line
                  x1={col.x - 45}
                  y1={32}
                  x2={col.x + 45}
                  y2={32}
                  stroke={col.color}
                  strokeWidth="1.2"
                  strokeOpacity={isMono ? "0.3" : "0.5"}
                />
              </g>
            ))}

            {/* Capa 1 -> Capa 2 Sinapsis */}
            {columns[0].nodes.map((_, i) =>
              columns[1].nodes.map((_, j) => {
                const x1 = columns[0].x;
                const y1 = getNodeY(i, columns[0].nodes.length);
                const x2 = columns[1].x;
                const y2 = getNodeY(j, columns[1].nodes.length);
                const active = isConnectionActive('input', i, 'embedding', j);

                return (
                  <path
                    key={`syn1-${i}-${j}`}
                    d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                    stroke={active ? (isMono ? '#FFFFFF' : '#20C8F5') : 'url(#syn-grad-1)'}
                    strokeWidth={active ? '2' : '0.8'}
                    strokeOpacity={active ? '0.9' : (isMono ? '0.12' : '0.20')}
                    fill="none"
                    className="transition-all duration-300"
                  />
                );
              })
            )}

            {/* Capa 2 -> Capa 3 Sinapsis */}
            {columns[1].nodes.map((_, i) =>
              columns[2].nodes.map((_, j) => {
                const x1 = columns[1].x;
                const y1 = getNodeY(i, columns[1].nodes.length);
                const x2 = columns[2].x;
                const y2 = getNodeY(j, columns[2].nodes.length);
                const active = isConnectionActive('embedding', i, 'analysis', j);

                return (
                  <path
                    key={`syn2-${i}-${j}`}
                    d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                    stroke={active ? (isMono ? '#FFFFFF' : '#8B4DFF') : 'url(#syn-grad-2)'}
                    strokeWidth={active ? '2' : '0.8'}
                    strokeOpacity={active ? '0.9' : (isMono ? '0.12' : '0.20')}
                    fill="none"
                    className="transition-all duration-300"
                  />
                );
              })
            )}

            {/* Capa 3 -> Capa 4 Sinapsis */}
            {columns[2].nodes.map((_, i) =>
              columns[3].nodes.map((_, j) => {
                const x1 = columns[2].x;
                const y1 = getNodeY(i, columns[2].nodes.length);
                const x2 = columns[3].x;
                const y2 = getNodeY(j, columns[3].nodes.length);
                const active = isConnectionActive('analysis', i, 'output', j);

                return (
                  <path
                    key={`syn3-${i}-${j}`}
                    d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                    stroke={active ? (isMono ? '#FFFFFF' : '#00BFA6') : 'url(#syn-grad-3)'}
                    strokeWidth={active ? '2' : '0.8'}
                    strokeOpacity={active ? '0.9' : (isMono ? '0.12' : '0.20')}
                    fill="none"
                    className="transition-all duration-300"
                  />
                );
              })
            )}

            {/* Pulsos Luminosos 100% ALINEADOS con el trayecto curvo exacto de las líneas */}
            {isPlaying && (
              <g>
                {flowingPaths.map((pathD, idx) => (
                  <path
                    key={`flow-aligned-${idx}`}
                    d={pathD}
                    stroke={pulseColor}
                    strokeWidth={isMono ? '2.2' : '2.6'}
                    strokeDasharray="14 70"
                    strokeDashoffset={-pulsePhase * 2}
                    fill="none"
                    strokeLinecap="round"
                    opacity={isMono ? '0.95' : '0.92'}
                    filter="url(#neon-glow)"
                  />
                ))}
              </g>
            )}

            {/* Nodos de la Red */}
            {columns.map(col =>
              col.nodes.map((node, i) => {
                const y = getNodeY(i, col.nodes.length);
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isStimulated = stimulatedNodeId === node.id;

                return (
                  <g 
                    key={node.id} 
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Anillo de Selección y Pulso de Estímulo */}
                    {(isSelected || isHovered || isStimulated) && (
                      <circle
                        cx={col.x}
                        cy={y}
                        r={isStimulated ? "22" : "18"}
                        fill="none"
                        stroke={col.color}
                        strokeWidth="2"
                        strokeDasharray={isStimulated ? "none" : "4 4"}
                        className={isStimulated ? "animate-ping" : "animate-spin"}
                      />
                    )}

                    {/* Carcasa Exterior del Nodo */}
                    <circle
                      cx={col.x}
                      cy={y}
                      r="12.5"
                      fill={isMono ? '#1C202B' : isLight ? '#FFFFFF' : '#0A1F3D'}
                      stroke={isSelected ? (isLight ? '#0F172A' : '#ffffff') : col.color}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      filter={isSelected ? 'url(#neon-glow)' : 'none'}
                    />

                    {/* Glifo representativo del nodo */}
                    {col.key === 'embedding' ? (
                      <g transform={`translate(${col.x - 6.5}, ${y - 6.5})`}>
                        <circle cx="6.5" cy="4" r="2.2" fill={col.color} />
                        <path d="M 2 11 C 2 8.5, 4 7.2, 6.5 7.2 C 9 7.2, 11 8.5, 11 11 Z" fill={col.color} />
                      </g>
                    ) : col.key === 'analysis' ? (
                      <g transform={`translate(${col.x - 6.5}, ${y - 6.5})`}>
                        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke={col.color} strokeWidth="1.2" />
                        <circle cx="6.5" cy="6.5" r="1.5" fill={col.color} />
                      </g>
                    ) : (
                      <circle
                        cx={col.x}
                        cy={y}
                        r={isSelected ? '5.5' : '4'}
                        fill={col.color}
                        filter="url(#neon-glow)"
                      />
                    )}

                    {/* Etiquetas de Entrada (a la izquierda) */}
                    {col.key === 'input' && (
                      <text
                        x={col.x - 18}
                        y={y + 3.5}
                        textAnchor="end"
                        fill={isSelected || isHovered ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#475569' : '#9CA3AF')}
                        fontSize="9.5"
                        fontWeight={isSelected ? '800' : '500'}
                        className="transition-colors pointer-events-none select-none"
                      >
                        {node.name}
                      </text>
                    )}

                    {/* Etiquetas de Salida (a la derecha) */}
                    {col.key === 'output' && (
                      <text
                        x={col.x + 18}
                        y={y + 3.5}
                        textAnchor="start"
                        fill={isSelected || isHovered ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#475569' : '#9CA3AF')}
                        fontSize="9.5"
                        fontWeight={isSelected ? '800' : '500'}
                        className="transition-colors pointer-events-none select-none"
                      >
                        {node.name}
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </svg>
        </div>

        {/* LADO DERECHO: Panel de Inspección del Nodo Seleccionado (Lo que salía al seleccionar un punto) */}
        <div className={`w-full lg:w-[320px] xl:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 p-4.5 flex flex-col justify-between backdrop-blur-md transition-all ${
          isLight ? 'bg-white/60 text-slate-900' : isMono ? 'bg-black/25 text-white' : 'bg-black/35 text-white'
        }`}>
          <div>
            {/* Cabecera del Inspector */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 mb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${layerMeta.badgeColor}`}>
                {layerMeta.category}
              </span>
              <span className="font-mono text-[11px] font-bold opacity-60">
                {activeNode.id}
              </span>
            </div>

            {/* Título y Descripción del Nodo */}
            <div className="mb-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-edumaster-cyan shrink-0" />
                <h3 className="text-sm font-black tracking-tight m-0">
                  {activeNode.name}
                </h3>
              </div>
              <p className="text-xs opacity-70 m-0 leading-relaxed">
                {activeNode.description}
              </p>
            </div>

            {/* Grilla de Métricas del Nodo */}
            <div className="grid grid-cols-2 gap-2 mb-3.5">
              <div className={`p-2.5 rounded-xl border backdrop-blur-sm ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
              }`}>
                <span className="text-[10px] opacity-60 block font-medium">Tensor Shape</span>
                <span className="text-xs font-mono font-bold block mt-0.5">{activeNode.shape}</span>
              </div>
              <div className={`p-2.5 rounded-xl border backdrop-blur-sm ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
              }`}>
                <span className="text-[10px] opacity-60 block font-medium">Activación</span>
                <span className="text-xs font-mono font-bold block mt-0.5">{activeNode.activation}</span>
              </div>
            </div>

            {/* Barra de Magnitud / Activación del Nodo */}
            <div className={`p-3 rounded-xl border backdrop-blur-sm mb-3.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[11px] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 opacity-70" /> Magnitud de Salida
                </span>
                <span className="font-mono font-black tabular-numbers">
                  {activeNode.value.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isMono 
                      ? 'bg-white' 
                      : 'bg-gradient-to-r from-edumaster-blue via-edumaster-cyan to-emerald-400'
                  }`}
                  style={{ width: `${Math.round(activeNode.value * 100)}%` }}
                />
              </div>
            </div>

            {/* Fórmula Matemática de la Capa */}
            <div className={`p-3 rounded-xl border backdrop-blur-sm mb-3.5 ${
              isLight ? 'bg-slate-100/70 border-slate-200 text-slate-800' : 'bg-white/[0.03] border-white/10 text-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1">
                <Layers className="w-3 h-3" /> Formulación Matemática
              </div>
              <div className="font-mono text-xs font-black py-0.5 text-edumaster-cyan">
                {layerMeta.formula}
              </div>
              <p className="text-[10px] opacity-60 mt-1 m-0">
                {layerMeta.formulaDesc}
              </p>
            </div>
          </div>

          {/* Botón de Interacción: Simular Estímulo */}
          <div className="pt-2">
            <button
              onClick={handleStimulate}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm ${
                isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                  : isMono
                  ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200 border-white'
                  : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white border-edumaster-cyan/40 shadow-glowBlue'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estimular Nodo (+10%)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70" />
            </button>
          </div>
        </div>

      </div>

      {/* Real-time Telemetry Status Bar */}
      <div className={`px-5 py-2.5 border-t flex flex-wrap items-center justify-between text-xs gap-3 backdrop-blur-sm ${
        isLight
          ? 'border-slate-200/60 bg-white/40 text-slate-700'
          : isMono
          ? 'border-white/10 bg-black/20 text-gray-300'
          : 'border-white/10 bg-black/25 opacity-90 text-white'
      }`}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Modelo:</span>
            <span className="font-mono font-bold text-[11px]">{modelVersion}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Estado:</span>
            <span className="font-mono font-bold text-[11px]">{runtimeStatus}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Época:</span>
            <span className="font-mono font-bold text-[11px] tabular-numbers">{epoch}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Loss multitarea:</span>
            <span className="font-mono font-bold text-[11px] tabular-numbers">{loss}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Loss validación:</span>
            <span className="font-mono font-bold text-[11px] tabular-numbers">{valMetric}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="opacity-60">Trazabilidad:</span>
          <span className={`px-2 py-0.5 rounded-md font-mono font-bold border ${
            isLight ? 'bg-white/80 border-slate-200 text-slate-800' : isMono ? 'bg-white/10 border-white/15 text-zinc-200' : 'bg-white/10 border-white/15 text-white'
          }`}>
            DEMO · sin medición de latencia
          </span>
        </div>
      </div>
    </div>
  );
};
