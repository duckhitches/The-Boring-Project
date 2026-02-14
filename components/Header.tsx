/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";


export const Header = () => (
  <header className="sticky top-0 z-40 w-full h-14 sm:h-16 md:h-20 mb-6 flex items-center border-b border-white/10 bg-neutral-900/90 backdrop-blur-md zalando-sans-semiexpanded-medium">
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between">
      <h1 className="flex-shrink-0">
        <Link
          href="/"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
          aria-label="Home"
        >
          <Image
            src="/images/brand-logo.png"
            alt="The Boring Project"
            width={120}
            height={48}
            className="h-8 w-auto sm:h-9 md:h-10 object-contain hover:opacity-90 transition-opacity"
            priority
          />
        </Link>
      </h1>
    </div>
  </header>
);
