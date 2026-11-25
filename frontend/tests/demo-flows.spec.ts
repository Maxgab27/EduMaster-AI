import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

function consoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

test('notificaciones: filtrar, marcar todas y persistir', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');

  await expect(page.getByText(/DATOS LOCALES DEMO · SIN API/)).toBeVisible();
  await page.getByRole('button', { name: /^Notificaciones/ }).click();
  await expect(page.getByText('Notificaciones de Dominio')).toBeVisible();
  await page.getByRole('button', { name: /^Sin leer/ }).click();
  await page.getByRole('button', { name: 'Marcar todas' }).click();

  await expect(page.getByText(/0 sin leer/)).toBeVisible();
  const readAllAt = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('edumaster_demo_v1') || '{}');
    return state.notificationReadAllAt;
  });
  expect(readAllAt).toBeTruthy();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Notificaciones', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('preferencias: Topbar y Configuración comparten el mismo guardado', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');

  await page.getByRole('button', { name: /^Notificaciones/ }).click();
  await page.getByRole('button', { name: 'Activadas' }).click();
  await expect(page.getByText('Guardado en este navegador · DEMO')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desactivadas' })).toBeVisible();

  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  await expect(page.getByLabel('Notificaciones en la aplicación')).not.toBeChecked();
  await expect(page.getByText('DEMO · sin API /api/v1 · datos locales')).toBeVisible();
  expect(errors).toEqual([]);
});

test('respaldo DEMO: exportar e importar JSON sin perder estado', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar datos DEMO' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^edumaster-demo-\d{4}-\d{2}-\d{2}\.json$/);

  const path = await download.path();
  expect(path).not.toBeNull();
  const json = await readFile(path!, 'utf8');
  expect(JSON.parse(json).kind).toBe('edumaster-demo-snapshot');

  await page.locator('input[aria-label="Archivo de respaldo DEMO"]').setInputFiles({
    name: 'edumaster-demo.json',
    mimeType: 'application/json',
    buffer: Buffer.from(json),
  });
  await expect(page.getByText(/Datos DEMO importados: \d+ claves/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recargar ahora' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('comunidad: enviar mensaje y recibir respuesta simulada etiquetada', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Comunidad', exact: true }).click();

  const input = page.getByPlaceholder('Escribe un mensaje… (Enter envía, Shift+Enter salto)');
  await input.fill('Mensaje E2E DEMO');
  await input.press('Enter');

  await expect(page.getByText('Mensaje E2E DEMO')).toBeVisible();
  await expect(page.getByText('DEMO · SIMULADO').first()).toBeVisible();
  const actions = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('edumaster_demo_v1') || '{}');
    return (state.auditLogs || []).map((log: { action: string }) => log.action);
  });
  expect(actions).toContain('community.message.posted');
  expect(actions).toContain('community.message.simulated');
  expect(errors).toEqual([]);
});

test('tutor IA: sugerencia, respuesta con peso DEMO y fuente clicable', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'IA Tutor', exact: true }).click();

  await page.getByRole('button', { name: '¿Cómo se calcula el riesgo de abandono?' }).click();
  await expect(page.getByLabel('Pregunta al tutor')).toHaveValue('¿Cómo se calcula el riesgo de abandono?');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();

  await expect(page.getByText(/Peso regla DEMO: 86%/)).toBeVisible();
  const source = page.getByRole('button', { name: 'Guardrails del modelo' }).first();
  await source.click();
  await expect(page.getByText(/Referencia DEMO: Guardrails del modelo/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('SpeedGrader: validar feedback y mostrar comprobante de firma DEMO', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');

  await page.getByRole('button', { name: /Dra\. López/ }).click();
  await page.getByRole('button', { name: /Docente \/ Instructor/ }).click();
  await page.getByRole('button', { name: 'Resumen', exact: true }).click();
  await page.getByRole('button', { name: 'Calificar con rúbrica' }).first().click();

  await expect(page.getByText(/X-Actor enviado: Dr\. Alejandro Morales · docente/)).toBeVisible();
  await page.getByLabel('Firma docente').fill('Dr. Alejandro Morales');
  const feedback = page.locator('textarea').first();
  await feedback.fill('OK');
  await expect(page.getByRole('button', { name: /Firmar y publicar nota/ })).toBeDisabled();

  await feedback.fill('Cubre escalado, shapes y complejidad con tipado claro.');
  await page.getByRole('button', { name: /Firmar y publicar nota/ }).click();

  await expect(page.getByText('Comprobante de firma')).toBeVisible();
  await expect(page.getByText(/SHA-256: no disponible en DEMO local/)).toBeVisible();
  await expect(page.getByText(/audit_log_id: no disponible en DEMO local/)).toBeVisible();
  await expect(page.getByText(/actor_source: body_unverified \(DEMO\)/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('CSV: descargas reales de auditoría y analítica', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Gobierno & Ley 29733', exact: true }).click();
  await page.getByRole('button', { name: 'Registro de Auditoría' }).click();
  const auditDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar auditoría a CSV' }).click();
  const audit = await auditDownload;
  expect(audit.suggestedFilename()).toMatch(/^auditoria-\d{4}-\d{2}-\d{2}\.csv$/);

  await page.getByRole('button', { name: 'Análisis', exact: true }).click();
  const analyticsDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const analytics = await analyticsDownload;
  expect(analytics.suggestedFilename()).toMatch(/^analitica-.*-\d{4}-\d{2}-\d{2}\.csv$/);

  const actions = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('edumaster_demo_v1') || '{}');
    return (state.auditLogs || []).map((log: { action: string }) => log.action);
  });
  expect(actions).toContain('audit.export_csv');
  expect(actions).toContain('analytics.export_csv');
  expect(errors).toEqual([]);
});
