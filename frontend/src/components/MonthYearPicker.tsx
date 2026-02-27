import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthYearPickerProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  currentYear: number;
  currentMonth: number;
}

export function MonthYearPicker({
  year,
  month,
  onYearChange,
  onMonthChange,
  currentYear,
  currentMonth,
}: MonthYearPickerProps) {
  const availableYears = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ];
  const availableMonths =
    year === currentYear
      ? Array.from({ length: currentMonth }, (_, i) => i + 1)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleYearChange = (v: string) => {
    const newYear = parseInt(v, 10);
    onYearChange(newYear);
    const maxMonth = newYear === currentYear ? currentMonth : 12;
    if (month > maxMonth) onMonthChange(maxMonth);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={String(month)}
        onValueChange={(v) => onMonthChange(parseInt(v, 10))}
      >
        <SelectTrigger className="h-9 w-full sm:w-[140px] bg-background text-foreground">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {new Date(2000, m - 1).toLocaleString('default', {
                month: 'long',
              })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(year)} onValueChange={handleYearChange}>
        <SelectTrigger className="h-9 w-full sm:w-[100px] bg-background text-foreground">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
