import { apiClient } from "./api-client";

export const communityService = {
  posts: (category?: string) =>
    apiClient.get("/api/community/posts", { params: category ? { category } : {} }),
  post: (id: string) => apiClient.get(`/api/community/posts/${id}`),
  verify: (id: string) => apiClient.post(`/api/community/posts/${id}/verify`),
  comment: (id: string, body: string) => apiClient.post(`/api/community/posts/${id}/comments`, { body }),
};
