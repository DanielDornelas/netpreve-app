// Funções de localização usadas pelo app (exportação nomeada).

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Distância em linha reta entre dois pontos (fórmula de Haversine), em km.
export function distanceKm(from, to) {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// A API não informa nomes de cidades, só coordenadas. Esta lista é do próprio app
// e serve apenas para dar um nome reconhecível à região de cada ponto de medição.
const REFERENCE_CITIES = [
  { name: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Belo Horizonte', latitude: -19.9167, longitude: -43.9345 },
  { name: 'Brasília', latitude: -15.7975, longitude: -47.8919 },
  { name: 'Salvador', latitude: -12.9714, longitude: -38.5014 },
  { name: 'Recife', latitude: -8.0476, longitude: -34.877 },
  { name: 'Fortaleza', latitude: -3.7172, longitude: -38.5434 },
  { name: 'Curitiba', latitude: -25.4284, longitude: -49.2733 },
  { name: 'Porto Alegre', latitude: -30.0346, longitude: -51.2177 },
  { name: 'Manaus', latitude: -3.119, longitude: -60.0217 },
];

const COUNTRY_NAMES = { BR: 'Brasil' };

// "Região de São Paulo" quando o ponto está a até 50 km de uma cidade da lista;
// senão, as coordenadas.
export function placeName(location) {
  const closest = REFERENCE_CITIES.reduce((best, city) => {
    const distance = distanceKm(location, city);
    return !best || distance < best.distance ? { city, distance } : best;
  }, null);
  if (closest && closest.distance <= 50) {
    return `Região de ${closest.city.name}`;
  }
  return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
}

export function countryName(code) {
  return COUNTRY_NAMES[code] || code;
}
