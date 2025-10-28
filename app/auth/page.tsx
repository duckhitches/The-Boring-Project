"use client";

import React from 'react';
import AuthModal from '../../components/AuthModal';

export default function AuthPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="w-full max-w-md">
        <AuthModal
          isOpen={true}
          onClose={() => window.history.back()}
          onAuthSuccess={() => window.location.href = '/'}
        />
      </div>
    </div>
  );
}
