export default function capitalizeFirstLetter(str: string) {
  // Handle empty or non-string inputs
  if (!str || typeof str !== 'string') {
    return str;
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}
