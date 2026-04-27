'use client';

import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedNumberProps {
  value: string;
  className?: string;
}

interface ParsedNumber {
  num: number;
  decimals: number;
  prefix: string;
  suffix: string;
  // for thousands-dot formatting like "700.000"
  thousandsDotMultiplier: number | null;
}

function parseValue(value: string): ParsedNumber | null {
  // Match an optional prefix of non-digit chars, then the number (with optional decimal comma/dot),
  // then the rest as suffix.
  // Handle "700.000" as thousands separator (not decimal): detect pattern \d{1,3}\.\d{3}$
  const thousandsPattern = /^(\D*)(\d{1,3})\.(\d{3})(\D*)$/;
  const thousandsMatch = value.match(thousandsPattern);
  if (thousandsMatch) {
    const [, prefix, intPart, decPart, suffix] = thousandsMatch;
    const num = parseInt(intPart, 10);
    const multiplier = parseInt(decPart, 10); // e.g. 000 → 0, used to reconstruct
    return { num, decimals: 0, prefix, suffix, thousandsDotMultiplier: multiplier };
  }

  // General pattern: optional prefix, number with optional decimal, optional suffix
  const generalPattern = /^(\D*?)(\d+(?:[.,]\d+)?)(\D*)$/;
  const match = value.match(generalPattern);
  if (!match) return null;

  const [, prefix, numStr, suffix] = match;
  const normalized = numStr.replace(',', '.');
  const num = parseFloat(normalized);
  const decimals = normalized.includes('.') ? (normalized.split('.')[1]?.length ?? 0) : 0;

  return { num, decimals, prefix, suffix, thousandsDotMultiplier: null };
}

function formatCount(count: number, parsed: ParsedNumber): string {
  if (parsed.thousandsDotMultiplier !== null) {
    // Reconstruct e.g. "700.000"
    return `${parsed.prefix}${count}.${String(parsed.thousandsDotMultiplier).padStart(3, '0')}${parsed.suffix}`;
  }
  const formatted = parsed.decimals > 0 ? count.toFixed(parsed.decimals) : String(Math.floor(count));
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const parsed = parseValue(value);

  const { count, ref } = useCountUp({
    end: parsed?.num ?? 0,
    duration: 2000,
    decimals: parsed?.decimals ?? 0,
  });

  // If no number found, render static
  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {formatCount(count, parsed)}
    </span>
  );
}
