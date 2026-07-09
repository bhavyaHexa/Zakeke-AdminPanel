const BACKEND_URL = "";

/**
 * Uploads a binary file (GLB or HDRI image) to Shopify staging and registers it.
 * @param {File} file 
 * @returns {Promise<any>} Response object containing { id, url }
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/shopify/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || err.message || "Failed to upload file");
  }

  return response.json();
};

/**
 * Fetches all ingested 3D configurator products.
 * @returns {Promise<any>}
 */
export const fetchProducts = async () => {
  const response = await fetch(`${BACKEND_URL}/shopify/products`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to fetch products");
  }
  return response.json();
};

/**
 * Fetches details of a single configured product.
 * @param {string} productId 
 * @returns {Promise<any>}
 */
export const fetchProductById = async (productId) => {
  const response = await fetch(`${BACKEND_URL}/shopify/products/${productId}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to fetch product");
  }
  return response.json();
};

/**
 * Ingests a new 3D configuration layout as a Shopify product.
 * @param {any} payload 
 * @returns {Promise<any>}
 */
export const createProduct = async (payload) => {
  const response = await fetch(`${BACKEND_URL}/shopify/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || err.message || "Failed to create product");
  }

  return response.json();
};

/**
 * Updates an existing configured product.
 * @param {string} productId 
 * @param {any} payload 
 * @returns {Promise<any>}
 */
export const updateProduct = async (productId, payload) => {
  const response = await fetch(`${BACKEND_URL}/shopify/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || err.message || "Failed to update product");
  }

  return response.json();
};

/**
 * Deletes an ingested product from Shopify.
 * @param {string} productId 
 * @returns {Promise<any>}
 */
export const deleteProduct = async (productId) => {
  const response = await fetch(`${BACKEND_URL}/shopify/products/${productId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to delete product");
  }

  return response.json();
};
