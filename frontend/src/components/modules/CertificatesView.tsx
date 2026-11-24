import React, { useEffect, useState } from 'react';
import {
  Award,
  QrCode,
  Download,
  ShieldCheck,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { ApiMeta, CertificateRecord, CertificateVerification, ThemeMode } from '../../types';
import { isDemoMode } from '../../services/apiClient';
import { listCertificates, verifyCertificate } from '../../services/certificatesApi';
import { writeAudit } from '../../services/auditSink';

interface CertificatesViewProps {
  theme?: ThemeMode;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function qrDataUrl(svg: string | null | undefined): string | null {
  if (!svg) return null;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ theme = 'monochrome' }) => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [folio, setFolio] = useState('');
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  useEffect(() => {
    const controller = new AbortController();
    listCertificates(controller.signal)
      .then(response => {
        setCertificates(response.data);
        setMeta(response.meta);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el registro de certificados');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const handleVerify = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!folio.trim()) return;
    setVerifying(true);
    setNotice(null);
    try {
      const response = await verifyCertificate(folio.trim().toUpperCase());
      setVerification(response.data);
      if (isDemoMode()) {
        await writeAudit({
          action: 'certificate.verify',
          correlationId: response.meta.correlationId,
          detail: { folio: folio.trim().toUpperCase(), valid: response.data.valid },
        });
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'No se pudo verificar el folio');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async (cert: CertificateRecord) => {
    const qr = qrDataUrl(cert.qrSvg);
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Certificado ${cert.folio}</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:48px auto;padding:0 24px;color:#0f172a}
.badge{font:12px monospace;letter-spacing:.08em;text-transform:uppercase;color:#0f766e}
h1{font-size:26px;margin:12px 0 4px}.muted{color:#64748b;font-size:14px}
.box{border:1px solid #cbd5e1;border-radius:16px;padding:24px;margin:24px 0}
.row{display:flex;justify-content:space-between;gap:16px;padding:6px 0;font-size:14px}
code{font-size:12px;word-break:break-all}.qr{width:140px;height:140px}
footer{font-size:11px;color:#64748b;margin-top:32px}</style></head><body>
<div class="badge">${isDemoMode() ? 'DEMO · registro sintético' : 'Verificación API'}</div>
<h1>Certificado de finalización</h1>
<p class="muted">Folio ${cert.folio} · ${cert.status}</p>
<div class="box">
<div class="row"><strong>Estudiante</strong><span>${cert.student}</span></div>
<div class="row"><strong>Curso</strong><span>${cert.course}</span></div>
<div class="row"><strong>Fecha de emisión</strong><span>${formatDate(cert.issuedAt)}</span></div>
<div class="row"><strong>Calificación oficial</strong><span>${cert.grade}</span></div>
<div class="row"><strong>Hash</strong><code>${cert.hash}</code></div>
<div class="row"><strong>Verificación</strong><code>${cert.verificationUrl}</code></div>
</div>
${qr ? `<img class="qr" src="${qr}" alt="QR de verificación">` : ''}
<footer>Comprobante generado desde ${meta?.source === 'api' ? 'la API /api/v1' : 'el adaptador DEMO local'}. Correlation ID: ${meta?.correlationId ?? 'local'}. No equivale a un certificado oficial institucional.</footer>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `certificado-${cert.folio}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`Comprobante de ${cert.folio} generado para impresión o guardado como PDF.`);
    await writeAudit({
      action: 'certificate.download',
      detail: { folio: cert.folio, hash: cert.hash },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Award className={`w-5 h-5 ${isLight ? 'text-emerald-600' : isMono ? 'text-zinc-200' : 'text-emerald-400'}`} />
            Emisión y Verificación Pública de Certificados
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Folio y hash verificables con QR generado en backend. Los datos son DEMO cuando no hay API configurada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {meta ? `${meta.source} · ${meta.correlationId.slice(0, 14)}` : 'sin fuente'}
          </span>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadKey(key => key + 1);
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
            }`}
            title="Recargar registro"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
          isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form
        onSubmit={handleVerify}
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 sm:items-center ${
          isLight ? 'bg-white border-slate-200' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}
      >
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            value={folio}
            onChange={event => setFolio(event.target.value)}
            aria-label="Folio del certificado"
            placeholder="Verificar folio, ej. EDU-2026-98124"
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                : isMono
                ? 'bg-[#1C202B] border-[#2A2F3D] text-white focus:border-white/40'
                : 'bg-[#06152B] border-edumaster-cardBorder text-white focus:border-edumaster-cyan'
            }`}
          />
        </div>
        <button
          type="submit"
          aria-label="Verificar folio"
          disabled={verifying || !folio.trim()}
          className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 ${
            isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white'
          }`}
        >
          {verifying ? 'Verificando...' : 'Verificar folio'}
        </button>
      </form>

      {verification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          verification.valid
            ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          {verification.valid ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <div className="space-y-1">
            <p className="font-bold m-0">
              {verification.valid ? 'Folio válido' : 'Folio no válido o no encontrado'} · {verification.folio}
            </p>
            <p className="m-0 opacity-90">{verification.message}</p>
            {verification.valid && (
              <p className="m-0 font-mono text-[11px] opacity-80">
                {verification.student} · {verification.course} · hash {verification.hash}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-2xl border text-xs ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`p-10 rounded-2xl border text-center text-xs animate-pulse ${
          isLight ? 'bg-white border-slate-200 text-slate-500' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-400' : 'glass-panel border-edumaster-cardBorder text-slate-400'
        }`}>
          Cargando certificados desde {meta?.source === 'api' ? 'la API' : 'el adaptador DEMO'}...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {certificates.map(cert => (
            <div
              key={cert.id}
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
                    {cert.folio}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <ShieldCheck className="w-3 h-3" /> {cert.status}
                  </span>
                </div>

                <h3 className="text-sm font-black mb-1 tracking-tight">{cert.student}</h3>
                <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{cert.course}</p>

                <div className={`text-[11px] space-y-1 mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <div>Fecha: <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{formatDate(cert.issuedAt)}</span></div>
                  <div>Calificación: <span className={`font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{cert.grade}</span></div>
                  <div className="font-mono text-[10px] truncate">Hash: {cert.hash}</div>
                </div>
              </div>

              <div className={`flex items-center gap-2 pt-3 border-t ${
                isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder/60'
              }`}>
                <button
                  onClick={() => setSelectedCert(cert)}
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
                  onClick={() => void handleDownload(cert)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      : isMono
                      ? 'bg-[#1C202B] hover:bg-[#252B3A] border-[#2A2F3D] text-zinc-300'
                      : 'bg-[#06152B] hover:bg-slate-800 text-slate-300 border-edumaster-cardBorder'
                  }`}
                  title="Descargar comprobante HTML"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

            <div className="flex justify-center my-4">
              <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200">
                {qrDataUrl(selectedCert.qrSvg) ? (
                  <img src={qrDataUrl(selectedCert.qrSvg) ?? ''} alt={`QR de ${selectedCert.folio}`} className="w-36 h-36" />
                ) : (
                  <QrCode className="w-36 h-36 text-slate-900" />
                )}
              </div>
            </div>
            <p className={`text-center text-[10px] -mt-2 mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isDemoMode() ? 'QR ilustrativo DEMO · requiere API para código escaneable' : 'QR scannable generado en backend'}
            </p>

            <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 mb-4 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-white/10 text-slate-300'
            }`}>
              <div className="truncate">Hash SHA-256: {selectedCert.hash}</div>
              <div>Emisión: {formatDate(selectedCert.issuedAt)}</div>
              <div>Nota Oficial: <span className="text-emerald-600 font-bold">{selectedCert.grade}</span></div>
              <div className="truncate">
                {isDemoMode()
                  ? 'Verificación: DEMO local · sin endpoint público'
                  : `URL: ${selectedCert.verificationUrl}`}
              </div>
            </div>

            <button
              onClick={() => {
                setFolio(selectedCert.folio);
                setSelectedCert(null);
                void handleVerify();
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors mb-2 ${
                isLight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
              }`}
            >
              Verificar este folio
            </button>
            <button
              onClick={() => setSelectedCert(null)}
              className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${
                isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/15 text-slate-300 hover:bg-white/5'
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
