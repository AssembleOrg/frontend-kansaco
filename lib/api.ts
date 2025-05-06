// /lib/api.ts
import { Product, Cart } from '@/types';
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

// Interfaces para el carrito
interface CartApiResponse {
  status: string;
  data: Cart;
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

// Implementación de getProductBySlug
export async function getProductBySlug(
  slug: string,
  token: string | null
): Promise<Product | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  // Si no hay token, no podemos hacer la solicitud
  if (!token) {
    console.warn('getProductBySlug called without a token.');
    return null;
  }

  try {
    // Paso 1: Obtener todos los productos
    const allProducts = await getProducts(token);
    if (!allProducts || allProducts.length === 0) {
      console.warn('No products found');
      return null;
    }

    // Paso 2: Buscar el producto con el slug especificado
    const productWithSlug = allProducts.find((p) => p.slug === slug);
    if (!productWithSlug) {
      console.warn(`No product found with slug: ${slug}`);
      return null;
    }

    // Paso 3: Si es necesario, obtener detalles adicionales usando el ID
    // En este caso, como ya tenemos todos los datos del producto, podemos devolverlo directamente
    // Si necesitáramos más detalles, haríamos una solicitud a /api/product/{id}

    /* 
    // Código para obtener detalles por ID si es necesario
    const productId = productWithSlug.id;
    const detailUrl = `${API_BASE_URL}/api/product/${productId}`;
    const detailResponse = await fetch(detailUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    
    const productDetail = await handleResponse(detailResponse);
    return productDetail;
    */

    // Devolvemos el producto encontrado
    console.log(`Found product with slug ${slug}: ID=${productWithSlug.id}`);
    return productWithSlug;
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

// Funciones de carrito
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
  quantity: number = 1,
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

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/cart/${cartId}/add/product/${productId}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
        cache: 'no-store',
      }
    );

    return await handleResponse<CartApiResponse>(response);
  } catch (error) {
    console.error(
      `Error adding product ${productId} to cart ${cartId}:`,
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
