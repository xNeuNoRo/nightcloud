/**
 * Convierte una cantidad de bytes (incluso BigInt o Strings gigantes) 
 * en una cadena legible por humanos.
 */
export default function getHumanFileSize(bytes: number | string | bigint, decimals: number = 2): string {
  // Convertimos a número flotante para manejar la división y logaritmos
  const value = Number(bytes);

  // Validaciones básicas
  if (value <= 0 || Number.isNaN(value)) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = Math.max(decimals, 0);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  // Calculamos el índice de la unidad (0 = Bytes, 1 = KB, etc.)
  const i = Math.floor(Math.log(value) / Math.log(k));

  // Prevenimos desbordamiento del array si el número es absurdamente grande
  if (i >= sizes.length) return '> YB'; 

  return `${Number.parseFloat((value / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}