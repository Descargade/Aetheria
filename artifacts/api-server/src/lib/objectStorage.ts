export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  async getObjectEntityUploadURL(): Promise<string> {
    return "";
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return rawPath;
  }

  async getObjectEntityFile(_objectPath: string): Promise<never> {
    throw new ObjectNotFoundError();
  }

  async getSignedUrlForFile(_file: never): Promise<string> {
    throw new Error("Not supported");
  }
}

