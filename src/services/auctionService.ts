import apiClient from './api';

interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  category: string;
  condition: string;
  imageUrls: string[];
  duration: number;
}

interface AuctionResponse {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  category: string;
  condition: string;
  imageUrls: string[];
  sellerId: number;
  status: string;
  createdAt: string;
  endTime: string;
}

export const auctionService = {
  createAuction: async (data: CreateAuctionRequest): Promise<AuctionResponse> => {
    const response = await apiClient.post('/auctions', data);
    return response.data;
  },

  getAuctions: async (): Promise<AuctionResponse[]> => {
    const response = await apiClient.get('/auctions');
    return response.data;
  },

  getAuction: async (id: number): Promise<AuctionResponse> => {
    const response = await apiClient.get(`/auctions/${id}`);
    return response.data;
  },

  getMyAuctions: async (): Promise<AuctionResponse[]> => {
    const response = await apiClient.get('/auctions/my');
    return response.data;
  },
};