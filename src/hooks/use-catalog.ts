"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, type ProductInput } from "@/lib/api";

export const qk = {
  products: ["products"] as const,
  settings: ["settings"] as const,
  session: ["session"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: qk.products,
    queryFn: () => api.listProducts(),
    select: (d) => d.products,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: qk.settings,
    queryFn: () => api.getSettings(),
    select: (d) => d.settings,
  });
}

export function useSession() {
  return useQuery({
    queryKey: qk.session,
    queryFn: () => api.getSession(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => api.createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.products }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      api.updateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.products }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.products }),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof api.updateSettings>[0]) =>
      api.updateSettings(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings }),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => api.login(password),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.session }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session });
    },
  });
}
