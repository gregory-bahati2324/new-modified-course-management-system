import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  notificationService,
  AppNotification,
} from '@/services/notificationService';

import { authService } from '@/services/authService';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { cn } from '@/lib/utils';

function getNotificationsPath(): string {
  const role = authService.getCachedUser()?.role;

  if (role === 'instructor') {
    return '/instructor/notifications';
  }

  if (role === 'admin') {
    return '/admin/notifications';
  }

  return '/student/notifications';
}

const UNREAD_POLL_INTERVAL_MS = 45_000;
const RECENT_LIMIT = 10;

export function NotificationBell() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] =
    useState(0);

  const [items, setItems] =
    useState<AppNotification[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(false);

  const [markingAll, setMarkingAll] =
    useState(false);

  const pollRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

  const refreshUnreadCount =
    useCallback(async () => {
      try {
        const count =
          await notificationService.getUnreadCount();

        setUnreadCount(count);
      } catch {
        // Keep the previous count if polling fails.
      }
    }, []);

  const loadRecent =
    useCallback(async () => {
      setLoading(true);
      setError(false);

      try {
        const result =
          await notificationService.getNotifications(
            {
              limit: RECENT_LIMIT,
            },
          );

        setItems(result.items);
        setUnreadCount(result.unread_count);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, []);

  // Keep the unread badge updated.
  useEffect(() => {
    refreshUnreadCount();

    pollRef.current = setInterval(
      refreshUnreadCount,
      UNREAD_POLL_INTERVAL_MS,
    );

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [refreshUnreadCount]);

  // Load notifications when dropdown opens.
  useEffect(() => {
    if (open) {
      loadRecent();
    }
  }, [open, loadRecent]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);

    try {
      await notificationService.markAllAsRead();

      setItems((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch {
      // Leave state unchanged so the user can retry.
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-4 w-4" />

          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-0 px-1 text-xs">
              {unreadCount > 99
                ? '99+'
                : unreadCount}
            </Badge>
          )}

          <span className="sr-only">
            Notifications
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="z-50 w-80 rounded-md bg-white p-0 text-black shadow-lg"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">

          <DropdownMenuLabel className="p-0">
            Notifications
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}

              Mark all as read
            </Button>
          )}

        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Notification List */}
        <ScrollArea className="max-h-96">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">

              <p className="text-sm text-muted-foreground">
                Couldn't load notifications.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={loadRecent}
              >
                Retry
              </Button>

            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            items.length === 0 && (
              <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">

                <p className="text-sm font-medium">
                  You're all caught up.
                </p>

                <p className="text-xs text-muted-foreground">
                  No new notifications.
                </p>

              </div>
            )}

          {/* Notifications */}
          {!loading &&
            !error &&
            items.map((notification) => (
              /*
               * IMPORTANT:
               * This is now a DIV instead of a BUTTON.
               *
               * The notification itself is therefore
               * NOT clickable.
               */
              <div
                key={notification.id}
                className={cn(
                  'flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm',
                  !notification.is_read &&
                    'bg-accent/40',
                )}
              >

                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    notification.is_read
                      ? 'bg-transparent'
                      : 'bg-primary',
                  )}
                  aria-hidden
                />

                <div className="flex min-w-0 flex-col space-y-1">

                  <p
                    className={cn(
                      'font-medium leading-tight',
                      !notification.is_read &&
                        'font-semibold',
                    )}
                  >
                    {notification.title}
                  </p>

                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(
                      notification.created_at,
                    )}
                  </p>

                </div>

              </div>
            ))}

        </ScrollArea>

        <DropdownMenuSeparator className="m-0" />

        {/* View all remains clickable */}
        <button
          onClick={() => {
            setOpen(false);
            navigate(getNotificationsPath());
          }}
          className="block w-full px-3 py-2.5 text-center text-sm text-primary hover:bg-accent"
        >
          View all notifications
        </button>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

