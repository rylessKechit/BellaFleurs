// src/lib/data/postalCodes.ts - Base de données des zones de livraison
export interface PostalCodeData {
  zipCode: string;
  city: string;
  population: number;
  distance: number;
  deliverable: boolean;
}

export const DELIVERY_ZONES: PostalCodeData[] = [
  // Zone 1: 1,7 - 4,5 km
  { zipCode: "91220", city: "Le Plessis-Pâté", population: 3928, distance: 1.7, deliverable: true },
  { zipCode: "91240", city: "Saint-Michel-sur-Orge", population: 20258, distance: 2.6, deliverable: true },
  { zipCode: "91310", city: "Leuville-sur-Orge", population: 4199, distance: 3.3, deliverable: true },
  { zipCode: "91700", city: "Sainte-Geneviève-des-Bois", population: 34320, distance: 3.6, deliverable: true },
  { zipCode: "91310", city: "Longpont-sur-Orge", population: 6631, distance: 3.9, deliverable: true },
  { zipCode: "91310", city: "Linas", population: 6334, distance: 4.0, deliverable: true },
  { zipCode: "91180", city: "Saint-Germain-lès-Arpajon", population: 9181, distance: 4.2, deliverable: true },
  { zipCode: "91310", city: "Montlhéry", population: 6645, distance: 4.2, deliverable: true },
  { zipCode: "91290", city: "La Norville", population: 4036, distance: 4.4, deliverable: true },
  { zipCode: "91700", city: "Fleury-Mérogis", population: 9205, distance: 4.5, deliverable: true },

  // Zone 2: 4,9 - 6,8 km
  { zipCode: "91290", city: "Arpajon", population: 9783, distance: 4.9, deliverable: true },
  { zipCode: "91630", city: "Guibeville", population: 748, distance: 5.0, deliverable: true },
  { zipCode: "91630", city: "Leudeville", population: 1295, distance: 5.1, deliverable: true },
  { zipCode: "91630", city: "Marolles-en-Hurepoix", population: 4787, distance: 5.3, deliverable: true },
  { zipCode: "91070", city: "Bondoufle", population: 9572, distance: 5.4, deliverable: true },
  { zipCode: "91700", city: "Villiers-sur-Orge", population: 3840, distance: 5.4, deliverable: true },
  { zipCode: "91810", city: "Vert-le-Grand", population: 2321, distance: 5.5, deliverable: true },
  { zipCode: "91620", city: "La Ville-du-Bois", population: 6886, distance: 6.4, deliverable: true },
  { zipCode: "91360", city: "Villemoisson-sur-Orge", population: 6964, distance: 6.4, deliverable: true },
  { zipCode: "91490", city: "Marcoussis", population: 7772, distance: 6.8, deliverable: true },

  // Zone 3: 6,8 - 7,7 km
  { zipCode: "91470", city: "Morsang-sur-Orge", population: 21884, distance: 6.8, deliverable: true },
  { zipCode: "91580", city: "Avrainville", population: 685, distance: 6.8, deliverable: true },
  { zipCode: "91400", city: "Ollainville", population: 4671, distance: 6.9, deliverable: true },
  { zipCode: "91170", city: "Égly", population: 5267, distance: 7.0, deliverable: true },
  { zipCode: "91630", city: "Cheptainville", population: 1790, distance: 7.2, deliverable: true },
  { zipCode: "91580", city: "Épinay-sur-Orge", population: 10234, distance: 7.3, deliverable: true },
  { zipCode: "91160", city: "Courcouronnes", population: 14595, distance: 7.4, deliverable: true },
  { zipCode: "91160", city: "Ballainvilliers", population: 3608, distance: 7.4, deliverable: true },
  { zipCode: "91830", city: "Nozay", population: 4766, distance: 7.4, deliverable: true },
  { zipCode: "91940", city: "Vert-le-Petit", population: 2560, distance: 7.7, deliverable: true },

  // Zone 4: 7,8 - 9,6 km
  { zipCode: "91270", city: "Saint-Vrain", population: 2825, distance: 7.8, deliverable: true },
  { zipCode: "91600", city: "Savigny-sur-Orge", population: 37623, distance: 7.9, deliverable: true },
  { zipCode: "91350", city: "Grigny", population: 26131, distance: 7.9, deliverable: true },
  { zipCode: "91170", city: "Viry-Châtillon", population: 31626, distance: 8.3, deliverable: true },
  { zipCode: "91290", city: "Écharcon", population: 716, distance: 8.7, deliverable: true },
  { zipCode: "91740", city: "Bruyères-le-Châtel", population: 3140, distance: 8.7, deliverable: true },
  { zipCode: "91090", city: "Lisses", population: 7001, distance: 8.8, deliverable: true },
  { zipCode: "91360", city: "Ris-Orangis", population: 26813, distance: 9.0, deliverable: true },
  { zipCode: "91800", city: "Boissy-sous-Saint-Yon", population: 3680, distance: 9.4, deliverable: true },
  { zipCode: "91540", city: "Fontenay-le-Vicomte", population: 1234, distance: 9.6, deliverable: true },

  // Zone 5: 9,7 - 10,0 km (limite)
  { zipCode: "91160", city: "Villejust", population: 2079, distance: 9.7, deliverable: true },
  { zipCode: "91160", city: "Saulx-les-Chartreux", population: 4938, distance: 9.7, deliverable: true },
  { zipCode: "91160", city: "Longjumeau", population: 21177, distance: 9.8, deliverable: true },
  { zipCode: "91590", city: "Bouray-sur-Juine", population: 1943, distance: 10.0, deliverable: true }
];

// Helper pour rechercher par code postal
export const findCityByPostalCode = (zipCode: string): PostalCodeData | null => {
  const normalizedZipCode = zipCode.trim().replace(/\s+/g, '');
  return DELIVERY_ZONES.find(zone => zone.zipCode === normalizedZipCode) || null;
};

// Helper pour vérifier si une zone est livrable
export const isDeliverable = (zipCode: string): boolean => {
  const zone = findCityByPostalCode(zipCode);
  return zone ? zone.deliverable : false;
};

// Helper pour obtenir toutes les villes livrables
export const getDeliverableCities = (): string[] => {
  return DELIVERY_ZONES
    .filter(zone => zone.deliverable)
    .map(zone => zone.city)
    .sort();
};

// Helper pour obtenir tous les codes postaux livrables
export const getDeliverablePostalCodes = (): string[] => {
  return DELIVERY_ZONES
    .filter(zone => zone.deliverable)
    .map(zone => zone.zipCode);
};