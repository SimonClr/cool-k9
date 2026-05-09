export function formatDogAge(birthDate: Date): string {
  const years = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000));
  return years <= 1 ? `${years} an` : `${years} ans`;
}
