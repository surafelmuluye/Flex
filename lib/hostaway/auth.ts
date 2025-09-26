import log from '@/lib/logger';

// Hostaway API configuration
export const HOSTAWAY_CONFIG = {
  baseUrl: 'https://api.hostaway.com/v1',
  accountId: process.env.HOSTAWAY_ACCOUNT_ID!,
  apiKey: process.env.HOSTAWAY_API_KEY!
};

interface AccessTokenResponse {
  status: string;
  result: {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
}

interface CachedToken {
  access_token: string;
  expires_at: number;
}

// In-memory token cache (in production, consider using Redis or database)
let tokenCache: CachedToken | null = null;

/**
 * Get a valid access token for Hostaway API
 * Uses cached token if still valid, otherwise fetches a new one
 */
export async function getHostawayAccessToken(): Promise<string> {
  try {
    // Check if we have a valid cached token
    if (tokenCache && tokenCache.expires_at > Date.now()) {
      log.debug('Using cached Hostaway access token');
      return tokenCache.access_token;
    }

    log.info('Fetching new Hostaway access token', {
      accountId: HOSTAWAY_CONFIG.accountId,
      timestamp: new Date().toISOString()
    });

    // Fetch new access token using form data
    const formData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: HOSTAWAY_CONFIG.accountId,
      client_secret: HOSTAWAY_CONFIG.apiKey,
      scope: 'general'
    });

    log.debug('Attempting to get Hostaway access token', {
      endpoint: `${HOSTAWAY_CONFIG.baseUrl}/accessTokens`,
      accountId: HOSTAWAY_CONFIG.accountId,
      hasApiKey: !!HOSTAWAY_CONFIG.apiKey
    });

    const response = await fetch(`${HOSTAWAY_CONFIG.baseUrl}/accessTokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: formData,
      next: { revalidate: 0 } // Don't cache token requests
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let accessToken: string;
    let expiresIn: number;
    
    if (data.access_token) {
      // Direct access token in response
      accessToken = data.access_token;
      expiresIn = data.expires_in || (12 * 30 * 24 * 60 * 60); // 12 months default
    } else if (data.result?.access_token) {
      // Wrapped in result object
      accessToken = data.result.access_token;
      expiresIn = data.result.expires_in || (12 * 30 * 24 * 60 * 60);
    } else {
      throw new Error(`Invalid access token response from Hostaway API: ${JSON.stringify(data)}`);
    }

    // Cache the token (expires in 24 months, but we'll refresh every 12 months)
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    tokenCache = {
      access_token: accessToken,
      expires_at: expiresAt
    };

    log.info('Successfully obtained Hostaway access token', {
      expiresIn: expiresIn,
      expiresAt: new Date(expiresAt).toISOString(),
      tokenLength: accessToken.length
    });

    return accessToken;

  } catch (error) {
    log.error('Failed to get Hostaway access token', {
      error: error instanceof Error ? error.message : String(error),
      accountId: HOSTAWAY_CONFIG.accountId,
      baseUrl: HOSTAWAY_CONFIG.baseUrl
    });
    throw error;
  }
}

/**
 * Make an authenticated request to Hostaway API
 */
export async function makeHostawayRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    const accessToken = await getHostawayAccessToken();
    
    const url = endpoint.startsWith('http') ? endpoint : `${HOSTAWAY_CONFIG.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    });

    return response;

  } catch (error) {
    log.error('Hostaway API request failed', {
      error: error instanceof Error ? error.message : String(error),
      endpoint,
      method: options.method || 'GET'
    });
    throw error;
  }
}

/**
 * Clear the cached token (useful for testing or when token is invalid)
 */
export function clearTokenCache(): void {
  tokenCache = null;
  log.debug('Cleared Hostaway token cache');
}
