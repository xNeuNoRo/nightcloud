import cron from "node-cron";

import { cleanupTmpUploads } from "../cleanup/tmpUploads.cleanup.js";

// Intervalo de limpieza de archivos temporales (por defecto, cada hora)
const CLEANUP_INTERVAL =
  Number(process.env.CLOUD_TMP_CLEANUP_INTERVAL_MS) || 3600000; // 1 hora default

// Expresión cron para el intervalo de limpieza
const CLEANUP_INTERVAL_CRON = `*/${CLEANUP_INTERVAL / 60000} * * * *`;

export function startInfraCronJobs() {
  // Programar la tarea de limpieza de archivos temporales
  cron.schedule(CLEANUP_INTERVAL_CRON, async () => {
    await cleanupTmpUploads();
  });
}
