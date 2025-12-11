// Utilitaires de validation pour les formulaires de deuil
export interface DeuilValidationErrors {
  defuntName?: string;
  senderName?: string;
  condolenceMessage?: string;
}

export interface DeuilInfo {
  isDeuil: boolean;
  defuntName: string;
  condolenceMessage: string;
  senderName: string;
}

export function validateDeuilForm(deuilInfo: DeuilInfo): DeuilValidationErrors {
  const errors: DeuilValidationErrors = {};
  
  // Validation nom du défunt
  if (!deuilInfo.defuntName || deuilInfo.defuntName.trim().length < 2) {
    errors.defuntName = 'Le nom du défunt est obligatoire (minimum 2 caractères)';
  } else if (deuilInfo.defuntName.trim().length > 100) {
    errors.defuntName = 'Le nom du défunt ne peut pas dépasser 100 caractères';
  }
  
  // Validation nom de l'expéditeur
  if (!deuilInfo.senderName || deuilInfo.senderName.trim().length < 2) {
    errors.senderName = 'Votre nom est obligatoire (minimum 2 caractères)';
  } else if (deuilInfo.senderName.trim().length > 100) {
    errors.senderName = 'Votre nom ne peut pas dépasser 100 caractères';
  }
  
  // Validation message de condoléances
  if (!deuilInfo.condolenceMessage || deuilInfo.condolenceMessage.trim().length < 10) {
    errors.condolenceMessage = 'Un message de condoléances est obligatoire (minimum 10 caractères)';
  } else if (deuilInfo.condolenceMessage.trim().length > 500) {
    errors.condolenceMessage = 'Le message ne peut pas dépasser 500 caractères';
  }
  
  return errors;
}

export function hasDeuilValidationErrors(errors: DeuilValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Fonction pour combiner les informations de deuil avec les données de commande
export function formatDeuilDataForOrder(deuilInfo: DeuilInfo) {
  if (!deuilInfo.isDeuil) return null;
  
  const senderName = deuilInfo.senderName.trim() || 'Anonyme'; // ✅ Fallback
  
  return {
    isDeuil: true,
    defuntName: deuilInfo.defuntName.trim(),
    condolenceMessage: deuilInfo.condolenceMessage.trim(),
    senderName: senderName, // ✅ Jamais vide
    isGift: true,
    recipientFirstName: '',
    recipientLastName: deuilInfo.defuntName.trim(),
    message: deuilInfo.senderName.trim() 
      ? `De la part de ${deuilInfo.senderName.trim()}: ${deuilInfo.condolenceMessage.trim()}`
      : deuilInfo.condolenceMessage.trim() // ✅ Juste le message si pas de nom
  };
}

// Messages par défaut pour les arrangements funéraires
export const DEUIL_DEFAULT_MESSAGES = [
  'Nos plus sincères condoléances en cette douloureuse épreuve.',
  'Nous partageons votre peine et vous adressons toutes nos condoléances.',
  'En cette pénible circonstance, nous vous présentons nos condoléances les plus attristées.',
  'Nous tenons à vous faire part de notre profonde sympathie.',
  'Toutes nos pensées vous accompagnent dans cette épreuve.'
];

export function getDeuilMessageSuggestion(): string {
  return DEUIL_DEFAULT_MESSAGES[Math.floor(Math.random() * DEUIL_DEFAULT_MESSAGES.length)];
}