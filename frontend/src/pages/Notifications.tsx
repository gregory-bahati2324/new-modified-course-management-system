import { NotificationList } from '@/components/notifications/NotificationList';

/**
 * Shared notifications page (§29). The LMS's other "full page" views
 * (Dashboard, Profile, Settings) aren't split per-role either — role
 * only matters for which sidebar/layout wraps the page, not for this
 * content, since a notification always belongs to the logged-in user
 * regardless of role. Mounted at /student/notifications,
 * /instructor/notifications and /admin/notifications (see
 * routes/AppRoutes.tsx), each under its own layout.
 */
export default function Notifications() {
  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay up to date with your courses, assignments, and grades.
        </p>
      </div>

      <NotificationList />
    </div>
  );
}
