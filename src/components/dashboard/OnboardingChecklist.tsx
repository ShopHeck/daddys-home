"use client";

import Link from "next/link";

type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
};

type OnboardingChecklistProps = {
  steps: OnboardingStep[];
};

export function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const allComplete = completedCount === steps.length;

  if (allComplete) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Get started</h2>
        <span className="text-sm text-slate-400">
          {completedCount} of {steps.length} complete
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={[
              "flex items-start gap-3 rounded-lg border p-4 transition",
              step.completed
                ? "border-slate-700/50 bg-slate-800/30"
                : "border-slate-700 bg-slate-800",
            ].join(" ")}
          >
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
              {step.completed ? (
                <svg
                  className="h-5 w-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={[
                  "font-medium",
                  step.completed
                    ? "text-slate-500 line-through"
                    : "text-white",
                ].join(" ")}
              >
                {step.label}
              </p>
              <p
                className={[
                  "mt-1 text-sm",
                  step.completed ? "text-slate-600" : "text-slate-400",
                ].join(" ")}
              >
                {step.description}
              </p>

              {!step.completed && (
                <Link
                  href={step.href}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-400 transition hover:text-blue-300"
                >
                  {step.id === "api-key" && "Generate API key"}
                  {step.id === "template" && "Create template"}
                  {step.id === "render" && "View documentation"}
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
