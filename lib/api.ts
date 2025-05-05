// /lib/api.ts
import { Product } from '@/types';
import {
  LoginPayload,
  ActualLoginApiResponse,
  RegisterPayload,
  RegisterResponse,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ActualProductsApiResponse {
  status: string;
  data: Product[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && (errorData.message || errorData.error)) {
        errorMsg = errorData.message || errorData.error;
      }
    } catch (jsonParseError) {
      console.warn('Could not parse error response body:', jsonParseError);
    }
    console.error('API Error:', errorMsg);
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

  if (!token) {
    console.warn('getProducts called without a token.');
    return [];
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const fullResponse =
      await handleResponse<ActualProductsApiResponse>(response); //
    if (fullResponse && Array.isArray(fullResponse.data)) {
      console.log(
        `getProducts returning ${fullResponse.data.length} products from data array.`
      );
      return fullResponse.data; // Devuelve SOLO el array de productos
    } else {
      console.warn(
        'getProducts received unexpected response structure:',
        fullResponse
      );
      return []; // Devuelve vacío si la estructura no es la esperada
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

//Falta aplicar slug
// export async function getProductBySlug(slug: string): Promise<Product | null> {
//   if (!API_BASE_URL) return null;
//   const url = `${API_BASE_URL}/producto/slug/${slug}`;
//   try {
//     const response = await fetch(url, { cache: 'no-store' });
//     return await handleResponse<Product>(response);
//   } catch (error) {
//     console.log(`Error in getProductBySlug for ${slug}:`, error);
//     return null;
//   }
// }

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
  console.log(`Attempting registration to: ${url}`);

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
