export function formatCardMask(value, fallback = "Картка") {
  const text = Array.isArray(value) ? value[0] : value;
  const digits = String(text ?? "").replace(/\D/g, "");
  const lastFour = digits.slice(-4);

  return lastFour ? `•••• ${lastFour}` : fallback;
}
