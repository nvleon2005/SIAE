"use client";

import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  headingLevel = "h3",
}: EmptyStateProps) {
  const HeadingTag = headingLevel;
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm my-6 transition-all duration-300 ${className}`}
    >
      <div
        className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--accent)]"
        aria-hidden="true"
      >
        {icon || (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>

      <HeadingTag className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-2">
        {title}
      </HeadingTag>

      <p className="text-base text-[var(--muted)] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface)]/80 focus-visible:outline-3 focus-visible:outline-[var(--focus)] transition-colors active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
