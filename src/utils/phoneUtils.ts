/**
 * Mascara parcialmente um número de telefone para privacidade
 * Exemplo: (47) 99999-9999 -> (47) 9****-**99
 * @param phone - Número de telefone a ser mascarado
 * @returns Número de telefone mascarado
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se o número tem menos de 8 dígitos, não mascara
  if (cleanPhone.length < 8) {
    return phone;
  }
  
  // Para números com DDD (10 ou 11 dígitos)
  if (cleanPhone.length >= 10) {
    const ddd = cleanPhone.substring(0, 2);
    const firstDigit = cleanPhone.substring(2, 3);
    const lastTwoDigits = cleanPhone.substring(cleanPhone.length - 2);
    
    // Calcula quantos asteriscos usar no meio
    const middleLength = cleanPhone.length - 5; // 2 (DDD) + 1 (primeiro) + 2 (últimos)
    const asterisks = '*'.repeat(middleLength);
    
    return `(${ddd}) ${firstDigit}${asterisks}-**${lastTwoDigits}`;
  }
  
  // Para números menores (8-9 dígitos)
  const firstDigit = cleanPhone.substring(0, 1);
  const lastTwoDigits = cleanPhone.substring(cleanPhone.length - 2);
  const middleLength = cleanPhone.length - 3;
  const asterisks = '*'.repeat(middleLength);
  
  return `${firstDigit}${asterisks}${lastTwoDigits}`;
};

/**
 * Formata um número de telefone para exibição
 * @param phone - Número de telefone
 * @returns Número formatado
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
  }
  
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6)}`;
  }
  
  return phone;
};

/**
 * Extrai o telefone de contato do imóvel
 * @param property - Objeto do imóvel
 * @returns Número de telefone do contato
 */
export const getPropertyPhone = (property: any): string => {
  // Primeiro verifica se há telefone específico do imóvel
  if (property.telefoneContato) {
    return property.telefoneContato;
  }
  
  // Se o owner é um objeto com phone
  if (property.ownerId && typeof property.ownerId === 'object' && property.ownerId.phone) {
    return property.ownerId.phone;
  }
  
  // Se há um objeto contact (usado em PropertyDetails)
  if (property.contact && property.contact.phone) {
    return property.contact.phone;
  }
  
  // Retorna string vazia se não encontrar telefone
  return '';
};