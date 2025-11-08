import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export function useInstructorAuth(): boolean {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/auth/login?role=instructor');
          return;
        }

        const user = await authService.getCurrentUser();
        if (user.role !== 'instructor') navigate('/dashboard');
      } catch {
        navigate('/auth/login?role=instructor');
      } finally {
        setChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  return checked;
}
