export function getApiBase(): string {
  const explicit = process.env["EXPO_PUBLIC_API_BASE_URL"]?.trim();
  if (explicit && !explicit.includes("10.0.2.2")) return explicit.replace(/\/$/, "");
  return "http://192.168.100.5:8080/api";
}
