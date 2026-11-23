import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Zap
} from 'lucide-react';
import { neuralLayersNodes } from '../../data/mockData';
import { NeuralNode, ThemeMode } from '../../types';

interface NeuralVisualizerProps {
  theme?: ThemeMode;
  onSelectNode?: (node: NeuralNode) => void;
}

export const NeuralVisualizer: React.FC<NeuralVisualizerProps> = ({ 
  theme = 'monochrome', 
  onSelectNode 
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [mode, setMode] = useState<'inferencia' | 'entrenamiento'>('inferencia');
  const [selectedNode, setSelectedNode] = useState<NeuralNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [epoch, setEpoch] = useState<number>(38);
  const [loss, setLoss] = useState<number>(0.0421);
  const [valMetric, setValMetric] = useState<number>(0.914);
  const [speed, setSpeed] = useState<number>(1);
  const [pulsePhase, setPulsePhase] = useState<number>(0);
  const animFrameId = useRef<number | null>(null);

  // Smooth animation loop for synapse particle flow
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setPulsePhase(prev => {
          const step = mode === 'inferencia' ? 35 * speed * delta : -35 * speed * delta;
          return (prev + step) % 100;
        });

        // Live micro-updates when training
        if (mode === 'entrenamiento' && Math.random() < 0.04) {
          setEpoch(e => (e >= 50 ? 1 : e + 1));
          setLoss(l => Math.max(0.012, +(l * (0.994 + Math.random() * 0.009)).toFixed(4)));
          setValMetric(m => Math.min(0.968, +(m * (1.0004 + (Math.random() - 0.5) * 0.002)).toFixed(3)));
        }
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

  // Dimensions of SVG canvas
  const svgWidth = 820;
  const svgHeight = 350;

  // Theming colors
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const colColors = isMono 
    ? { input: '#E5E7EB', embedding: '#CBD5E1', analysis: '#9CA3AF', output: '#FFFFFF' }
    : isLight
    ? { input: '#0F172A', embedding: '#2563EB', analysis: '#475569', output: '#0F172A' }
    : { input: '#20C8F5', embedding: '#087FE5', analysis: '#8B4DFF', output: '#00BFA6' };

  const columns = [
    { key: 'input', label: 'NIVEL DE ENTRADA', x: 130, color: colColors.input, nodes: neuralLayersNodes.input },
    { key: 'embedding', label: 'ESTUDIANTES', x: 330, color: colColors.embedding, nodes: neuralLayersNodes.embedding },
    { key: 'analysis', label: 'ANÁLISIS DE APRENDIZAJE', x: 530, color: colColors.analysis, nodes: neuralLayersNodes.analysis },
    { key: 'output', label: 'SALIDA', x: 700, color: colColors.output, nodes: neuralLayersNodes.output },
  ];

  const getNodeY = (index: number, count: number) => {
    const topMargin = 68;
    const bottomMargin = 315;
    return topMargin + (index * (bottomMargin - topMargin)) / (count - 1);
  };

  const isConnectionActive = (layerFrom: string, idxFrom: number, layerTo: string, idxTo: number) => {
    if (!hoveredNodeId && !selectedNode) return false;
    const activeId = hoveredNodeId || selectedNode?.id;

    if (activeId?.startsWith('in-') && layerFrom === 'input') {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return activeIdx === idxFrom;
    }
    if (activeId?.startsWith('out-') && layerTo === 'output') {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return activeIdx === idxTo;
    }
    if (activeId?.startsWith('emb-') && (layerFrom === 'embedding' || layerTo === 'embedding')) {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return (layerTo === 'embedding' && idxTo === activeIdx) || (layerFrom === 'embedding' && idxFrom === activeIdx);
    }
    if (activeId?.startsWith('an-') && (layerFrom === 'analysis' || layerTo === 'analysis')) {
      const activeIdx = parseInt(activeId.split('-')[1]) - 1;
      return (layerTo === 'analysis' && idxTo === activeIdx) || (layerFrom === 'analysis' && idxFrom === activeIdx);
    }
    return false;
  };

  const pulseColor = isMono ? '#FFFFFF' : isLight ? '#0F172A' : (mode === 'inferencia' ? '#20C8F5' : '#8B4DFF');

  return (
    <div className="glass-panel relative flex flex-col h-full overflow-hidden border rounded-2xl shadow-panel">
      {/* Visual Header */}
      <div className={`flex flex-wrap items-center justify-between px-5 py-3 border-b backdrop-blur-md ${
        isMono
          ? 'bg-[#181B23]/90 border-[#2A2F3D] text-gray-100'
          : isLight
          ? 'bg-slate-100/90 border-slate-200 text-slate-900'
          : 'bg-black/40 border-white/10 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl p-0.5 border ${
            isMono ? 'bg-[#202532] border-[#3B4254] text-white' : isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-edumaster-blue/20 border-edumaster-blue text-edumaster-cyan'
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
                  ? 'bg-[#202532] border-[#3B4254] text-zinc-200' 
                  : isLight 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMono ? 'bg-white' : isLight ? 'bg-emerald-600' : 'bg-emerald-400'} animate-ping`} />
                Sincronizado
              </span>
            </div>
            <p className="text-[11px] opacity-60 m-0">
              Red Neuronal Multitarea PyTorch • Fusión Temporal GRU
            </p>
          </div>
        </div>

        {/* Real-time Status Badge & Controls */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={handleModeToggle}
            className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
              isMono
                ? (mode === 'inferencia' ? 'bg-white text-zinc-950 border-white shadow-sm font-black' : 'bg-[#202532] text-zinc-200 border-[#3B4254]')
                : isLight
                ? (mode === 'inferencia' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-800 border-slate-300')
                : (mode === 'inferencia'
                    ? 'bg-edumaster-blue/20 border-edumaster-blue text-edumaster-cyan shadow-glowBlue'
                    : 'bg-edumaster-violet/25 border-edumaster-violet text-purple-300 shadow-glowViolet')
            }`}
            title="Alternar entre propagación de inferencia y retropropagación de gradientes"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{mode === 'inferencia' ? 'Inferencia (Forward)' : 'Entrenamiento (Backward)'}</span>
          </button>

          <div className={`flex items-center p-0.5 rounded-lg border ${
            isMono ? 'bg-[#202532] border-[#3B4254] text-zinc-200' : isLight ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-black/60 border-white/10'
          }`}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 rounded-md opacity-75 hover:opacity-100 flex items-center justify-center transition-colors"
              title={isPlaying ? 'Pausar animación' : 'Reanudar animación'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                setPulsePhase(0);
                setLoss(0.0421);
                setEpoch(38);
              }}
              className="w-7 h-7 rounded-md opacity-75 hover:opacity-100 flex items-center justify-center transition-colors"
              title="Reiniciar métricas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Main Graph SVG Canvas */}
      <div className={`relative flex-1 min-h-[340px] p-2 select-none flex items-center justify-center overflow-hidden ${
        isMono ? 'bg-[#13151D]' : isLight ? 'bg-[#F8FAFC]' : 'bg-[#06152B]/80'
      }`}>
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full max-h-[380px]"
        >
          <defs>
            {/* Synapse Gradients */}
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
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Column Headers */}
          {columns.map(col => (
            <g key={col.key}>
              <text
                x={col.x}
                y={28}
                textAnchor="middle"
                fill={col.color}
                fontSize="10"
                fontWeight="800"
                letterSpacing="1"
                className="select-none uppercase"
              >
                {col.label}
              </text>
              <line
                x1={col.x - 55}
                y1={38}
                x2={col.x + 55}
                y2={38}
                stroke={col.color}
                strokeWidth="1.5"
                strokeOpacity={isMono ? "0.3" : "0.5"}
              />
            </g>
          ))}

          {/* Layer 1 -> Layer 2 Synapses */}
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
                  strokeOpacity={active ? '0.9' : (isMono ? '0.15' : '0.22')}
                  fill="none"
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Layer 2 -> Layer 3 Synapses */}
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
                  strokeOpacity={active ? '0.9' : (isMono ? '0.15' : '0.22')}
                  fill="none"
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Layer 3 -> Layer 4 Synapses */}
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
                  strokeOpacity={active ? '0.9' : (isMono ? '0.15' : '0.22')}
                  fill="none"
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Flowing Light Pulses */}
          {isPlaying && (
            <g>
              {[0, 1, 2, 3, 4, 5].map(idx => {
                const x1 = columns[0].x;
                const y1 = getNodeY(idx, columns[0].nodes.length);
                const x2 = columns[1].x;
                const y2 = getNodeY(idx, columns[1].nodes.length);
                const x3 = columns[2].x;
                const y3 = getNodeY(idx, columns[2].nodes.length);
                const x4 = columns[3].x;
                const y4 = getNodeY(idx, columns[3].nodes.length);

                return (
                  <path
                    key={`flow-path-${idx}`}
                    d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2} C ${(x2 + x3) / 2} ${y2}, ${(x2 + x3) / 2} ${y3}, ${x3} ${y3} C ${(x3 + x4) / 2} ${y3}, ${(x3 + x4) / 2} ${y4}, ${x4} ${y4}`}
                    stroke={pulseColor}
                    strokeWidth={isMono ? '2' : '2.5'}
                    strokeDasharray="10 40"
                    strokeDashoffset={pulsePhase * 2}
                    fill="none"
                    strokeLinecap="round"
                    opacity={isMono ? '0.95' : '0.9'}
                    filter="url(#neon-glow)"
                  />
                );
              })}
            </g>
          )}

          {/* Render Nodes */}
          {columns.map(col =>
            col.nodes.map((node, i) => {
              const y = getNodeY(i, col.nodes.length);
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;

              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Selection Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={col.x}
                      cy={y}
                      r="18"
                      fill="none"
                      stroke={col.color}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-spin"
                    />
                  )}

                  {/* Outer Shell */}
                  <circle
                    cx={col.x}
                    cy={y}
                    r="13"
                    fill={isMono ? '#1C202B' : isLight ? '#FFFFFF' : '#0A1F3D'}
                    stroke={isSelected ? (isLight ? '#0F172A' : '#ffffff') : col.color}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    filter={isSelected ? 'url(#neon-glow)' : 'none'}
                  />

                  {/* Glyph Inside Node */}
                  {col.key === 'embedding' ? (
                    <g transform={`translate(${col.x - 7}, ${y - 7})`}>
                      <circle cx="7" cy="4.5" r="2.5" fill={col.color} />
                      <path d="M 2.5 12 C 2.5 9.5, 4.5 8, 7 8 C 9.5 8, 11.5 9.5, 11.5 12 Z" fill={col.color} />
                    </g>
                  ) : col.key === 'analysis' ? (
                    <g transform={`translate(${col.x - 7}, ${y - 7})`}>
                      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke={col.color} strokeWidth="1.2" />
                      <circle cx="7" cy="7" r="1.5" fill={col.color} />
                      <line x1="7" y1="1" x2="7" y2="3.5" stroke={col.color} strokeWidth="1.2" />
                      <line x1="7" y1="10.5" x2="7" y2="13" stroke={col.color} strokeWidth="1.2" />
                      <line x1="1" y1="7" x2="3.5" y2="7" stroke={col.color} strokeWidth="1.2" />
                      <line x1="10.5" y1="7" x2="13" y2="7" stroke={col.color} strokeWidth="1.2" />
                    </g>
                  ) : (
                    <circle
                      cx={col.x}
                      cy={y}
                      r={isSelected ? '6' : '4.5'}
                      fill={col.color}
                      filter="url(#neon-glow)"
                    />
                  )}

                  {/* Node Labels */}
                  {col.key === 'input' && (
                    <text
                      x={col.x - 22}
                      y={y + 4}
                      textAnchor="end"
                      fill={isSelected || isHovered ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#475569' : '#9CA3AF')}
                      fontSize="10"
                      fontWeight={isSelected ? '700' : '500'}
                      className="transition-colors pointer-events-none"
                    >
                      {node.name}
                    </text>
                  )}

                  {col.key === 'output' && (
                    <text
                      x={col.x + 22}
                      y={y + 4}
                      textAnchor="start"
                      fill={isSelected || isHovered ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#475569' : '#9CA3AF')}
                      fontSize="10"
                      fontWeight={isSelected ? '700' : '500'}
                      className="transition-colors pointer-events-none"
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

      {/* Real-time Telemetry Status Bar */}
      <div className={`px-5 py-2.5 border-t flex flex-wrap items-center justify-between text-xs gap-3 ${
        isLight
          ? 'border-slate-200 bg-slate-50/80 text-slate-700'
          : isMono
          ? 'border-[#2A2F3D] bg-[#161821] text-gray-300'
          : 'border-white/10 bg-black/30 opacity-80'
      }`}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Modelo:</span>
            <span className="font-mono font-bold text-[11px]">EduMaster_MTL_v1.0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Época:</span>
            <span className="font-mono font-bold text-[11px] tabular-numbers">{epoch} / 50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">Loss Multitarea:</span>
            <span className="font-mono font-bold text-[11px] tabular-numbers">{loss}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-60 text-[11px]">PR-AUC:</span>
            <span className="font-mono font-bold text-[11px] tabular-numbers">{valMetric}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="opacity-60">Latencia Inferencia:</span>
          <span className={`px-2 py-0.5 rounded-md font-mono font-bold border ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : isMono ? 'bg-[#202532] border-[#3B4254] text-zinc-200' : 'border-white/10'
          }`}>
            18.4 ms (p95)
          </span>
        </div>
      </div>
    </div>
  );
};
