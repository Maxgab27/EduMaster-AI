import React, { useState } from 'react';
import { Award, QrCode, Download, ShieldCheck, X } from 'lucide-react';
import { ThemeMode } from '../../types';

interface CertificatesViewProps {
  theme?: ThemeMode;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ theme = 'monochrome' }) => {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const certificates = [
    {
      id: 'cert-1',
      folio: 'EDU-2026-98124',
      student: 'Carlos Mendoza Ramos',
      course: 'Especialista en Redes Neuronales & PyTorch MTL',
      date: '12 de Noviembre, 2026',
      grade: '19.4 / 20 (Sobresaliente)',
      hash: '9f83ab412c98d4e7b89f2a01',
      status: 'Emitido'
    },
    {
      id: 'cert-2',
      folio: 'EDU-2026-98125',
      student: 'Sofia Ramírez Vargas',
      course: 'Ingeniería de Características & DataOps',
      date: '14 de Noviembre, 2026',
      grade: '19.8 / 20 (Sobresaliente)',
      hash: '3e41ba980c55f11a88cb7402',
      status: 'Emitido'
    },
    {
      id: 'cert-3',
      folio: 'EDU-2026-98126',
      student: 'Mateo Vargas Quispe',
      course: 'MLOps: Despliegue con FastAPI y MLflow',
      date: '15 de Noviembre, 2026',
      grade: '18.2 / 20 (Notable)',
      hash: '6a11cd980f77e23b99ef8803',
      status: 'Emitido'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Award className={`w-5 h-5 ${isLight ? 'text-emerald-600' : isMono ? 'text-zinc-200' : 'text-emerald-400'}`} />
            Emisión y Verificación Pública de Certificados
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Certificaciones criptográficas con folio único, QR dinámico y registro inmutable de auditoría.
          </p>
        </div>
      </div>

      {/* Grid of Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {certificates.map(c => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isLight 
                ? 'bg-white border-slate-200 shadow-sm text-slate-900' 
                : isMono 
                ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' 
                : 'glass-panel border-edumaster-cardBorder text-slate-100'
            }`}
          >
            <div>
              <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
                isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder'
              }`}>
                <span className={`font-mono text-xs font-bold ${
                  isLight ? 'text-blue-700' : isMono ? 'text-white' : 'text-edumaster-cyan'
                }`}>
                  {c.folio}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLight 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  <ShieldCheck className="w-3 h-3" /> Verificado
                </span>
              </div>

              <h3 className="text-sm font-black mb-1 tracking-tight">{c.student}</h3>
              <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{c.course}</p>
              
              <div className={`text-[11px] space-y-1 mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <div>Fecha: <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{c.date}</span></div>
                <div>Calificación: <span className={`font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{c.grade}</span></div>
              </div>
            </div>

            <div className={`flex items-center gap-2 pt-3 border-t ${
              isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder/60'
            }`}>
              <button
                onClick={() => setSelectedCert(c)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200' 
                    : isMono 
                    ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                    : 'bg-[#0D2B52] hover:bg-edumaster-blue hover:text-white text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Ver QR / Folio
              </button>
              <button
                onClick={() => alert(`Descargando certificado oficial PDF para ${c.folio}`)}
                className={`p-2 rounded-xl border transition-colors ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                    : isMono 
                    ? 'bg-[#1C202B] hover:bg-[#252B3A] border-[#2A2F3D] text-zinc-300' 
                    : 'bg-[#06152B] hover:bg-slate-800 text-slate-300 border-edumaster-cardBorder'
                }`}
                title="Descargar PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal Verification Dialog */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl relative ${
            isLight 
              ? 'bg-white border-slate-300 text-slate-900' 
              : isMono 
              ? 'bg-[#181C26] border-[#3B4254] text-white' 
              : 'bg-[#0A1F3D] border-edumaster-cyan/60 text-white'
          }`}>
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-inherit flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-edumaster-blue/20 text-edumaster-cyan border-edumaster-cyan/30'
              }`}>
                VERIFICACIÓN PÚBLICA
              </span>
              <h2 className="text-base font-black mt-2 mb-0.5">{selectedCert.folio}</h2>
              <p className={`text-xs m-0 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{selectedCert.student}</p>
            </div>

            {/* QR Simulation Box */}
            <div className="flex justify-center my-4">
              <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200">
                <QrCode className="w-36 h-36 text-slate-900" />
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 mb-4 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-white/10 text-slate-300'
            }`}>
              <div className="truncate">Hash SHA-256: {selectedCert.hash}</div>
              <div>Emisión: {selectedCert.date}</div>
              <div>Nota Oficial: <span className="text-emerald-600 font-bold">{selectedCert.grade}</span></div>
            </div>

            <button
              onClick={() => setSelectedCert(null)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
              }`}
            >
              Cerrar Verificador
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
