import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

/**
 * Mount this ONCE near the root of the app (inside App.tsx).
 * It renders nothing until the access token is about to expire, at
 * which point it shows a countdown and lets the user either extend
 * the session or log out immediately.
 */
export function SessionTimeoutDialog() {
  const { showWarning, secondsRemaining, stayLoggedIn, logoutNow } = useSessionTimeout();

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session is about to expire</AlertDialogTitle>
          <AlertDialogDescription>
            For your security, you'll be signed out automatically in{' '}
            <span className="font-semibold text-foreground">{formatted}</span> due to
            inactivity. Do you want to stay signed in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={logoutNow}>Log out now</AlertDialogCancel>
          <AlertDialogAction onClick={() => void stayLoggedIn()}>
            Stay logged in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}