// /lib/api.ts
import { Product, Cart } from '@/types';
import {
  LoginPayload,
  ActualLoginApiResponse,
  RegisterPayload,
  RegisterResponse,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface BackendValidationErrorItem {
  property: string;
  constraints: { [key: string]: string };
}

interface BackendErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[] | BackendValidationErrorItem[];
  error?: string;
}

// Interfaces de respuestas exitosas
interface ActualProductsApiResponse {
  status: string;
  data: Product[];
}

interface CartApiResponse {
  status: string;
  data: Cart;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    let errorData: BackendErrorResponse | string | undefined;

    try {
      errorData = (await response.json()) as BackendErrorResponse;
    } catch (jsonParseError) {
      console.warn(
        'Could not parse error response body as JSON:',
        jsonParseError
      );
    }

    if (errorData) {
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMsg = errorData.message
            .map((item: string | BackendValidationErrorItem) => {
              if (typeof item === 'string') {
                return item;
              }
              if (item.constraints) {
                return Object.values(item.constraints).join('. ');
              }
              return `Validation error: ${JSON.stringify(item)}`; //falback
            })
            .join('; ');
        } else {
          errorMsg = errorData.message;
        }
      } else if (errorData.error) {
        errorMsg = errorData.error;
      } else if (Array.isArray(errorData) && errorData.length > 0) {
        errorMsg = errorData
          .map((e: string | BackendValidationErrorItem) => {
            if (typeof e === 'string') return e;
            if (e.constraints) return Object.values(e.constraints).join('. ');
            return `Error: ${JSON.stringify(e)}`;
          })
          .join('; ');
      }
    }
    console.error(
      'API Error (parsed):',
      errorMsg,
      'Raw error data:',
      errorData
    );
    throw new Error(errorMsg);
  }
  try {
    return await response.json();
  } catch (e) {
    console.error('JSON Parsing Error (on success response?):', e);
    throw new Error('Error parsing server response');
  }
}

export async function getProducts(token: string | null): Promise<Product[]> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return [];
  }
  const url = `${API_BASE_URL}/api/product`;

  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    const fullResponse =
      await handleResponse<ActualProductsApiResponse>(response);
    if (fullResponse && Array.isArray(fullResponse.data)) {
      return fullResponse.data;
    } else {
      console.warn(
        'getProducts received unexpected response structure:',
        fullResponse
      );
      return [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  try {
    const url = `${API_BASE_URL}/api/product/filter?slug=${slug}`;

    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    // if (token) {
    //   headers.Authorization = `Bearer ${token}`;
    // }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    const fullResponse =
      await handleResponse<ActualProductsApiResponse>(response);
    if (
      fullResponse &&
      Array.isArray(fullResponse.data) &&
      fullResponse.data.length > 0
    ) {
      return fullResponse.data[0];
    } else {
      console.warn(
        `No product found with slug: ${slug} via /api/product/filter endpoint, or response structure was unexpected.`,
        fullResponse
      );
      return null;
    }
  } catch (error) {
    console.error(`Error in getProductBySlug for ${slug}:`, error);
    return null;
  }
}

export async function loginUser(
  payload: LoginPayload
): Promise<ActualLoginApiResponse> {
  if (!API_BASE_URL) throw new Error('API URL not configured.');
  const url = `${API_BASE_URL}/api/user/login`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse<ActualLoginApiResponse>(response);
  } catch (error) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;
    throw new Error(errorMessage);
  }
}

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  if (!API_BASE_URL) throw new Error('API URL not configured.');
  const url = `${API_BASE_URL}/api/user/register`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse<RegisterResponse>(response);
  } catch (error) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;
    throw new Error(errorMessage);
  }
}

export async function getCartById(
  cartId: number,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  if (!token) {
    console.warn('getCartById called without a token.');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/${cartId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error(`Error fetching cart with ID ${cartId}:`, error);
    return null;
  }
}

export async function getUserCart(
  userId: string,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  if (!token) {
    console.warn('getUserCart called without a token.');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error(`Error fetching cart for user ${userId}:`, error);
    return null;
  }
}

export async function createCart(
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  if (!token) {
    console.warn('createCart called without a token.');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/create`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error('Error creating cart:', error);
    return null;
  }
}

export async function addProductToCart(
  cartId: number,
  productId: number,
  quantity: number,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }
  if (!token) {
    console.warn('addProductToCart called without a token.');
    return null;
  }

  // Construir la URL con quantity como query parameter
  const url = `${API_BASE_URL}/api/cart/${cartId}/add/product/${productId}?quantity=${quantity}`;
  console.log(`addProductToCart: Calling PUT ${url}`);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error(
      `Error adding/updating product ${productId} (qty: ${quantity}) to cart ${cartId}:`,
      error
    );
    return null;
  }
}

export async function removeProductFromCart(
  cartId: number,
  productId: number,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  if (!token) {
    console.warn('removeProductFromCart called without a token.');
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/cart/${cartId}/delete/product/${productId}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error(
      `Error removing product ${productId} from cart ${cartId}:`,
      error
    );
    return null;
  }
}

export async function emptyCart(
  cartId: number,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  if (!token) {
    console.warn('emptyCart called without a token.');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/${cartId}/empty`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error(`Error emptying cart ${cartId}:`, error);
    return null;
  }
}
