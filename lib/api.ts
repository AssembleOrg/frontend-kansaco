// /lib/api.ts
import { Product, Cart } from '@/types';
import {
  LoginPayload,
  LoginApiResponse,
  RegisterPayload,
  RegisterApiResponse,
} from '@/types/auth';
import {
  SendOrderEmailData,
  OrderEmailResponse,
  Order,
  OrderStatus,
  PaginatedOrdersResponse,
  UpdateOrderDto,
} from '@/types/order';
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

export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CartApiResponse {
  status: string;
  data: Cart;
}

// Helper function to handle 401 Unauthorized
function handleUnauthorized() {
  if (typeof window === 'undefined') return;

  try {
    // Import authStore dynamically to avoid circular dependencies
    // This will only execute on the client side
    import('@/features/auth/store/authStore')
      .then((module) => {
        const { useAuthStore } = module;
        const { logout } = useAuthStore.getState();

        // Clear authentication
        logout();

        // Redirect to login with current path as redirect
        const currentPath = window.location.pathname;
        const redirectUrl =
          currentPath !== '/login'
            ? `/login?redirect=${encodeURIComponent(currentPath)}`
            : '/login';

        // Use setTimeout to ensure logout completes before redirect
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      })
      .catch((err) => {
        logger.error('Error handling unauthorized:', err);
        // Fallback: clear cookies and redirect to login
        if (typeof document !== 'undefined') {
          // Clear auth cookies manually as fallback
          document.cookie =
            'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie =
            'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        window.location.href = '/login';
      });
  } catch (err) {
    logger.error('Error in handleUnauthorized:', err);
    // Final fallback: just redirect
    window.location.href = '/login';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized - logout and redirect
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized - Please login again');
    }

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
    logger.error('API Error (parsed):', errorMsg, 'Raw error data:', errorData);
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
    logger.error(
      'Error fetching products (Railway might be down), using fallback:',
      error
    );
    return getMockProducts();
  }
}

