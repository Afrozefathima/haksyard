export default function Stepper({ step, steps }) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < step;
        const isActive = stepNumber === step;

        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2
                ${isCompleted ? 'bg-yellow-500 border-yellow-500 text-white' : ''}
                ${isActive ? 'border-yellow-500 text-yellow-500 font-semibold' : ''}
                ${!isActive && !isCompleted ? 'border-gray-300 text-gray-400' : ''}
              `}
            >
              {stepNumber}
            </div>

            {/* Label and connector line */}
            <div className="ml-2 text-sm font-medium whitespace-nowrap text-gray-700">
              {label}
            </div>

            {stepNumber !== steps.length && (
              <div
                className={`
                  flex-1 h-0.5 ml-4
                  ${isCompleted ? 'bg-yellow-500' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
