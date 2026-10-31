export function formatWeight(value, units = "kg") {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Not provided";
  }

  if (units === "lb") {
    return `${Math.round(numericValue * 2.20462)} lb`;
  }

  return `${numericValue} kg`;
}