export async function getProductsPaginated(
  token: string | null,
  options?: {
    page?: number;
    limit?: number;
    name?: string;
    slug?: string;
    sku?: string;
    category?: string[];
    stock?: number;
    wholeSaler?: string;
    isVisible?: boolean;
    isFeatured?: boolean;
  }
): Promise<PaginatedProductsResponse> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.name) params.append('name', options.name);
  if (options?.slug) params.append('slug', options.slug);
  if (options?.sku) params.append('sku', options.sku);
  if (options?.category) {
    options.category.forEach((cat) => params.append('category', cat));
  }
  if (options?.stock !== undefined)
    params.append('stock', options.stock.toString());
  if (options?.wholeSaler) params.append('wholeSaler', options.wholeSaler);
  if (options?.isVisible !== undefined)
    params.append('isVisible', options.isVisible.toString());
  if (options?.isFeatured !== undefined)
    params.append('isFeatured', options.isFeatured.toString());

  const url = `${API_BASE_URL}/product?${params.toString()}`;
  apiLogger.request('GET', url);

  try {
    const headers: HeadersInit = {
      Accept: 'application/json',
    };

    // Agregar token si está disponible
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const result = await handleResponse<
      | PaginatedProductsResponse
      | { status: string; data: PaginatedProductsResponse }
    >(response);
    apiLogger.response('GET', url, response.status);

    // Manejar respuesta envuelta (con status y data) o directa
    let paginatedData: PaginatedProductsResponse;
    if ('status' in result && 'data' in result) {
      // Respuesta envuelta: { status: "success", data: { data: [...], total: ... } }
      paginatedData = result.data;
    } else {
      // Respuesta directa
      paginatedData = result as PaginatedProductsResponse;
    }

    // Asegurar que siempre devolvemos una estructura válida
    return {
      data: Array.isArray(paginatedData.data) ? paginatedData.data : [],
      total: paginatedData.total || 0,
      page: paginatedData.page || 1,
      limit: paginatedData.limit || 20,
      totalPages: paginatedData.totalPages || 0,
      hasNext: paginatedData.hasNext || false,
      hasPrev: paginatedData.hasPrev || false,
    };
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
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
      description:
        "Aceite sintético de alta performance para motores modernos con tecnología Polymer's Protection Film",
      presentation: '4L',
      aplication: 'Motores de gasolina modernos, turbo, híbridos',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 50,
      isVisible: true,
      isFeatured: false,
      price: 8500,
    },
    {
      id: 2,
      name: 'KANSACO Diesel Heavy Line 15W-40',
      sku: 'KAN-DIE-15W40-20L',
      slug: 'kansaco-diesel-heavy-15w40',
      category: ['Industrial', 'Diesel Heavy Line'],
      description:
        'Lubricante especializado para motores diesel pesados con máxima protección',
      presentation: '20L',
      aplication: 'Motores diesel industriales, camiones, ómnibus',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 25,
      isVisible: true,
      isFeatured: false,
      price: 12000,
    },
    {
      id: 3,
      name: 'KANSACO Polymer Protection Film',
      sku: 'KAN-POL-PROT-500ML',
      slug: 'kansaco-polymer-protection-film',
      category: ['Derivados Y Aditivos'],
      description:
        'El orgullo de nuestra empresa. Film de protección polimérica exclusivo',
      presentation: '500ml',
      aplication: 'Protección de superficies metálicas en motores',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 30,
      isVisible: true,
      isFeatured: false,
      price: 15000,
    },
    {
      id: 4,
      name: 'KANSACO Premium 10W-40',
      sku: 'KAN-PREM-10W40-4L',
      slug: 'kansaco-premium-10w40',
      category: ['Premium', 'Aceites para Motor'],
      description:
        'Aceite semi-sintético de alto rendimiento para uso comercial',
      presentation: '4L',
      aplication: 'Vehículos familiares, flotas comerciales, taxis',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 40,
      isVisible: true,
      isFeatured: false,
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
      isFeatured: false,
      price: 4500,
    },
    {
      id: 6,
      name: 'KANSACO Moto 4T 10W-40',
      sku: 'KAN-MOTO-4T-10W40-1L',
      slug: 'kansaco-moto-4t-10w40',
      category: ['Motos', 'Aceites para Motor'],
      description:
        'Aceite especial para motocicletas 4 tiempos con embrague húmedo',
      presentation: '1L',
      aplication: 'Motocicletas 4 tiempos, scooters, ATVs',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 35,
      isVisible: true,
      isFeatured: false,
      price: 3200,
    },
    {
      id: 7,
      name: 'KANSACO Grasa Multipropósito NLGI 2',
      sku: 'KAN-GRASA-MP-NLGI2-500G',
      slug: 'kansaco-grasa-multiproposito-nlgi2',
      category: ['Grasas', 'Lubricantes'],
      description:
        'Grasa de litio complejo para múltiples aplicaciones industriales',
      presentation: '500g',
      aplication: 'Rodamientos, chassis, equipos industriales',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 45,
      isVisible: true,
      isFeatured: false,
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
      isFeatured: false,
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
      isFeatured: false,
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
      isFeatured: false,
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
      isFeatured: false,
      price: 3800,
    },
    {
      id: 12,
      name: 'KANSACO Industrial Hidráulico ISO 68',
      sku: 'KAN-IND-HID-ISO68-20L',
      slug: 'kansaco-industrial-hidraulico-iso68',
      category: ['Industrial', 'Aceites Hidráulicos'],
      description:
        'Aceite hidráulico de alta calidad para sistemas industriales',
      presentation: '20L',
      aplication: 'Sistemas hidráulicos industriales, prensas, elevadores',
      imageUrl: '/landing/kansaco-logo.png',
      wholeSaler: 'KANSACO',
      stock: 25,
      isVisible: true,
      isFeatured: false,
      price: 11500,
    },
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
    if (
      !apiResponse.data ||
      !apiResponse.data.token ||
      !apiResponse.data.user
    ) {
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
        userId,
      }),
      cache: 'no-store',
      credentials: 'include',
    });

    const result = await handleResponse<CartApiResponse>(response);
    if (result?.data?.id) {
      logger.debug(
        `createCart: Cart created successfully with ID ${result.data.id}`
      );
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
    const url = `${API_BASE_URL}/cart/user/${encodeURIComponent(userId)}`;
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
    logger.debug(
      'getUserCartByUserId: Error fetching cart by userId, will try alternative method',
      error
    );
    apiLogger.error('GET', `${API_BASE_URL}/cart/user/${userId}`, error);
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
  token: string | null,
  presentation?: string
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

  // Construir la URL con quantity y presentation como query parameters
  const urlParams = new URLSearchParams({
    quantity: quantity.toString(),
  });
  if (presentation) {
    urlParams.append('presentation', presentation);
  }
  const url = `${API_BASE_URL}/cart/${cartId}/add/product/${productId}?${urlParams.toString()}`;
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
  productData: Omit<Product, 'id' | 'slug'>
): Promise<Product> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  // Asegurar que price sea un número válido
  const cleanData: Omit<Product, 'id' | 'slug'> = { ...productData };
  if (cleanData.price !== undefined && cleanData.price !== null) {
    const priceValue =
      typeof cleanData.price === 'string'
        ? parseFloat(cleanData.price)
        : cleanData.price;
    cleanData.price = isNaN(priceValue) || priceValue <= 0 ? 1 : priceValue;
  }

  const response = await fetch(`${API_BASE_URL}/product/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanData),
    cache: 'no-store',
  });

  const result = await handleResponse<{ status: string; data: Product }>(
    response
  );
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

  // Limpiar campos que no deben enviarse al backend
  // Omitir id y slug del tipo Product
  type ProductDataWithoutId = Omit<Product, 'id' | 'slug'>;
  const cleanData: Partial<ProductDataWithoutId> = { ...productData };
  delete (cleanData as Partial<Product>).id;
  delete (cleanData as Partial<Product>).slug;

  // Asegurar que price sea un número válido
  if (cleanData.price !== undefined) {
    const priceValue =
      typeof cleanData.price === 'string'
        ? parseFloat(cleanData.price)
        : cleanData.price;
    cleanData.price =
      isNaN(priceValue!) || priceValue! <= 0 ? 1 : (priceValue ?? 1);
  }

  const response = await fetch(`${API_BASE_URL}/product/${productId}/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanData),
    cache: 'no-store',
  });

  const result = await handleResponse<{ status: string; data: Product }>(
    response
  );
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

