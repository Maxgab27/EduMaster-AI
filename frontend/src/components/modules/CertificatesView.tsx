import React, { useEffect, useRef, useState } from 'react';
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
  ArrowLeft,
} from 'lucide-react';
import type { ApiMeta, CertificateRecord, CertificateVerification, ThemeMode } from '../../types';
import { friendlyApiError, isDemoMode } from '../../services/apiClient';
import { listCertificates, verifyCertificate } from '../../services/certificatesApi';
import { writeAudit } from '../../services/auditSink';

interface CertificatesViewProps {
  theme?: ThemeMode;
  /** Folio llegado desde un QR escaneado (?verify=...). */
  initialVerifyFolio?: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  theme = 'monochrome',
  initialVerifyFolio,
}) => {
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
        setError(friendlyApiError(err));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const handleVerify = async (event?: React.FormEvent, explicitFolio?: string) => {
    event?.preventDefault();
    const target = (explicitFolio ?? folio).trim().toUpperCase();
    if (!target) return;
    setVerifying(true);
    setNotice(null);
    try {
      const response = await verifyCertificate(target);
      setFolio(target);
      setVerification(response.data);
      if (isDemoMode()) {
        await writeAudit({
          action: 'certificate.verify',
          correlationId: response.meta.correlationId,
          detail: { folio: target, valid: response.data.valid },
        });
      }
    } catch (err) {
      setNotice(friendlyApiError(err));
    } finally {
      setVerifying(false);
    }
  };

  const autoVerifiedFolio = useRef<string | null>(null);

  useEffect(() => {
    if (!initialVerifyFolio || autoVerifiedFolio.current === initialVerifyFolio) return;
    autoVerifiedFolio.current = initialVerifyFolio;
    void handleVerify(undefined, initialVerifyFolio);
    // El folio del QR se procesa una sola vez al abrir la URL, incluso en StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVerifyFolio]);

  const createReceiptUrl = (cert: CertificateRecord): string => {
    const qr = cert.qrDataUrl ?? null;
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

    return URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  };

  const handleDownload = async (cert: CertificateRecord) => {
    const url = createReceiptUrl(cert);
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

  /**
   * En celular una ruta real de la SPA es más confiable que window.open o un
   * blob: no hay ventanas emergentes ni descargas bloqueadas.
   */
  const handleOpenReceipt = async (cert: CertificateRecord) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('verify');
    url.searchParams.set('receipt', cert.folio);
    setNotice(`Comprobante de ${cert.folio} abierto. Usa “Volver” para regresar.`);
    await writeAudit({
      action: 'certificate.receipt_open',
      detail: { folio: cert.folio, hash: cert.hash },
    });
    window.location.assign(url.toString());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black flex items-center gap-2 m-0">
            <Award className={`w-5 h-5 ${isLight ? 'text-emerald-600' : isMono ? 'text-zinc-200' : 'text-emerald-400'}`} />
            Emisión y Verificación Pública de Certificados
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            QR escaneable con verificación SHA-256 del folio contra la API activa. Los datos del registro son sintéticos y no equivalen a certificados oficiales.
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
          <span className="min-w-0 break-words">{notice}</span>
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
          <div className="space-y-1 min-w-0">
            <p className="font-bold m-0 break-words">
              {verification.valid ? 'Folio válido' : 'Folio no válido o no encontrado'} · {verification.folio}
            </p>
            <p className="m-0 opacity-90 break-words">{verification.message}</p>
            {verification.valid && (
              <p className="m-0 font-mono text-[11px] opacity-80 break-words">
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
          <div className={`border rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[92dvh] overflow-y-auto ${
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
                {selectedCert.qrDataUrl ? (
                  <img src={selectedCert.qrDataUrl} alt={`QR de ${selectedCert.folio}`} className="w-32 h-32 sm:w-36 sm:h-36" />
                ) : (
                  <QrCode className="w-32 h-32 sm:w-36 sm:h-36 text-slate-900" />
                )}
              </div>
            </div>
            <p className={`text-center text-[10px] -mt-2 mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {meta?.source === 'api'
                ? 'QR escaneable · verificación SHA-256 en API · datos sintéticos'
                : 'QR escaneable · verificación DEMO local · datos sintéticos'}
            </p>

            <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 mb-4 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-white/10 text-slate-300'
            }`}>
              <div className="truncate">Hash SHA-256: {selectedCert.hash}</div>
              <div>Emisión: {formatDate(selectedCert.issuedAt)}</div>
              <div>Nota Oficial: <span className="text-emerald-600 font-bold">{selectedCert.grade}</span></div>
              <div className="break-all" title={selectedCert.verificationUrl}>
                URL: {selectedCert.verificationUrl}
              </div>
            </div>

            <button
              onClick={() => {
                const target = selectedCert.folio;
                setFolio(target);
                setSelectedCert(null);
                void handleVerify(undefined, target);
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors mb-2 ${
                isLight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
              }`}
            >
              Verificar este folio
            </button>
            <button
              onClick={() => void handleOpenReceipt(selectedCert)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors mb-2 flex items-center justify-center gap-1.5 ${
                isLight ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300' : isMono ? 'bg-[#202532] text-zinc-100 hover:bg-[#2A3040] border border-[#3B4254]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Abrir comprobante (celular)
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

interface CertificateReceiptViewProps {
  folio: string;
  theme?: ThemeMode;
}

/**
 * Comprobante de una sola página, servido por la misma SPA en ?receipt=<folio>.
 * Evita ventanas emergentes y blobs: en el celular funciona como una página web
 * normal y se puede guardar como PDF con el botón del navegador o el de imprimir.
 */
export const CertificateReceiptView: React.FC<CertificateReceiptViewProps> = ({
  folio,
  theme = 'monochrome',
}) => {
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listCertificates(controller.signal)
      .then(response => {
        const found = response.data.find(item => item.folio === folio.trim().toUpperCase()) ?? null;
        setCert(found);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(friendlyApiError(err));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [folio, reloadKey]);

  const goBack = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('receipt');
    window.location.assign(url.toString());
  };

  if (loading) {
    return (
      <div data-theme={theme} className="min-h-screen flex items-center justify-center bg-edumaster-ambient text-sm">
        Preparando comprobante...
      </div>
    );
  }

  if (!cert) {
    return (
      <div data-theme={theme} className="min-h-screen flex flex-col items-center justify-center gap-4 bg-edumaster-ambient p-6 text-center">
        <p className="text-sm text-rose-300 m-0">{error ?? `No se encontró el folio ${folio}.`}</p>
        {error ? (
          <button
            onClick={() => { setError(null); setLoading(true); setReloadKey(key => key + 1); }}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold"
          >
            Reintentar
          </button>
        ) : null}
        <button onClick={goBack} className="px-4 py-2 rounded-xl border border-white/20 text-xs font-bold">
          Volver a la aplicación
        </button>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="min-h-screen bg-edumaster-ambient p-4 sm:p-8 flex flex-col items-center gap-4">
      <div className="w-full max-w-2xl flex gap-2 print:hidden">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 text-xs font-bold hover:bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-200"
        >
          Guardar como PDF
        </button>
      </div>

      <article className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="m-0 font-mono text-[10px] tracking-[0.18em] uppercase text-teal-700">
              DEMO · registro sintético
            </p>
            <h1 className="text-2xl sm:text-3xl font-black m-0 mt-1">Certificado de finalización</h1>
            <p className="m-0 text-xs text-slate-500 mt-1">Folio {cert.folio} · {cert.status}</p>
          </div>
          {cert.qrDataUrl && (
            <img src={cert.qrDataUrl} alt={`QR de ${cert.folio}`} className="w-24 h-24 self-center" />
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-6 text-sm">
          <div><dt className="text-slate-500 text-xs">Estudiante</dt><dd className="font-bold m-0">{cert.student}</dd></div>
          <div><dt className="text-slate-500 text-xs">Curso</dt><dd className="font-bold m-0">{cert.course}</dd></div>
          <div><dt className="text-slate-500 text-xs">Fecha de emisión</dt><dd className="font-bold m-0">{formatDate(cert.issuedAt)}</dd></div>
          <div><dt className="text-slate-500 text-xs">Calificación</dt><dd className="font-bold m-0 text-teal-700">{cert.grade}</dd></div>
        </dl>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs break-all">
          <p className="m-0 font-mono">Hash SHA-256: {cert.hash}</p>
          <p className="m-0 font-mono mt-1">Verificación: {cert.verificationUrl}</p>
        </div>
        <p className="text-[11px] text-slate-500 mt-5 mb-0">
          Documento de demostración académica SENATI 4.º semestre. Los datos son sintéticos y no equivalen a un certificado oficial.
        </p>
      </article>
    </div>
  );
};
