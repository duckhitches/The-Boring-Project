/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import React from 'react';
import { ExclamationTriangleIcon } from './IconComponents';

interface ConfirmDeleteModalProps {
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ projectName, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 pt-16 sm:pt-20">
      <div className="bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-[min(28rem,calc(100vw-1.5rem))] p-4 sm:p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="mx-auto flex h-11 w-11 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0">
                 <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left flex-1 min-w-0">
                <h3 className="text-base font-semibold leading-snug text-white" id="modal-title">
                    Delete Project
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Are you sure you want to delete the project &quot;<strong className="text-slate-200 break-words">{projectName}</strong>&quot;? This action cannot be undone.
                </p>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-600 sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