// Email - Envío de pedidos
interface SendOrderEmailApiResponse {
  status: string;
  data: {
    message: string;
    orderId: string;
    presupuestoNumber?: string;
    pdfBase64?: string;
  };
}

export async function sendOrderEmail(
  token: string,
  orderData: SendOrderEmailData
): Promise<OrderEmailResponse> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/email/send-order`;
  apiLogger.request('POST', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
      cache: 'no-store',
    });

    const result = await handleResponse<SendOrderEmailApiResponse>(response);
    apiLogger.response('POST', url, response.status);

    // Validate that orderId was returned (response is wrapped by TransformInterceptor)
    if (!result.data?.orderId) {
      logger.error(
        'sendOrderEmail: Backend no devolvió orderId válido',
        result
      );
      throw new Error(
        'El servidor no devolvió el ID del pedido. Por favor, contacta a soporte.'
      );
    }

    logger.info(
      'sendOrderEmail: Pedido enviado correctamente, orderId:',
      result.data.orderId
    );
    return {
      message: result.data.message,
      orderId: result.data.orderId,
      presupuestoNumber: result.data.presupuestoNumber,
      pdfBase64: result.data.pdfBase64,
    };
  } catch (error) {
    apiLogger.error('POST', url, error);
    logger.error('sendOrderEmail: Error enviando pedido:', error);
    throw error;
  }
}

// Order Management
interface OrdersApiResponse {
  status: string;
  data: Order[];
}

interface OrderApiResponse {
  status: string;
  data: Order;
}

export async function getOrders(token: string): Promise<Order[]> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/order`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<OrdersApiResponse>(response);
    apiLogger.response('GET', url, response.status);
    return result.data;
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
  }
}

