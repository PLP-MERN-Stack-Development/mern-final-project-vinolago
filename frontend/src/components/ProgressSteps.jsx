import React from 'react';

const ProgressSteps = ({ steps, activeIndex }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex flex-col items-center w-full relative">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm z-10
            ${index <= activeIndex
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-600"
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`text-sm mt-1 ${
              index <= activeIndex ? "text-green-600 font-medium" : "text-gray-700"
            }`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`absolute top-4 left-[50%] right-[-50%] h-[2px]
                ${index < activeIndex ? "bg-green-500" : "bg-gray-300"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;