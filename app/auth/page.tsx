"use client";

import React from 'react';
import AuthModal from '../../components/AuthModal';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="w-full max-w-md">
        <AuthModal
          isOpen={true}
          onClose={() => router.back()}
          onAuthSuccess={() => router.push('/')}
        />
      </div>
    </div>
  );
}
