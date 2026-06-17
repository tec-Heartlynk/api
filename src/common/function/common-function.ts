export function calculateAge(dob?: Date | string | null): number | null {
  if (!dob) return null;

  const birthDate = new Date(dob);

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// ✅ Distance in KM
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(2));
}

// ✅ Get Compatibility Message
export function getCompatibilityMessage(score: number): string {
  if (score >= 90) {
    return 'Exceptional Alignment';
  } else if (score >= 80) {
    return 'Strong Compatibility';
  } else if (score >= 70) {
    return 'Very Promising';
  } else if (score >= 60) {
    return 'Moderate Potential';
  } else if (score >= 50) {
    return 'Challenging but Possible';
  } else {
    return 'High Friction Risk';
  }
}
