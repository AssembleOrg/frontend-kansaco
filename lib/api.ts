// /lib/api.ts
import { Product, Cart } from '@/types';
import {
  LoginPayload,
  LoginApiResponse,
  RegisterPayload,
  RegisterApiResponse,
} from '@/types/auth';
import { logger, apiLogger } from './logger';

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
    logger.error(
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
    logger.error('JSON Parsing Error (on success response?):', e);
    throw new Error('Error parsing server response');
  }
}

export async function getProducts(token: string | null): Promise<Product[]> {
  if (!API_BASE_URL) {
    logger.error('API URL not configured. Using fallback mock products.');
    return getMockProducts();
  }
  const url = `${API_BASE_URL}/product`;

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
      logger.warn(
        'getProducts received unexpected response structure, using fallback:',
        fullResponse
      );
      return getMockProducts();
    }
  } catch (error) {
    logger.error('Error fetching products (Railway might be down), using fallback:', error);
    return getMockProducts();
  }
}

// Mock products for demo purposes when API is not available or user is not authenticated
function getMockProducts(): Product[] {
  return [
    {
      id: 1,
      name: 'KANSACO Sintético 5W-30',
      sku: 'KAN-SIN-5W30-4L',
      slug: 'kansaco-sintetico-5w30',
      category: ['Sintéticos', 'Aceites para Motor'],
      description: 'Aceite sintético de alta performance para motores modernos con tecnología Polymer\'s Protection Film',
      presentation: '4L',
      aplication: 'Motores de gasolina modernos, turbo, híbridos',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 50,
      isVisible: true,
      price: 8500,
    },
    {
      id: 2,
      name: 'KANSACO Diesel Heavy Line 15W-40',
      sku: 'KAN-DIE-15W40-20L',
      slug: 'kansaco-diesel-heavy-15w40',
      category: ['Industrial', 'Diesel Heavy Line'],
      description: 'Lubricante especializado para motores diesel pesados con máxima protección',
      presentation: '20L',
      aplication: 'Motores diesel industriales, camiones, ómnibus',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 25,
      isVisible: true,
      price: 12000,
    },
    {
      id: 3,
      name: 'KANSACO Polymer Protection Film',
      sku: 'KAN-POL-PROT-500ML',
      slug: 'kansaco-polymer-protection-film',
      category: ['Derivados Y Aditivos'],
      description: 'El orgullo de nuestra empresa. Film de protección polimérica exclusivo',
      presentation: '500ml',
      aplication: 'Protección de superficies metálicas en motores',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 30,
      isVisible: true,
      price: 15000,
    },
    {
      id: 4,
      name: 'KANSACO Premium 10W-40',
      sku: 'KAN-PREM-10W40-4L',
      slug: 'kansaco-premium-10w40',
      category: ['Premium', 'Aceites para Motor'],
      description: 'Aceite semi-sintético de alto rendimiento para uso comercial',
      presentation: '4L',
      aplication: 'Vehículos familiares, flotas comerciales, taxis',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 40,
      isVisible: true,
      price: 6500,
    },
    {
      id: 5,
      name: 'KANSACO Mineral 20W-50',
      sku: 'KAN-MIN-20W50-4L',
      slug: 'kansaco-mineral-20w50',
      category: ['Minerales', 'Aceites para Motor'],
      description: 'Aceite mineral de calidad premium para servicios severos',
      presentation: '4L',
      aplication: 'Vehículos de alto kilometraje, uso intensivo',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 60,
      isVisible: true,
      price: 4500,
    },
    {
      id: 6,
      name: 'KANSACO Moto 4T 10W-40',
      sku: 'KAN-MOTO-4T-10W40-1L',
      slug: 'kansaco-moto-4t-10w40',
      category: ['Motos', 'Aceites para Motor'],
      description: 'Aceite especial para motocicletas 4 tiempos con embrague húmedo',
      presentation: '1L',
      aplication: 'Motocicletas 4 tiempos, scooters, ATVs',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 35,
      isVisible: true,
      price: 3200,
    },
    {
      id: 7,
      name: 'KANSACO Grasa Multipropósito NLGI 2',
      sku: 'KAN-GRASA-MP-NLGI2-500G',
      slug: 'kansaco-grasa-multiproposito-nlgi2',
      category: ['Grasas', 'Lubricantes'],
      description: 'Grasa de litio complejo para múltiples aplicaciones industriales',
      presentation: '500g',
      aplication: 'Rodamientos, chassis, equipos industriales',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 45,
      isVisible: true,
      price: 2800,
    },
    {
      id: 8,
      name: 'KANSACO Náutico 25W-40',
      sku: 'KAN-NAUT-25W40-4L',
      slug: 'kansaco-nautico-25w40',
      category: ['Náutica', 'Aceites Marinos'],
      description: 'Aceite marino especializado resistente al ambiente salino',
      presentation: '4L',
      aplication: 'Motores marinos, embarcaciones, equipos portuarios',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 20,
      isVisible: true,
      price: 9500,
    },
    {
      id: 9,
      name: 'KANSACO Competición 0W-20',
      sku: 'KAN-COMP-0W20-4L',
      slug: 'kansaco-competicion-0w20',
      category: ['Competición', 'Aceites para Motor'],
      description: 'Aceite de competición para máximo rendimiento en pista',
      presentation: '4L',
      aplication: 'Motores de carrera, track days, alto rendimiento',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 15,
      isVisible: true,
      price: 18000,
    },
    {
      id: 10,
      name: 'KANSACO Agro 15W-40',
      sku: 'KAN-AGRO-15W40-20L',
      slug: 'kansaco-agro-15w40',
      category: ['Agro', 'Aceites para Motor'],
      description: 'Lubricante especializado para maquinaria agrícola y vial',
      presentation: '20L',
      aplication: 'Tractores, cosechadoras, implementos agrícolas',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 30,
      isVisible: true,
      price: 14000,
    },
    {
      id: 11,
      name: 'KANSACO Caja Manual 75W-90',
      sku: 'KAN-CAJA-75W90-1L',
      slug: 'kansaco-caja-manual-75w90',
      category: ['Caja y Diferencial', 'Aceites para Transmisión'],
      description: 'Aceite para cajas manuales y diferenciales con aditivos EP',
      presentation: '1L',
      aplication: 'Cajas manuales, diferenciales, transferencias',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 40,
      isVisible: true,
      price: 3800,
    },
    {
      id: 12,
      name: 'KANSACO Industrial Hidráulico ISO 68',
      sku: 'KAN-IND-HID-ISO68-20L',
      slug: 'kansaco-industrial-hidraulico-iso68',
      category: ['Industrial', 'Aceites Hidráulicos'],
      description: 'Aceite hidráulico de alta calidad para sistemas industriales',
      presentation: '20L',
      aplication: 'Sistemas hidráulicos industriales, prensas, elevadores',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 25,
      isVisible: true,
      price: 11500,
    }
  ];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!API_BASE_URL) {
    console.error('API URL not configured.');
    return null;
  }

  try {
    const url = `${API_BASE_URL}/product/filter?slug=${slug}`;

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
        `No product found with slug: ${slug} via /product/filter endpoint, or response structure was unexpected.`,
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
): Promise<LoginApiResponse> {
  if (!API_BASE_URL) throw new Error('API URL not configured.');
  const url = `${API_BASE_URL}/user/login`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Include cookies in request
    });
    
    const apiResponse = await handleResponse<LoginApiResponse>(response);
    
    // Validate response structure
    if (!apiResponse.data || !apiResponse.data.token || !apiResponse.data.user) {
      logger.error('Login: Invalid response structure', apiResponse);
      throw new Error('Invalid response from server');
    }
    
    return apiResponse;
  } catch (error) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;
    throw new Error(errorMessage);
  }
}

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterApiResponse> {
  if (!API_BASE_URL) throw new Error('API URL not configured.');
  const url = `${API_BASE_URL}/user/register`;

  try {
    logger.debug('registerUser: Registering user');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Include cookies in request
    });
    const result = await handleResponse<RegisterApiResponse>(response);
    logger.debug('registerUser: User registered successfully');
    return result;
  } catch (error) {
    logger.error('registerUser: Registration error:', error);
    let errorMessage = 'An unknown error occurred.';
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
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
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

export async function createCart(
  userId: string,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    logger.error('API URL not configured.');
    return null;
  }

  if (!token) {
    logger.warn('createCart called without a token.');
    return null;
  }

  if (!userId || userId.trim() === '') {
    logger.warn('createCart called with invalid userId.');
    return null;
  }

  try {
    logger.debug(`createCart: Creating cart for user ${userId}`);
    const response = await fetch(`${API_BASE_URL}/cart/create`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        userId
      }),
      cache: 'no-store',
      credentials: 'include',
    });

    const result = await handleResponse<CartApiResponse>(response);
    if (result?.data?.id) {
      logger.debug(`createCart: Cart created successfully with ID ${result.data.id}`);
    }
    return result;
  } catch (error) {
    // Silently fail - cart creation might not be available or might fail
    logger.debug('createCart: Error creating cart, will use local cart', error);
    return null;
  }
}

