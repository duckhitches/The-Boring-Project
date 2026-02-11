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


export const Header = () => <header className="sticky max-w-7xl mb-6 mx-auto px-4 sm:px-6 py-3 flex items-center justify-end top-0 z-40 w-full h-20 bg-neutral-900/60 backdrop-blur-md border-b border-neutral-800 zalando-sans-semiexpanded-medium">
    <div>
      <h1 className="text-2xl font-bold">
        <Link href="/">
          <Image src="/images/brand-logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </h1>
    </div>
  </header>;
