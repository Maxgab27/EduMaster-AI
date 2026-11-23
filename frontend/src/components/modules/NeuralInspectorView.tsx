import React, { useState } from 'react';
import { Cpu, GitBranch, Database, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Activity } from 'lucide-react';
import { ThemeMode } from '../../types';

interface NeuralInspectorViewProps {
  theme?: ThemeMode;
}

export const NeuralInspectorView: React.FC<NeuralInspectorViewProps> = ({ theme = 'monochrome' }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'baselines' | 'mlops'>('architecture');

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const baselines = [
    { model: 'Regresión Logística Calibrada (L2)', prAuc: 0.742, rocAuc: 0.789, brier: 0.142, latency: '2.1 ms', status: 'Baseline 1' },
    { model: 'Random Forest Regressor / Classifier', prAuc: 0.812, rocAuc: 0.845, brier: 0.118, latency: '4.8 ms', status: 'Baseline 2' },
    { model: 'LightGBM Multi-Output Gradient Boosting', prAuc: 0.865, rocAuc: 0.892, brier: 0.098, latency: '6.2 ms', status: 'Baseline 3' },
    { model: 'EduMaster Multi-Task Network (PyTorch MTL)', prAuc: 0.914, rocAuc: 0.948, brier: 0.042, latency: '18.4 ms', status: 'Aprobado Prod' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Cpu className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            Inspector de Redes Neuronales & MLOps Governance
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Definición en PyTorch, baselines comparativos obligatorios y registro de modelos en MLflow.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex p-0.5 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#1C202B] border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'architecture' 
                ? (isLight ? 'bg-white shadow text-slate-900 font-extrabold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white') 
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            Arquitectura PyTorch
          </button>
          <button
            onClick={() => setActiveTab('baselines')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'baselines' 
                ? (isLight ? 'bg-white shadow text-slate-900 font-extrabold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white') 
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            Baselines Comparativos
          </button>
          <button
            onClick={() => setActiveTab('mlops')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'mlops' 
                ? (isLight ? 'bg-white shadow text-slate-900 font-extrabold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white') 
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            MLOps & DVC Lineage
          </button>
        </div>
      </div>

      {activeTab === 'architecture' && (
        <div className="space-y-4">
          {/* Mathematical Loss Card */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isLight ? 'text-blue-700' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'
            }`}>
              Función de Pérdida Multitarea Ponderada (Documento 1, Sección 9.3)
            </h3>
            <div className={`p-3 rounded-xl border font-mono text-xs ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-200' : 'bg-[#06152B] border-edumaster-cardBorder text-slate-200'
            }`}>
              L_total = λ₁·BCE(finalización) + λ₂·CrossEntropy(dominio) + λ₃·BCE(riesgo) + λ₄·RankingLoss(recs)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div className={`p-2 rounded-lg border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
              }`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>λ₁ (Finalización)</span>
                <span className={`font-mono font-bold ${isLight ? 'text-blue-700' : 'text-edumaster-cyan'}`}>0.30</span>
              </div>
              <div className={`p-2 rounded-lg border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
              }`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>λ₂ (Dominio)</span>
                <span className={`font-mono font-bold ${isLight ? 'text-purple-700' : 'text-edumaster-violet'}`}>0.25</span>
              </div>
              <div className={`p-2 rounded-lg border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
              }`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>λ₃ (Riesgo)</span>
                <span className={`font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>0.25</span>
              </div>
              <div className={`p-2 rounded-lg border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
              }`}>
                <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>λ₄ (Ranking)</span>
                <span className={`font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>0.20</span>
              </div>
            </div>
          </div>

          {/* PyTorch Architecture Snippet */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold flex items-center gap-2">
                <Layers className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-blue'}`} />
                Definición del Módulo PyTorch (EduMasterMultiTaskNet)
              </span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>models/edumaster_mtl.py</span>
            </div>
            <pre className={`p-4 rounded-xl border text-[11px] font-mono overflow-x-auto leading-relaxed ${
              isLight 
                ? 'bg-slate-900 text-emerald-400 border-slate-800' 
                : isMono 
                ? 'bg-[#0E1117] text-zinc-200 border-[#2A2F3D]' 
                : 'bg-[#06152B] border-edumaster-cardBorder text-slate-300'
            }`}>
{`class EduMasterMultiTaskNet(nn.Module):
    def __init__(self, tabular_dim=12, seq_len=14, hidden_dim=128):
        super().__init__()
        # Rama Tabular con normalización y embeddings
        self.tabular_net = nn.Sequential(
            nn.Linear(tabular_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        # Rama Temporal para eventos secuenciales
        self.temporal_gru = nn.GRU(
            input_size=8, hidden_size=hidden_dim, 
            num_layers=2, batch_first=True, dropout=0.2
        )
        # Capa de Fusión
        self.fusion = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.25)
        )
        # 4 Cabezas Multitarea Independientes
        self.head_completion = nn.Linear(hidden_dim, 1)    # Cabeza A
        self.head_mastery = nn.Linear(hidden_dim, 5)       # Cabeza B
        self.head_dropout_risk = nn.Linear(hidden_dim, 1)  # Cabeza C
        self.head_recommend = nn.Linear(hidden_dim, 32)    # Cabeza D`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'baselines' && (
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold m-0">
              Evaluación Comparativa contra Modelos Interpretables
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              Criterio de Validación Superado
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] ${
                  isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-edumaster-cardBorder text-slate-400'
                }`}>
                  <th className="pb-3">Modelo Evaluado</th>
                  <th className="pb-3">PR-AUC</th>
                  <th className="pb-3">ROC-AUC</th>
                  <th className="pb-3">Brier Score</th>
                  <th className="pb-3">Latencia (p95)</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {baselines.map((b, i) => (
                  <tr key={b.model} className={i === 3 ? (isLight ? 'bg-blue-50/70 font-semibold' : 'bg-edumaster-blue/10 font-semibold') : ''}>
                    <td className={`py-3 ${isLight ? 'text-slate-900 font-bold' : 'text-white'}`}>{b.model}</td>
                    <td className={`py-3 font-mono ${isLight ? 'text-blue-700 font-bold' : 'text-edumaster-cyan'}`}>{b.prAuc}</td>
                    <td className={`py-3 font-mono ${isLight ? 'text-purple-700 font-bold' : 'text-edumaster-violet'}`}>{b.rocAuc}</td>
                    <td className={`py-3 font-mono ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>{b.brier}</td>
                    <td className={`py-3 font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{b.latency}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        i === 3 
                          ? (isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30') 
                          : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400')
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mlops' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
          }`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Database className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-blue'}`} />
              DVC: Linaje y Control de Datasets
            </h3>
            <div className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <div className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'
              }`}>
                <span className={`text-[10px] block font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Dataset Hash (dvc.yaml):</span>
                <span className={`font-mono text-xs font-bold ${isLight ? 'text-blue-700' : 'text-edumaster-cyan'}`}>dvc-hash-88a912fc047b</span>
              </div>
              <div>• <strong>Tipo de Split:</strong> Temporal Estricto (Pre-Jun 2026 Train / Jul-Sep Val / Oct-Nov Test).</div>
              <div>• <strong>Prevención Leakage:</strong> Filtro de variables temporales hacia el pasado.</div>
              <div>• <strong>Seudonimización:</strong> Hash SHA-256 sobre IDs directos de estudiantes.</div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
          }`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <GitBranch className={`w-4 h-4 ${isLight ? 'text-purple-600' : isMono ? 'text-zinc-200' : 'text-edumaster-violet'}`} />
              MLflow Model Registry
            </h3>
            <div className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'
              }`}>
                <div>
                  <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>EduMaster_MTL</span>
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Versión 1.0 (Stage: Production)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono h-fit border ${
                  isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  Desplegado
                </span>
              </div>
              <div>• <strong>Aprobado por:</strong> Staff ML Engineer & Data Owner</div>
              <div>• <strong>Shadow Inference:</strong> Superado con 0 errores en 50,000 requests.</div>
              <div>• <strong>Estrategia Rollback:</strong> Imagen containerizada revertible en &lt; 60 segundos.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
