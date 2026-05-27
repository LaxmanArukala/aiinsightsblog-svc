export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed';
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubscriberDto {
  email: string;
  name?: string;
}

export interface UpdateSubscriberDto {
  email?: string;
  name?: string;
  status?: 'active' | 'unsubscribed';
}

export interface SubscriberListQuery {
  page?: number;
  limit?: number;
  status?: 'active' | 'unsubscribed';
}

export interface PaginatedSubscribers {
  data: Subscriber[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
