'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      toast.error('Identifiants invalides.');
      setIsLoading(false);
    } else {
      toast.success('Connexion réussie.');
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@itbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button disabled={isLoading} className="mt-4" type="submit">
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </Button>
      <div className="text-center text-xs text-gray-400 mt-2">
        Démonstration info: Admin<br/>
        Email: admin@itbusiness.com<br/>
        Mot de passe: password123
      </div>
    </form>
  );
}
