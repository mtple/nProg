export interface Creator {
  address: string;
  username: string | null;
  hidden: boolean;
}

export interface Admin {
  address: string;
  hidden: boolean;
}

export interface TimelineMoment {
  address: string;
  token_id: string;
  chain_id: number;
  id: string;
  uri: string;
  protocol: "in_process" | "catalog";
  creator: Creator;
  admins: Admin[];
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total_pages: number;
}

export interface TimelineResponse {
  status: "success" | "error";
  moments: TimelineMoment[];
  pagination: Pagination;
  message?: string;
}
