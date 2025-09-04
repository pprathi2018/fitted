'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface UseAuthCheckOptions {
  onFailure?: () => void;
  onSuccess?: () => void;
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
  const { onFailure, onSuccess } = options;
  const { checkAuth, silentLogout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const validationAttempted = useRef(false);

  useEffect(() => {
    if (!validationAttempted.current) {
      validationAttempted.current = true;
      
      const validateAuth = async () => {
        setIsValidating(true);
        try {
          const success = await checkAuth();
          
          if (success) {
            onSuccess?.();
          } else {
            setShowAuthModal(true);
            await silentLogout();
            onFailure?.();
          }
        } catch (error) {
          setShowAuthModal(true);
          await silentLogout();
          onFailure?.();
        } finally {
          setIsValidating(false);
        }
      };

      validateAuth();
    }
  }, [checkAuth, silentLogout, onFailure, onSuccess]);

  return {
    showAuthModal,
    isValidating,
  };
}