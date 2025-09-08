'use client';

import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface AuthFailedModalProps {
  isOpen: boolean;
  message?: string;
  setShowAuthFailedModal: (show: boolean) => void;
}

export default function AuthFailedModal({ 
  isOpen, 
  message = "Your session has expired. Please log in again to continue.",
  setShowAuthFailedModal,
}: AuthFailedModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
    setShowAuthFailedModal(false);
  };

  const handleSignup = () => {
    router.push('/signup');
    setShowAuthFailedModal(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            Authentication Failed
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleLogin}
            className={cn(fittedButton({ variant: "primary", size: "full" }))}
          >
            <LogIn className="size-5 mr-2" />
            Log In
          </Button>
          
          <Button
            onClick={handleSignup}
            className={cn(fittedButton({ variant: "secondary", size: "full" }))}
          >
            <UserPlus className="size-5 mr-2" />
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}