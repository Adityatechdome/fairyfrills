import { CheckoutStep, CheckoutStepKey } from "@/lib/types/global"
import { clsx } from "clsx"

type CheckoutProgressProps = {
  steps: CheckoutStep[];
  currentStepIndex: number;
  handleStepChange: (step: CheckoutStepKey) => void;
  className?: string;
};

const CheckoutProgress = ({
  steps,
  currentStepIndex,
  handleStepChange,
  className,
}: CheckoutProgressProps) => {
  const currentStep = steps[currentStepIndex]

  return (
    <div className={clsx("w-full", className)}>
      {/* Mobile: simple step counter */}
      <div className="flex flex-col items-center gap-1 md:hidden py-2">
        <span className="text-sm font-semibold text-[#8B1A4A]">
          {currentStep?.title}
        </span>
        <span className="text-xs text-zinc-400">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </div>

      {/* Desktop: full step indicator */}
      <div className="hidden md:flex items-center justify-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isUpcoming = index > currentStepIndex
          const isClickable = index <= currentStepIndex

          return (
            <div key={step.key} className="flex items-center">
              {/* Step circle + label */}
              <button
                onClick={() => isClickable && handleStepChange(step.key)}
                disabled={!isClickable}
                className={clsx(
                  "flex flex-col items-center gap-2 group transition-all duration-200",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                {/* Circle */}
                <div
                  className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 select-none",
                    isCompleted &&
                      "bg-[#E799AA] text-white shadow-sm",
                    isCurrent &&
                      "bg-[#8B1A4A] text-white shadow-md ring-4 ring-[#8B1A4A]/20",
                    isUpcoming &&
                      "bg-white border-2 border-zinc-200 text-zinc-400"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M3 8L6.5 11.5L13 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={clsx(
                    "text-xs font-medium whitespace-nowrap transition-all duration-200",
                    isCompleted && "text-zinc-700",
                    isCurrent && "text-[#8B1A4A] font-bold",
                    isUpcoming && "text-zinc-400"
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="w-20 h-0.5 mx-3 mb-5 rounded-full transition-all duration-500 overflow-hidden bg-zinc-200">
                  <div
                    className="h-full bg-[#E799AA] transition-all duration-500"
                    style={{ width: index < currentStepIndex ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckoutProgress
