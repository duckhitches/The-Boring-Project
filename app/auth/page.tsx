/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

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
