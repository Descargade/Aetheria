export function objectUrl(objectPath: string | null | undefined): string | null {
  if (!objectPath) return null;
  const clean = objectPath.replace(/^\/objects\//, "");
  return `/api/storage/objects/${clean}`;
}

export function publicObjectUrl(filePath: string | null | undefined): string | null {
  if (!filePath) return null;
  return `/api/storage/public-objects/${filePath}`;
}
