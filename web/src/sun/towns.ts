// Towns to pick when the phone's position is not used (D-056): spread over the country, so a
// pick is never far off (the time changes by about 4 minutes per degree east or west). Centre
// points from OpenStreetMap (Nominatim, 2026-11-06), rounded to 0.01°.

export interface Town {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const TOWNS: Town[] = [
  { id: 'aalborg', name: 'Aalborg', lat: 57.05, lon: 9.92 },
  { id: 'aarhus', name: 'Aarhus', lat: 56.15, lon: 10.21 },
  { id: 'esbjerg', name: 'Esbjerg', lat: 55.47, lon: 8.45 },
  { id: 'frederikshavn', name: 'Frederikshavn', lat: 57.44, lon: 10.53 },
  { id: 'gedser', name: 'Gedser', lat: 54.58, lon: 11.93 },
  { id: 'herning', name: 'Herning', lat: 56.14, lon: 8.97 },
  { id: 'holbaek', name: 'Holbæk', lat: 55.72, lon: 11.71 },
  { id: 'koebenhavn', name: 'København', lat: 55.69, lon: 12.57 },
  { id: 'naestved', name: 'Næstved', lat: 55.23, lon: 11.77 },
  { id: 'odense', name: 'Odense', lat: 55.4, lon: 10.39 },
  { id: 'ringkoebing', name: 'Ringkøbing', lat: 56.09, lon: 8.25 },
  { id: 'roenne', name: 'Rønne', lat: 55.1, lon: 14.71 },
  { id: 'skagen', name: 'Skagen', lat: 57.73, lon: 10.58 },
  { id: 'soenderborg', name: 'Sønderborg', lat: 54.91, lon: 9.79 },
  { id: 'thisted', name: 'Thisted', lat: 56.96, lon: 8.68 },
];

export const townById = (id: string) => TOWNS.find((t) => t.id === id) ?? null;
