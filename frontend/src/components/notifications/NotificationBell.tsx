import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
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
import { notificationService, AppNotification } from '@/services/notificationService';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { cn } from '@/lib/utils';

// Poll unread count every 45s (§32 — plain polling for v1, no WebSockets;
// this interval can be swapped for a push-based subscription later
// without changing this component's public surface).
const UNREAD_POLL_INTERVAL_MS = 45_000;
const RECENT_LIMIT = 10;

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // A missed poll isn't worth surfacing to the user — the badge just
      // stays at its last known value until the next successful poll.
    }
  }, []);

  const loadRecent = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await notificationService.getNotifications({ limit: RECENT_LIMIT });
      setItems(result.items);
      setUnreadCount(result.unread_count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial + periodic unread-count polling, independent of whether the
  // dropdown is open (so the badge stays live).
  useEffect(() => {
    refreshUnreadCount();
    pollRef.current = setInterval(refreshUnreadCount, UNREAD_POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refreshUnreadCount]);

  // Load the recent list only when the dropdown is opened.
  useEffect(() => {
    if (open) loadRecent();
  }, [open, loadRecent]);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      // Optimistic update — flip it locally immediately, reconcile with
      // the server in the background. If the PATCH fails, the next poll
      // / dropdown open will resync the true state.
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      notificationService.markAsRead(notification.id).catch(() => {
        /* best-effort — see comment above */
      });
    }
    setOpen(false);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Leave state as-is; user can retry.
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-0 h-5 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white text-black shadow-lg rounded-md z-50 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        <ScrollArea className="max-h-96">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
              <p className="text-sm text-muted-foreground">Couldn't load notifications.</p>
              <Button variant="outline" size="sm" onClick={loadRecent}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-8 px-4 text-center">
              <p className="text-sm font-medium">You're all caught up.</p>
              <p className="text-xs text-muted-foreground">No new notifications.</p>
            </div>
          )}

          {!loading && !error && items.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                'flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent',
                !notification.is_read && 'bg-accent/40'
              )}
            >
              <span
                className={cn(
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  notification.is_read ? 'bg-transparent' : 'bg-primary'
                )}
                aria-hidden
              />
              <div className="flex flex-col space-y-1 min-w-0">
                <p className={cn('font-medium leading-tight', !notification.is_read && 'font-semibold')}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(notification.created_at)}
                </p>
              </div>
            </button>
          ))}
        </ScrollArea>

        <DropdownMenuSeparator className="m-0" />
        <button
          onClick={() => {
            setOpen(false);
            navigate('/notifications');
          }}
          className="block w-full px-3 py-2.5 text-center text-sm text-primary hover:bg-accent"
        >
          View all notifications
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