export async function getOrderById(
  token: string,
  orderId: string
): Promise<Order> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/order/${orderId}`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<OrderApiResponse>(response);
    apiLogger.response('GET', url, response.status);

    const order = result.data;

    // ⚠️ Backend retorna doble anidamiento: { data: { data: Order } }
    if (order && typeof order === 'object' && 'data' in order && !('id' in order)) {
      const nestedData = order as { data: Order };
      return nestedData.data;
    }

    return order;
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
  }
}

/**
 * Valida si una orden existe y está disponible para edición
 * @returns objeto con valid, reason y order opcional
 */
export async function validateOrderForEdit(
  token: string,
  orderId: string
): Promise<{ valid: boolean; reason?: string; order?: Order }> {
  try {
    const order = await getOrderById(token, orderId);

    if (!order) {
      return { valid: false, reason: 'Order not found' };
    }

    if (order.status !== 'PENDIENTE') {
      return {
        valid: false,
        reason: `Order status is ${order.status}, only PENDIENTE orders can be edited`,
      };
    }

    return { valid: true, order };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Si es 404, la orden no existe
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return { valid: false, reason: 'Order not found (404)' };
    }

    // Otro error (403, 500, etc.)
    return { valid: false, reason: errorMessage || 'Unknown error' };
  }
}

export async function getMyOrdersPaginated(
  token: string,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<PaginatedOrdersResponse> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `${API_BASE_URL}/order/my-orders/paginated?${params.toString()}`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<{
      status: string;
      data: PaginatedOrdersResponse;
    }>(response);
    apiLogger.response('GET', url, response.status);

    // Extraer los datos de la respuesta anidada (result.data contiene el PaginatedOrdersResponse)
    if (result && 'data' in result && result.data) {
      return result.data;
    }

    // Si la respuesta ya viene en el formato correcto
    return result as unknown as PaginatedOrdersResponse;
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
  }
}

export async function getAllOrdersPaginated(
  token: string,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<PaginatedOrdersResponse> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `${API_BASE_URL}/order/all/paginated?${params.toString()}`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<{
      status: string;
      data: PaginatedOrdersResponse;
    }>(response);
    apiLogger.response('GET', url, response.status);

    // Extraer los datos de la respuesta anidada (result.data contiene el PaginatedOrdersResponse)
    if (result && 'data' in result && result.data) {
      return result.data;
    }

    // Si la respuesta ya viene en el formato correcto
    return result as unknown as PaginatedOrdersResponse;
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
  }
}

export async function downloadOrderPDF(
  token: string,
  orderId: string
): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/order/${orderId}/pdf`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download PDF: ${errorText}`);
    }

    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Presupuesto_${orderId}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Obtener el blob del PDF
    const blob = await response.blob();

    // Crear un enlace temporal y descargar
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);

    apiLogger.response('GET', url, response.status);
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
  }
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/order/${orderId}/status`;
  apiLogger.request('PATCH', url);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      cache: 'no-store',
    });

    const result = await handleResponse<OrderApiResponse>(response);
    apiLogger.response('PATCH', url, response.status);

    // Manejar doble-nested en caso de que backend cambie la respuesta
    const order = result.data;
    if (order && typeof order === 'object' && 'data' in order && !('id' in order)) {
      return (order as { data: Order }).data;
    }
    return order;
  } catch (error) {
    apiLogger.error('PATCH', url, error);
    throw error;
  }
}

