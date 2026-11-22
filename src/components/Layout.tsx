import React, { useState } from 'react';
import { SiteHeader } from './layout/SiteHeader';
import { ToastNotice } from './layout/ToastNotice';
import { BottomNav } from './layout/BottomNav';
import { InfoModal } from './layout/InfoModal';
import { SiteFooter } from './layout/SiteFooter';

import type { InfoContent, NavigateFn, PageRoute } from './layout/types';
import { INFO_CONTENT } from './layout/infoContent';

export type { PageRoute };

interface LayoutProps {
  currentPage: PageRoute;
  activeCategory: string;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: NavigateFn;
  toastMessage: string | null;
  toastSubtext?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  activeCategory,
  cartCount,
  searchQuery,
  onSearchChange,
  onNavigate,
  toastMessage,
  toastSubtext,
  children,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoContent | null>(null);

  const handleCategoryNav = (cat: string, scrollTarget = 'katalog') => {
    onNavigate('home', { category: cat, scrollTo: scrollTarget });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4000);
  };

  const openInfoModal = (type: string) => {
    if (INFO_CONTENT[type]) {
      setInfoModal(INFO_CONTENT[type]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased">
      {/* HEADER */}
      <SiteHeader currentPage={currentPage} activeCategory={activeCategory} cartCount={cartCount} searchQuery={searchQuery} onSearchChange={onSearchChange} onNavigate={onNavigate} mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} handleCategoryNav={handleCategoryNav} />

      {/* MAIN CONTENT */}
      <main className="w-full pt-28 bg-surface min-h-screen flex-1">{children}</main>

      {/* GLOBAL TOAST NOTIFICATION */}
      <ToastNotice onNavigate={onNavigate} toastMessage={toastMessage} toastSubtext={toastSubtext} />

      {/* MOBILE STICKY BOTTOM NAVIGATION */}
      {currentPage !== 'size-guide' && (
        <BottomNav currentPage={currentPage} cartCount={cartCount} onNavigate={onNavigate} />
      )}

      {/* INFO MODAL FOR FOOTER UTILITY LINKS */}
      {infoModal && (
        <InfoModal infoModal={infoModal} setInfoModal={setInfoModal} />
      )}

      {/* FOOTER */}
      <SiteFooter onNavigate={onNavigate} newsletterEmail={newsletterEmail} setNewsletterEmail={setNewsletterEmail} newsletterSubscribed={newsletterSubscribed} handleCategoryNav={handleCategoryNav} handleNewsletterSubmit={handleNewsletterSubmit} openInfoModal={openInfoModal} />
    </div>
  );
};
