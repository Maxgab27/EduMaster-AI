import type { CertificateRecord, CertificateVerification } from '../types';
import { requestWithDemo } from './apiClient';

const DEMO_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-1',
    folio: 'EDU-2026-98124',
    student: 'Carlos Mendoza Ramos',
    course: 'Especialista en Redes Neuronales & PyTorch MTL',
    issuedAt: '2026-11-12T00:00:00Z',
    grade: '19.4 / 20 (Sobresaliente)',
    hash: '9f83ab412c98d4e7b89f2a01',
    status: 'Emitido',
    verificationUrl: 'http://127.0.0.1:8000/api/v1/certificates/verify/EDU-2026-98124',
  },
  {
    id: 'cert-2',
    folio: 'EDU-2026-98125',
    student: 'Sofia Ramírez Vargas',
    course: 'Ingeniería de Características & DataOps',
    issuedAt: '2026-11-14T00:00:00Z',
    grade: '19.8 / 20 (Sobresaliente)',
    hash: '3e41ba980c55f11a88cb7402',
    status: 'Emitido',
    verificationUrl: 'http://127.0.0.1:8000/api/v1/certificates/verify/EDU-2026-98125',
  },
  {
    id: 'cert-3',
    folio: 'EDU-2026-98126',
    student: 'Mateo Vargas Quispe',
    course: 'MLOps: Despliegue con FastAPI y MLflow',
    issuedAt: '2026-11-15T00:00:00Z',
    grade: '18.2 / 20 (Notable)',
    hash: '6a11cd980f77e23b99ef8803',
    status: 'Emitido',
    verificationUrl: 'http://127.0.0.1:8000/api/v1/certificates/verify/EDU-2026-98126',
  },
];

/** QR ilustrativo y determinista para DEMO local; no es scannable. */
function demoQrSvg(value: string): string {
  let seed = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    seed = Math.imul(seed ^ value.charCodeAt(i), 16777619) >>> 0;
  }
  const size = 21;
  const cells: string[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if ((seed >>> 30) & 1) {
        cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 23 23" width="144" height="144" shape-rendering="crispEdges"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#0f172a">${cells.join('')}</g></svg>`;
}

function withDemoQr(cert: CertificateRecord): CertificateRecord {
  return { ...cert, qrSvg: cert.qrSvg ?? demoQrSvg(cert.verificationUrl) };
}

export function listCertificates(signal?: AbortSignal) {
  return requestWithDemo<CertificateRecord[]>(
    '/api/v1/certificates',
    { signal },
    () => DEMO_CERTIFICATES.map(withDemoQr),
  );
}

export function verifyCertificate(folio: string, signal?: AbortSignal) {
  return requestWithDemo<CertificateVerification>(
    `/api/v1/certificates/verify/${encodeURIComponent(folio)}`,
    { signal },
    () => {
      const cert = DEMO_CERTIFICATES.find(item => item.folio === folio.trim().toUpperCase());
      const verifiedAt = new Date().toISOString();
      if (!cert) {
        return {
          valid: false,
          folio,
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
        valid: cert.status === 'Emitido',
        folio: cert.folio,
        student: cert.student,
        course: cert.course,
        issuedAt: cert.issuedAt,
        grade: cert.grade,
        hash: cert.hash,
        status: cert.status,
        verifiedAt,
        message: 'DEMO · folio y hash coinciden con el registro sintético.',
      };
    },
  );
}
