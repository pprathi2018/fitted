import Link from 'next/link';
import { User, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

export default function ProfileGuest() {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 size-16 rounded-full bg-fitted-blue-sky flex items-center justify-center">
          <User className="size-8 text-fitted-blue-accent" />
        </div>
        <CardTitle className="text-3xl font-bold">Welcome to Fitted</CardTitle>
        <CardDescription className="text-base">
          Log in to access your virtual wardrobe
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3">
          <Button asChild className={cn(fittedButton({ variant: "primary", size: "full" }))}>
            <Link href="/login" className="flex items-center justify-center gap-3">
              <LogIn className="size-5" />
              <span>Log In</span>
            </Link>
          </Button>
          
          <Button asChild className={cn(fittedButton({ variant: "secondary", size: "full" }))}>
            <Link href="/signup" className="flex items-center justify-center gap-3">
              <UserPlus className="size-5" />
              <span>Create Account</span>
            </Link>
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-fitted-gray-800 mb-3">
            Why create an account?
          </h3>
          <ul className="space-y-2 text-sm text-fitted-gray-600">
            {[
              'Save your clothing items permanently',
              'Create and manage multiple outfits',
              'Access your wardrobe from any device',
              'Share outfits with friends'
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}