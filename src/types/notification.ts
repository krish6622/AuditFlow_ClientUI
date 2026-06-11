export type NotificationType =
  | "workorder_requested"
  | "workorder_assigned"
  | "workorder_completed"
  | "workorder_closed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  work_order_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: AppNotification[];
  total: number;
  unread: number;
  page: number;
  page_size: number;
}