export async function updateOrder(
  token: string,
  orderId: string,
  orderData: UpdateOrderDto
): Promise<Order> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/order/${orderId}`;
  apiLogger.request('PATCH', url);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
      cache: 'no-store',
    });

    const result = await handleResponse<OrderApiResponse>(response);
    apiLogger.response('PATCH', url, response.status);
    return result.data;
  } catch (error) {
    apiLogger.error('PATCH', url, error);
    throw error;
  }
}

export async function deleteOrder(
  token: string,
  orderId: string
): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error('Authentication required.');
  }

  const url = `${API_BASE_URL}/order/${orderId}`;
  apiLogger.request('DELETE', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    await handleResponse<{ status: string; message: string }>(response);
    apiLogger.response('DELETE', url, response.status);
  } catch (error) {
    apiLogger.error('DELETE', url, error);
    throw error;
  }
}

// Image Management
export interface ImageUploadResponse {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

export interface ImageListItem {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

export interface ImageListResponse {
  images: ImageListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextToken?: string;
}

export async function uploadImage(
  token: string,
  file: File,
  folder?: string
): Promise<ImageUploadResponse> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const formData = new FormData();
  formData.append('image', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const url = `${API_BASE_URL}/image/upload`;
  apiLogger.request('POST', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: 'no-store',
    });

    const result = await handleResponse<ImageUploadResponse>(response);
    apiLogger.response('POST', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('POST', url, error);
    throw error;
  }
}

export async function uploadMultipleImages(
  token: string,
  files: File[],
  folder?: string
): Promise<ImageUploadResponse[]> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  if (folder) {
    formData.append('folder', folder);
  }

  const url = `${API_BASE_URL}/image/upload-multiple`;
  apiLogger.request('POST', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: 'no-store',
    });

    const result = await handleResponse<ImageUploadResponse[]>(response);
    apiLogger.response('POST', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('POST', url, error);
    throw error;
  }
}

export async function listImages(
  token: string,
  options?: {
    page?: number;
    limit?: number;
    prefix?: string;
    continuationToken?: string;
  }
): Promise<ImageListResponse> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.prefix) params.append('prefix', options.prefix);
  if (options?.continuationToken)
    params.append('continuationToken', options.continuationToken);

  const url = `${API_BASE_URL}/image/list?${params.toString()}`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    // Si la respuesta no es exitosa, intentar parsear el JSON para ver si contiene datos válidos
    if (!response.ok) {
      try {
        const errorData = await response.json();
        // Si el error contiene datos válidos con estructura de respuesta exitosa, usarlos
        if (errorData && typeof errorData === 'object') {
          let data = errorData;
          // Si viene envuelto en status/data
          if ('data' in errorData && errorData.data) {
            data = errorData.data;
          }
          // Si tiene la estructura de ImageListResponse
          if (
            data &&
            typeof data === 'object' &&
            ('images' in data || Array.isArray(data.images))
          ) {
            apiLogger.response('GET', url, response.status);
            return {
              images: Array.isArray(data.images) ? data.images : [],
              total: data.total || 0,
              page: data.page || 1,
              limit: data.limit || 20,
              hasMore: data.hasMore || false,
              nextToken: data.nextToken,
            };
          }
        }
      } catch {
        // Si no se puede parsear, continuar con el manejo de error normal
      }
    }

    const result = await handleResponse<
      ImageListResponse | { status: string; data: ImageListResponse }
    >(response);
    apiLogger.response('GET', url, response.status);

    // Manejar respuesta envuelta (con status y data) o directa
    let imageData: ImageListResponse;
    if ('status' in result && 'data' in result) {
      // Respuesta envuelta
      imageData = result.data;
    } else {
      // Respuesta directa
      imageData = result as ImageListResponse;
    }

    // Asegurar que siempre devolvemos una estructura válida
    return {
      images: Array.isArray(imageData.images) ? imageData.images : [],
      total: imageData.total || 0,
      page: imageData.page || 1,
      limit: imageData.limit || 20,
      hasMore: imageData.hasMore || false,
      nextToken: imageData.nextToken,
    };
  } catch (error) {
    // Si hay un error pero es porque no hay imágenes, devolver respuesta vacía
    // en lugar de lanzar error y romper la aplicación
    logger.warn('Error listing images, returning empty response:', error);
    apiLogger.error('GET', url, error);

    // Devolver respuesta vacía en lugar de lanzar error
    return {
      images: [],
      total: 0,
      page: 1,
      limit: options?.limit || 20,
      hasMore: false,
    };
  }
}

export async function getImageUrl(
  token: string,
  key: string
): Promise<{ url: string }> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const url = `${API_BASE_URL}/image/${encodeURIComponent(key)}`;
  apiLogger.request('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<{ url: string }>(response);
    apiLogger.response('GET', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('GET', url, error);
    throw error;
  }
}

export async function deleteImage(token: string, key: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const url = `${API_BASE_URL}/image/${encodeURIComponent(key)}`;
  apiLogger.request('DELETE', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    await handleResponse<{ message: string }>(response);
    apiLogger.response('DELETE', url, response.status);
  } catch (error) {
    apiLogger.error('DELETE', url, error);
    throw error;
  }
}

// Product Images Management
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  imageKey: string;
  order: number;
  isPrimary: boolean;
  createdAt: string;
}

export async function associateProductImage(
  token: string,
  productId: number,
  imageKey: string,
  isPrimary?: boolean
): Promise<ProductImage> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error(
      'Authentication token is required to associate product images.'
    );
  }

  const url = `${API_BASE_URL}/product/${productId}/image/associate${isPrimary ? '?isPrimary=true' : ''}`;
  apiLogger.request('POST', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageKey }),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Si el endpoint no existe (404), intentar con upload
      if (response.status === 404) {
        throw new Error('ASSOCIATE_ENDPOINT_NOT_AVAILABLE');
      }
      throw new Error(
        `Failed to associate image: ${response.status} ${response.statusText}`
      );
    }

    const result = await handleResponse<ProductImage>(response);
    apiLogger.response('POST', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('POST', url, error);
    if (
      error instanceof Error &&
      error.message === 'ASSOCIATE_ENDPOINT_NOT_AVAILABLE'
    ) {
      throw error; // Re-throw para que el caller pueda manejar el fallback
    }
    throw error;
  }
}

export async function uploadProductImage(
  token: string,
  productId: number,
  file: File,
  isPrimary?: boolean
): Promise<ProductImage> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  if (!token) {
    throw new Error(
      'Authentication token is required to upload product images.'
    );
  }

  const formData = new FormData();
  formData.append('image', file);

  const url = `${API_BASE_URL}/product/${productId}/image${isPrimary ? '?isPrimary=true' : ''}`;
  apiLogger.request('POST', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // NO incluir Content-Type, el navegador lo establecerá automáticamente con el boundary para FormData
      },
      body: formData,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload image: ${response.status} ${response.statusText}`
      );
    }

    const result = await handleResponse<ProductImage>(response);
    apiLogger.response('POST', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('POST', url, error);
    throw error;
  }
}

