// Shared types + typed fetch helpers for the Aïmane catalog API.

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // whole FCFA
  imageUrl: string;
  buyUrl: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  photoUrl: string;
  accent: "gold" | "violet" | "blue";
  updatedAt: string;
}

export interface SessionInfo {
  isAdmin: boolean;
  exp: number | null;
}

async function http<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Erreur ${res.status}`) || `Erreur ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

// Products
export const api = {
  listProducts: () => http<{ products: Product[] }>("/api/products"),
  createProduct: (input: ProductInput) =>
    http<{ product: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateProduct: (id: string, input: Partial<ProductInput>) =>
    http<{ product: Product }>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteProduct: (id: string) =>
    http<{ ok: true }>(`/api/products/${id}`, { method: "DELETE" }),

  // Settings
  getSettings: () => http<{ settings: SiteSettings }>("/api/settings"),
  updateSettings: (input: Partial<SiteSettings>) =>
    http<{ settings: SiteSettings }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  // Auth
  getSession: () => http<SessionInfo>("/api/auth/session"),
  login: (password: string) =>
    http<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => http<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  // Upload
  uploadImage: async (file: File): Promise<{ url: string; filename: string; storage: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error(
        (data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `Erreur ${res.status}`) || `Erreur ${res.status}`
      );
    }
    return data as { url: string; filename: string; storage: string };
  },
};

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  buyUrl?: string | null;
  order?: number;
}

export function formatPrice(price: number): string {
  // FCFA, thousands separated with a space, no decimals.
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(price) + " FCFA";
}
