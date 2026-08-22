// Error handling utility for API calls
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new APIError(
        `API Error: ${response.statusText}`,
        response.status,
        await response.text().catch(() => null)
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}