import { api } from "@/lib/api"

export const searchFAQs = async (query: string): Promise<{ answers: string[] }> => {
  return api.post('/faq/search', { query });
};