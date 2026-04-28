export class CleanFetchError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class CleanFetchConfigError extends CleanFetchError {}

export class CleanFetchCrawlError extends CleanFetchError {
  readonly status?: number;
  readonly responseBody?: string;

  constructor(message: string, details: { status?: number; responseBody?: string; cause?: unknown } = {}) {
    super(message, { cause: details.cause });
    this.status = details.status;
    this.responseBody = details.responseBody;
  }
}

export class CleanFetchCleanError extends CleanFetchError {
  readonly status?: number;

  constructor(message: string, details: { status?: number; cause?: unknown } = {}) {
    super(message, { cause: details.cause });
    this.status = details.status;
  }
}
