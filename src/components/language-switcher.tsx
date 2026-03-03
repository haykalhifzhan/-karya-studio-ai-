'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gold-100 dark:hover:bg-gold-900/20"
          title="Change Language / Ubah Bahasa"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => setLanguage('id')}
          className={`cursor-pointer flex items-center gap-2 ${
            language === 'id' ? 'bg-gold-50 dark:bg-gold-900/20' : ''
          }`}
        >
          <span className="text-lg">🇮🇩</span>
          <span>Bahasa Indonesia</span>
          {language === 'id' && <span className="ml-auto text-gold-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`cursor-pointer flex items-center gap-2 ${
            language === 'en' ? 'bg-gold-50 dark:bg-gold-900/20' : ''
          }`}
        >
          <span className="text-lg">🇬🇧</span>
          <span>English</span>
          {language === 'en' && <span className="ml-auto text-gold-600">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}