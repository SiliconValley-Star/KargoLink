import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Desktop'ta varsayılan olarak açık, mobile'da kapalı
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sidebar_open');
      if (saved) return JSON.parse(saved);
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Responsive design için ekran boyutu takibi
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Mobile'da sidebar'ı otomatik kapat
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Desktop'ta sidebar durumunu localStorage'a kaydet
    if (!isMobile) {
      localStorage.setItem('admin_sidebar_open', JSON.stringify(newState));
    }
  };

  const handleSetSidebarOpen = (open: boolean) => {
    setSidebarOpen(open);
    
    if (!isMobile) {
      localStorage.setItem('admin_sidebar_open', JSON.stringify(open));
    }
  };

  // Sidebar genişliği - açık/kapalı duruma göre
  const sidebarWidth = sidebarOpen ? 280 : 64;

  const value: LayoutContextType = {
    sidebarOpen,
    sidebarWidth,
    toggleSidebar,
    setSidebarOpen: handleSetSidebarOpen,
    isMobile,
    pageTitle,
    setPageTitle,
    breadcrumbs,
    setBreadcrumbs,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Page helper hooks
export const usePageTitle = (title: string) => {
  const { setPageTitle } = useLayout();
  
  React.useEffect(() => {
    setPageTitle(title);
    document.title = `${title} - CargoLink Admin`;
    
    return () => {
      setPageTitle('Dashboard');
      document.title = 'CargoLink Admin';
    };
  }, [title, setPageTitle]);
};

export const useBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
  const { setBreadcrumbs } = useLayout();
  
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
    
    return () => {
      setBreadcrumbs([]);
    };
  }, [breadcrumbs, setBreadcrumbs]);
};

// Theme helper functions
export const getResponsiveValue = <T,>(
  mobile: T,
  tablet: T,
  desktop: T,
  currentWidth: number
): T => {
  if (currentWidth < 768) return mobile;
  if (currentWidth < 1024) return tablet;
  return desktop;
};

export const useResponsive = () => {
  const { isMobile } = useLayout();
  
  const isTablet = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  };

  const isDesktop = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  };

  return {
    isMobile,
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
  };
};