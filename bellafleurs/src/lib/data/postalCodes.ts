// src/lib/data/postalCodes.ts - Base de données des zones de livraison

export interface PostalCodeData {
  zipCode: string;
  cities: string[];
}

// Liste des codes postaux et villes où on livre
export const DELIVERY_ZONES: PostalCodeData[] = [
  { zipCode: "91220", cities: ["Le Plessis-Pâté", "Brétigny-sur-Orge"] },
  { zipCode: "91240", cities: ["Saint-Michel-sur-Orge"] },
  { zipCode: "91310", cities: ["Leuville-sur-Orge", "Longpont-sur-Orge", "Linas", "Montlhéry"] },
  { zipCode: "91700", cities: ["Sainte-Geneviève-des-Bois", "Fleury-Mérogis"] },
  { zipCode: "91180", cities: ["Saint-Germain-lès-Arpajon"] },
  { zipCode: "91290", cities: ["La Norville", "Arpajon"] },
  { zipCode: "91630", cities: ["Guibeville"] },
];

// Fonction pour trouver les données d'un code postal
export const findCityByPostalCode = (zipCode: string): PostalCodeData | null => {
  return DELIVERY_ZONES.find(data => data.zipCode === zipCode) || null;
};

// Fonction pour trouver les villes d'un code postal
export const findCitiesByPostalCode = (zipCode: string): string[] => {
  const found = findCityByPostalCode(zipCode);
  return found ? found.cities : [];
};

// Fonction pour vérifier si on livre dans ce code postal
export const isDeliverable = (zipCode: string): boolean => {
  return DELIVERY_ZONES.some(data => data.zipCode === zipCode);
};