export async function getProductImages(
  token: string | null,
  productId: number
): Promise<ProductImage[]> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const url = `${API_BASE_URL}/product/${productId}/images`;
  apiLogger.request('GET', url);

  try {
    const headers: HeadersInit = {
      Accept: 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Si es una petición pública (sin token) y recibe 401, no redirigir al login
    // Simplemente devolver array vacío ya que las imágenes deberían ser públicas
    if (response.status === 401 && !token) {
      apiLogger.response('GET', url, response.status);
      // Si el endpoint requiere autenticación pero estamos en vista pública,
      // devolver array vacío (las imágenes deberían ser accesibles públicamente)
      return [];
    }

    // Si hay token y recibe 401, dejar que handleResponse maneje la redirección
    if (response.status === 401 && token) {
      const result = await handleResponse<
        ProductImage[] | { status: string; data: ProductImage[] }
      >(response);
      apiLogger.response('GET', url, response.status);

      if (Array.isArray(result)) {
        return result;
      } else if ('data' in result && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    }

    // Para otros códigos de estado, usar handleResponse normalmente
    if (!response.ok) {
      const result = await handleResponse<
        ProductImage[] | { status: string; data: ProductImage[] }
      >(response);
      apiLogger.response('GET', url, response.status);

      if (Array.isArray(result)) {
        return result;
      } else if ('data' in result && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    }

    // Respuesta exitosa
    const jsonResponse = await response.json();
    apiLogger.response('GET', url, response.status);

    // Manejar respuesta envuelta o directa
    let images: ProductImage[] = [];
    if (Array.isArray(jsonResponse)) {
      images = jsonResponse;
    } else if ('data' in jsonResponse && Array.isArray(jsonResponse.data)) {
      images = jsonResponse.data;
    } else if (
      jsonResponse &&
      typeof jsonResponse === 'object' &&
      'status' in jsonResponse &&
      'data' in jsonResponse
    ) {
      images = Array.isArray(jsonResponse.data) ? jsonResponse.data : [];
    }

    return images;
  } catch (error) {
    apiLogger.error('GET', url, error);
    // En caso de error, devolver array vacío para no romper la vista pública
    return [];
  }
}

export async function deleteProductImage(
  token: string,
  productId: number,
  imageId: number
): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const url = `${API_BASE_URL}/product/${productId}/image/${imageId}`;
  apiLogger.request('DELETE', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    await handleResponse<{ message: string }>(response);
    apiLogger.response('DELETE', url, response.status);
  } catch (error) {
    apiLogger.error('DELETE', url, error);
    throw error;
  }
}

export async function setProductImageAsPrimary(
  token: string,
  productId: number,
  imageId: number
): Promise<ProductImage> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const url = `${API_BASE_URL}/product/${productId}/image/${imageId}/primary`;
  apiLogger.request('PATCH', url);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result = await handleResponse<ProductImage>(response);
    apiLogger.response('PATCH', url, response.status);
    return result;
  } catch (error) {
    apiLogger.error('PATCH', url, error);
    throw error;
  }
}

export async function reorderProductImages(
  token: string,
  productId: number,
  imageIds: number[]
): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured.');
  }

  const url = `${API_BASE_URL}/product/${productId}/images/reorder`;
  apiLogger.request('PATCH', url);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageIds }),
      cache: 'no-store',
    });

    await handleResponse<{ message: string }>(response);
    apiLogger.response('PATCH', url, response.status);
  } catch (error) {
    apiLogger.error('PATCH', url, error);
    throw error;
  }
}
