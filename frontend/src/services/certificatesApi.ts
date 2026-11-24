import * as QRCode from 'qrcode';
import type { ApiResponse, CertificateRecord, CertificateVerification } from '../types';
import { requestCoreWithDemo } from './apiClient';

/**
 * Registro sintético de respaldo. Con VITE_CORE_API_BASE_URL configurado,
 * la lista y la verificación vienen de SQLite por HTTP; sin él se usa este
 * registro local, pero el QR sigue siendo escaneable y apunta a la misma SPA.
 */
const DEMO_CERTIFICATES: Omit<CertificateRecord, 'hash' | 'qrDataUrl'>[] = [
  {
    id: 'cert-1',
    folio: 'EDU-2026-98124',
    student: 'Carlos Mendoza Ramos',
    course: 'Especialista en Redes Neuronales & PyTorch MTL',
    issuedAt: '2026-11-12T00:00:00+00:00',
    grade: '19.4 / 20 (Sobresaliente)',
    status: 'Emitido',
    verificationUrl: '/?verify=EDU-2026-98124',
  },
  {
    id: 'cert-2',
    folio: 'EDU-2026-98125',
    student: 'Sofia Ramírez Vargas',
    course: 'Ingeniería de Características & DataOps',
    issuedAt: '2026-11-14T00:00:00+00:00',
    grade: '19.8 / 20 (Sobresaliente)',
    status: 'Emitido',
    verificationUrl: '/?verify=EDU-2026-98125',
  },
  {
    id: 'cert-3',
    folio: 'EDU-2026-98126',
    student: 'Mateo Vargas Quispe',
    course: 'MLOps: Despliegue con FastAPI y MLflow',
    issuedAt: '2026-11-15T00:00:00+00:00',
    grade: '18.2 / 20 (Notable)',
    status: 'Emitido',
    verificationUrl: '/?verify=EDU-2026-98126',
  },
];

/** Serialización canónica equivalente a json.dumps(sort_keys=True) del backend. */
function canonicalJson(payload: Record<string, string>): string {
  const members = Object.keys(payload)
    .sort()
    .map(key => `${JSON.stringify(key)}: ${JSON.stringify(payload[key])}`);
  return `{${members.join(', ')}}`;
}

function certificatePayload(cert: Pick<CertificateRecord, 'folio' | 'student' | 'course' | 'issuedAt' | 'grade'>) {
  return {
    folio: cert.folio,
    student: cert.student,
    course: cert.course,
    issuedAt: cert.issuedAt,
    grade: cert.grade,
  };
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function absoluteVerificationUrl(cert: CertificateRecord): string {
  const raw = cert.verificationUrl || `/?verify=${encodeURIComponent(cert.folio)}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return new URL(raw, window.location.origin).toString();
}

async function withQr(cert: CertificateRecord): Promise<CertificateRecord> {
  const verificationUrl = absoluteVerificationUrl(cert);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 192,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  return { ...cert, verificationUrl, qrDataUrl };
}

export async function listCertificates(signal?: AbortSignal): Promise<ApiResponse<CertificateRecord[]>> {
  const response = await requestCoreWithDemo<CertificateRecord[]>(
    '/api/v1/compat/certificates',
    { signal },
    async () => Promise.all(
      DEMO_CERTIFICATES.map(async cert => ({
        ...cert,
        hash: await sha256(canonicalJson(certificatePayload(cert))),
      })),
    ),
  );
  const data = await Promise.all(response.data.map(withQr));
  return { data, meta: response.meta };
}

export async function verifyCertificate(
  folio: string,
  signal?: AbortSignal,
): Promise<ApiResponse<CertificateVerification>> {
  const normalized = folio.trim().toUpperCase();
  return requestCoreWithDemo<CertificateVerification>(
    `/api/v1/compat/certificates/verify/${encodeURIComponent(normalized)}`,
    { signal },
    async () => {
      const cert = DEMO_CERTIFICATES.find(item => item.folio === normalized);
      const verifiedAt = new Date().toISOString();
      if (!cert) {
        return {
          valid: false,
          folio: normalized,
          student: '',
          course: '',
          issuedAt: '',
          grade: '',
          hash: '',
          status: 'No encontrado',
          verifiedAt,
          message: 'DEMO · folio no encontrado en el registro sintético.',
        };
      }
      return {
        ...cert,
        hash: await sha256(canonicalJson(certificatePayload(cert))),
        valid: cert.status === 'Emitido',
        verifiedAt,
        message: 'DEMO · folio encontrado en el registro sintético; sin API configurada.',
      };
    },
  );
}
