import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  notificationService,
  AppNotification,
  NotificationCategory,
} from '@/services/notificationService';

import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

const CATEGORIES: NotificationCategory[] = [
  'COURSE',
  'MODULE',
  'ASSIGNMENT',
  'ASSESSMENT',
  'GRADE',
  'PROGRESS',
  'SCHEDULE',
  'SYSTEM',
];

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: 'border-l-4 border-l-destructive',
  HIGH: 'border-l-4 border-l-orange-500',
  NORMAL: '',
  LOW: '',
};

type Filter = 'all' | 'unread';

export function NotificationList() {
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] =
    useState<NotificationCategory | 'ALL'>('ALL');

  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [pendingIds, setPendingIds] = useState<Set<string>>(
    new Set(),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const result =
        await notificationService.getNotifications({
          page,
          limit: PAGE_SIZE,
          unreadOnly: filter === 'unread',
          category:
            category === 'ALL' ? undefined : category,
        });

      setItems(result.items);
      setTotal(result.total);
      setUnreadCount(result.unread_count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, filter, category]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [filter, category]);

  const withPending = async (
    id: string,
    action: () => Promise<void>,
  ) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await action();
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkRead = (
    notification: AppNotification,
  ) =>
    withPending(notification.id, async () => {
      await notificationService.markAsRead(
        notification.id,
      );

      setItems((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, is_read: true }
            : n,
        ),
      );

      setUnreadCount((prev) =>
        Math.max(0, prev - 1),
      );
    });

  const handleDelete = (
    notification: AppNotification,
  ) =>
    withPending(notification.id, async () => {
      await notificationService.deleteNotification(
        notification.id,
      );

      setItems((prev) =>
        prev.filter(
          (n) => n.id !== notification.id,
        ),
      );

      setTotal((prev) =>
        Math.max(0, prev - 1),
      );

      if (!notification.is_read) {
        setUnreadCount((prev) =>
          Math.max(0, prev - 1),
        );
      }
    });

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch {
      // Best-effort operation.
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <Tabs
          value={filter}
          onValueChange={(value) =>
            setFilter(value as Filter)
          }
        >
          <TabsList>
            <TabsTrigger value="all">
              All
            </TabsTrigger>

            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0
                ? ` (${unreadCount})`
                : ''}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">

          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(
                value as
                  | NotificationCategory
                  | 'ALL',
              )
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                All categories
              </SelectItem>

              {CATEGORIES.map((item) => (
                <SelectItem
                  key={item}
                  value={item}
                >
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
            >
              <Check className="mr-1 h-4 w-4" />
              Mark all as read
            </Button>
          )}

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-20 w-full rounded-md"
              />
            ),
          )}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground">
            Couldn't load your notifications.
          </p>

          <Button
            variant="outline"
            onClick={load}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />

            <p className="font-medium">
              You're all caught up.
            </p>

            <p className="text-sm text-muted-foreground">
              No notifications to show here.
            </p>
          </div>
        )}

      {/* Notification List */}
      {!loading &&
        !error &&
        items.length > 0 && (
          <div className="space-y-2">

            {items.map((notification) => {
              const isPending =
                pendingIds.has(notification.id);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start justify-between gap-3 rounded-md border bg-card p-4 transition-colors',
                    !notification.is_read &&
                      'bg-accent/30',
                    PRIORITY_STYLES[
                      notification.priority
                    ] ?? '',
                  )}
                >

                  {/* 
                    Notification content is now a DIV,
                    NOT a button.

                    Therefore the notification itself
                    cannot be clicked.
                  */}
                  <div className="flex min-w-0 flex-1 items-start gap-3 text-left">

                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        notification.is_read
                          ? 'bg-transparent'
                          : 'bg-primary',
                      )}
                      aria-hidden
                    />

                    <div className="min-w-0 space-y-1">

                      <div className="flex items-center gap-2">

                        <p
                          className={cn(
                            'text-sm leading-tight',
                            !notification.is_read &&
                              'font-semibold',
                          )}
                        >
                          {notification.title}
                        </p>

                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {notification.category}
                        </Badge>

                      </div>

                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(
                          notification.created_at,
                        )}
                      </p>

                    </div>
                  </div>

                  {/* Notification Actions */}
                  <div className="flex shrink-0 items-center gap-1">

                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Mark as read"
                            onClick={() =>
                              handleMarkRead(
                                notification,
                              )
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              notification,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      {/* Pagination */}
      {!loading &&
        !error &&
        totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">

            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1,
                  ),
                )
              }
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

          </div>
        )}

    </div>
  );
}

