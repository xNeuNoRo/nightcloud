/**
 * Remueve los caracteres especiales de expresiones regulares de una cadena.
 * @param str cadena a remover caracteres especiales de regex
 * @returns cadena con caracteres especiales removidos
 */
export function escapeRegex(str: string) {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
