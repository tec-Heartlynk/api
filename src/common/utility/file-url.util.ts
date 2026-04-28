export function mapFileUrls(data: any, baseUrl: string, uploadPath: string) {
  if (!data) return data;

  const buildUrl = (file: string) => `${baseUrl}/${uploadPath}/${file}`;

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

export function hasFileField(data: any): boolean {
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.some((item) => hasFileField(item));
  }

  if (typeof data === 'object') {
    for (const key in data) {
      if (
        key === 'photos' ||
        key === 'image' ||
        key === 'avatar' ||
        key === 'file'
      ) {
        return true;
      }

      if (typeof data[key] === 'object') {
        if (hasFileField(data[key])) return true;
      }
    }
  }

  return false;
}
