"use client";

import { useEffect, useRef, useState } from "react";

// Continuous swirl — no dangling tail, just loops that keep going
const PATH =
  "M 20 50 C 20 30, 40 24, 40 42 C 40 56, 20 56, 20 40 " +
  "C 20 22, 48 18, 48 40 C 48 58, 24 58, 28 38 " +
  "C 32 18, 58 16, 56 40 C 54 60, 32 60, 38 38 " +
  "C 44 18, 68 18, 66 40 C 64 60, 44 60, 50 40 " +
  "C 56 20, 78 20, 76 40 C 74 58, 56 60, 62 42 " +
  "C 68 24, 88 26, 86 44 C 84 58, 70 58, 76 42 " +
  "C 82 28, 98 30, 95 46";

export default function Scribble({ className = "" }: { className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Show a visible window of ~30% of the path, sliding endlessly
  const window = length * 0.3;

  return (
    <svg
      viewBox="0 0 115 80"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {length > 0 && (
        <style>{`
          @keyframes swirl {
            0% {
              stroke-dashoffset: ${length};
            }
            100% {
              stroke-dashoffset: ${-length};
            }
          }
        `}</style>
      )}
      <path
        ref={pathRef}
        d={PATH}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={
          length
            ? {
                strokeDasharray: `${window} ${length - window}`,
                strokeDashoffset: length,
                animation: "swirl 3s linear infinite",
              }
            : { opacity: 0 }
        }
      />
    </svg>
  );
}
