import { cn } from '@/lib/utils';
import { CalendarCheck } from 'lucide-react';
import Image from 'next/image';

export function Logo({ className, logoUrl, useText = false, isLogin = false }: { className?: string, logoUrl?: string, useText?: boolean, isLogin?: boolean }) {
  const showText = useText || !logoUrl;

  const logoContainerSize = isLogin ? 'h-20 w-20' : 'h-10 w-10';
  const logoIconSizeClass = isLogin ? 'h-10 w-10' : 'h-5 w-5';
  const logoImageSize = isLogin ? 80 : 40;


  const backgroundClass = 'bg-transparent';

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-lg font-semibold text-sidebar-foreground font-headline',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-lg text-primary-foreground',
        logoContainerSize,
        backgroundClass
        )}>
        {logoUrl ? (
          <Image src={logoUrl} alt="Logo" width={logoImageSize} height={logoImageSize} className="object-contain" />
        ) : (
          <CalendarCheck className={cn("text-slate-800 dark:text-white", logoIconSizeClass)} />
        )}
      </div>
      {showText && (
        <span className="hidden group-data-[collapsible=icon]:hidden text-slate-800 dark:text-white">
          SiRancak
        </span>
      )}
    </div>
  );
}
