export function objectUrl(objectPath: string | null | undefined): string | null {
  if (!objectPath) return null;
  if (objectPath.startsWith("data:")) return objectPath;
  const clean = objectPath.replace(/^\/objects\//, "");
  return `/api/storage/objects/${clean}`;
}

export function publicObjectUrl(filePath: string | null | undefined): string | null {
  if (!filePath) return null;
  if (filePath.startsWith("data:")) return filePath;
  return `/api/storage/public-objects/${filePath}`;
}