// Nueva función para obtener carrito por userId (endpoint correcto del backend)
export async function getUserCartByUserId(
  userId: string,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    logger.error('API URL not configured.');
    return null;
  }

  if (!token) {
    logger.warn('getUserCartByUserId called without a token.');
    return null;
  }

  if (!userId || userId.trim() === '') {
    logger.warn('getUserCartByUserId called with invalid userId.');
    return null;
  }

  try {
    const url = `${API_BASE_URL}/cart/${encodeURIComponent(userId)}`;
    apiLogger.request('GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      credentials: 'include',
    });

    const result = await handleResponse<CartApiResponse>(response);
    apiLogger.response('GET', url, response.status);
    return result;
  } catch (error) {
    // Silently fail - this endpoint might not be available or might expect different format
    logger.debug('getUserCartByUserId: Error fetching cart by userId, will try alternative method', error);
    apiLogger.error('GET', `${API_BASE_URL}/cart/${userId}`, error);
    return null;
  }
}

export async function getUserCart(
  userId: string,
  token: string | null
): Promise<CartApiResponse | null> {
  if (!API_BASE_URL) {
    logger.error('API URL not configured.');
    return null;
  }

  if (!token) {
    logger.warn('getUserCart called without a token.');
    return null;
  }

  if (!userId || userId.trim() === '') {
    logger.warn('getUserCart called with invalid userId.');
    return null;
  }

  // IMPROVED STRATEGY: Try to get existing cart, then create if it doesn't exist
  try {
    logger.debug(`getUserCart: Attempting to get cart for user ${userId}`);
    
    // First try to get existing cart by userId
    // Note: This endpoint might not be available or might expect different format
    // If it fails, we'll silently continue to create a new cart
    const existingCart = await getUserCartByUserId(userId, token);
    if (existingCart?.data?.id) {
      logger.debug(`getUserCart: Existing cart found`);
      return existingCart;
    }
    
    // If cart doesn't exist or endpoint failed, try to create a new one
    logger.debug(`getUserCart: Creating new cart`);
    const createResponse = await createCart(userId, token);
    
    if (createResponse?.data?.id) {
      logger.debug(`getUserCart: Cart created successfully`);
      return createResponse;
    }
    
    // If creation also fails, return null to use local cart
    logger.info('getUserCart: Using local cart');
    return null;
  } catch (error) {
    // Silently fail and use local cart
    logger.debug(`getUserCart: Error, using local cart:`, error);
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
    logger.error('API URL not configured.');
    return null;
  }
  if (!token) {
    logger.warn('addProductToCart called without a token.');
    return null;
  }

  // Validar que los IDs sean números válidos
  if (!cartId || cartId <= 0 || isNaN(cartId)) {
    logger.error(`addProductToCart: cartId inválido: ${cartId}`);
    return null;
  }
  if (!productId || productId <= 0 || isNaN(productId)) {
    logger.error(`addProductToCart: productId inválido: ${productId}`);
    return null;
  }
  if (!quantity || quantity <= 0 || isNaN(quantity)) {
    logger.error(`addProductToCart: quantity inválida: ${quantity}`);
    return null;
  }

  // Construir la URL con quantity como query parameter
  const url = `${API_BASE_URL}/cart/${cartId}/add/product/${productId}?quantity=${quantity}`;
  apiLogger.request('PUT', url);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<CartApiResponse>(response);
    apiLogger.response('PUT', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('PUT', url, error);
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
      `${API_BASE_URL}/cart/${cartId}/delete/product/${productId}`,
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
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}/empty`, {
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

// Admin Product Management
export async function createProduct(
  token: string,
  productData: Omit<Product, 'id'>
): Promise<Product> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const response = await fetch(`${API_BASE_URL}/product/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
    cache: 'no-store',
  });

  const result = await handleResponse<{ status: string; data: Product }>(response);
  return result.data;
}

export async function updateProduct(
  token: string,
  productId: number,
  productData: Partial<Product>
): Promise<Product> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const response = await fetch(`${API_BASE_URL}/product/${productId}/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
    cache: 'no-store',
  });

  const result = await handleResponse<{ status: string; data: Product }>(response);
  return result.data;
}

export async function deleteProduct(
  token: string,
  productId: number
): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  await handleResponse<{ status: string }>(response);
}
