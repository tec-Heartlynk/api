export function mapFileUrls(data: any, baseUrl: string, uploadPath: string) {
  if (!data) return data;

  const buildUrl = (file: string) => `${baseUrl}/${uploadPath}/profile/${file}`;

  // single object
  if (data.photos && Array.isArray(data.photos)) {
    data.photos = data.photos.map(buildUrl);
  }

  // array of objects
  if (Array.isArray(data)) {
    return data.map((item) => mapFileUrls(item, baseUrl, uploadPath));
  }

  return data;
}
export function hasFileField(
  value: any,
  visited: WeakSet<object> = new WeakSet(),
): boolean {
  // primitive/null
  if (value === null || value === undefined) {
    return false;
  }

  // non-object
  if (typeof value !== 'object') {
    return false;
  }

  // circular protection
  if (visited.has(value)) {
    return false;
  }

  visited.add(value);

  // array
  if (Array.isArray(value)) {
    return value.some((item) => hasFileField(item, visited));
  }

  // object
  for (const key of Object.keys(value)) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes('file') ||
      lowerKey.includes('image')
    ) {
      return true;
    }

    if (hasFileField(value[key], visited)) {
      return true;
    }
  }

  return false;
}
