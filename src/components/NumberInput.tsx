import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  value,
  onChange,
  min,
  max,
  className = ""
}) => {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className="flex items-center gap-4 w-full">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-14 w-20 p-0 text-2xl font-semibold hover:bg-primary/10 hover:text-primary"
        onClick={decrement}
      >
        -
      </Button>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className={`bg-input border-border text-foreground text-center text-xl font-semibold h-14 px-6 focus-visible:ring-offset-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-14 w-20 p-0 text-2xl font-semibold hover:bg-primary/10 hover:text-primary"
        onClick={increment}
      >
        +
      </Button>
    </div>
  );
};

export default NumberInput;
