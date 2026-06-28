export interface AnalyticsIdentifier {
  visitorId: string | undefined;
  ipAddress: string;
}

export interface ViewsResponse {
  views: number;
  recorded: boolean; // false if deduplicated (already viewed within 24h)
}

export interface LikesResponse {
  liked: boolean;
  likes: number;
}

export interface BookmarksResponse {
  bookmarked: boolean;
  bookmarks: number;
}

export interface SharesResponse {
  shares: number;
}
