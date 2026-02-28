import { CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type CardTitleWithInfoProps = {
  title: string;
  infoContent: React.ReactNode;
  titleClassName?: string;
};

export function CardTitleWithInfo({
  title,
  infoContent,
  titleClassName,
}: CardTitleWithInfoProps) {
  return (
    <div className="flex items-center gap-1.5">
      <CardTitle className={cn('text-base', titleClassName)}>
        {title}
      </CardTitle>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label="More information"
          >
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 text-sm" align="start">
          {infoContent}
        </PopoverContent>
      </Popover>
    </div>
  );
}
