import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { demoSiteContent } from './demo-data';
import { isDemoMode, supabase } from './supabase';

export type SiteContent = typeof demoSiteContent;

interface SiteContentContextType {
  content: SiteContent;
  updateContent: (path: string, value: string) => void;
  updateStat: (index: number, field: 'number' | 'label', value: string) => void;
  saveContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => {
    if (isDemoMode) return { ...demoSiteContent };
    return { ...demoSiteContent };
  });

  useEffect(() => {
    if (isDemoMode) return;
    supabase.from('site_content').select('value').eq('content_key', 'public').maybeSingle().then(({ data }) => {
      if (data?.value) setContent(data.value as SiteContent);
    });
  }, []);

  const updateContent = useCallback((path: string, value: string) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const updateStat = useCallback((index: number, field: 'number' | 'label', value: string) => {
    setContent(prev => {
      const next = { ...prev, stats: prev.stats.map((s, i) => i === index ? { ...s, [field]: value } : s) };
      return next;
    });
  }, []);

  const saveContent = useCallback(async () => {
    if (isDemoMode) return;
    const { error } = await supabase.from('site_content').upsert({ content_key: 'public', value: content }, { onConflict: 'content_key' });
    if (error) throw error;
  }, [content]);

  return (
    <SiteContentContext.Provider value={{ content, updateContent, updateStat, saveContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}
