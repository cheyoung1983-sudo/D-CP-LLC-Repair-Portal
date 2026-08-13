import { useEffect } from 'react';

export type TabType = 'home' | 'intake' | 'matrix' | 'calc' | 'track' | 'booking' | 'analytics' | 'academy' | 'support' | 'about' | 'blueprint';

interface SEOProps {
  activeTab: TabType;
  customTitle?: string;
  customDescription?: string;
}

const TAB_META_MAP: Record<TabType, { title: string; description: string; keywords: string }> = {
  home: {
    title: 'D&CP LLC | High-Precision Electronics Repair & Refurbished Store',
    description: "Spokane's premier micro-soldering & electronics restoration lab. Explore certified refurbished devices, component intake, and precision repair services.",
    keywords: 'electronics repair, Spokane repair lab, micro-soldering, iPhone repair, MacBook logic board, refurbished phones'
  },
  intake: {
    title: 'Device Repair Intake & Diagnostic Ticket | D&CP LLC',
    description: 'Submit your device for component-level diagnosis, micro-soldering, OLED replacement, or liquid damage restoration with instant order sync.',
    keywords: 'device intake, repair ticket, logic board repair, screen replacement, liquid damage recovery, diagnostic scan'
  },
  matrix: {
    title: 'Board Repair Support Matrix & Device Database | D&CP LLC',
    description: 'Query our live database of supported device models, PCB board IDs, schematics coverage, donor board staging, and Tier 3/4 micro-soldering capabilities.',
    keywords: 'supported device database, board repair compatibility, iPhone board IDs, MacBook schematics, PS5 HDMI repair, Steam Deck PMIC'
  },
  booking: {
    title: 'Schedule Spokane Lab Drop-Off & Express Triage | D&CP LLC',
    description: 'Book a same-day or 24/7 secure lockbox drop-off appointment at our Spokane WA repair laboratory. Fast turnaround & certified bench technicians.',
    keywords: 'Spokane drop off repair, lab appointment, same day phone repair, lockbox drop off, 115 S Adams St Spokane'
  },
  calc: {
    title: 'Precision Repair Cost Calculator & Price Guide | D&CP LLC',
    description: 'Calculate instant, transparent repair pricing for iPhone, MacBook, iPad, and Android logic board, battery, display, and rush service options.',
    keywords: 'repair estimate calculator, iPhone repair cost, MacBook screen price, battery replacement quote, micro-soldering pricing'
  },
  track: {
    title: 'Real-Time Repair Status Tracker & Lifecycle Progress | D&CP LLC',
    description: 'Track your device restoration lifecycle live across 5 precision stages from intake triage to BGA soldering and final QA burn-in test.',
    keywords: 'track repair status, repair lifecycle, order status check, device diagnostic progress, ticket lookup'
  },
  analytics: {
    title: 'Repair Telemetry & 30-Day Failure Analytics | D&CP LLC',
    description: 'Explore Spokane Lab bench metrics, turnaround velocity, first-pass yield rates, technician benchmarks, and hardware failure mode distributions.',
    keywords: 'repair analytics, technician telemetry, failure mode rates, turnaround time metric, repair lab yield'
  },
  academy: {
    title: 'Micro-Soldering & Hardware Repair Academy | D&CP LLC',
    description: 'Master Level 3 BGA reballing, PMIC diagnosis, trace repair, and schematic analysis with D&CP certified technical curriculum.',
    keywords: 'micro soldering course, repair academy, BGA reballing training, logic board schematics, IPC soldering certification'
  },
  support: {
    title: 'Technical Laboratory Support & Engineer Help | D&CP LLC',
    description: 'Get technical support, check 1-year warranty terms, speak with bench engineers, or request expedited RMA assistance.',
    keywords: 'repair support, warranty claims, bench engineer contact, Spokane lab help, RMA status'
  },
  about: {
    title: 'Engineering Protocol & ISO Laboratory Standards | D&CP LLC',
    description: 'Discover D&CP LLC ISO-calibrated bench standards, ESD electrostatic protection protocols, cleanroom specifications, and micro-repair ethics.',
    keywords: 'repair engineering protocol, ISO cleanroom repair, ESD protection standards, micro soldering laboratory, D&CP LLC'
  },
  blueprint: {
    title: 'Master Operational Blueprint & Federal Governance | Display & Cell Pros LLC',
    description: 'Corporate identity, SAM.gov UEI registration, IRS Form 941 compliance standards, OBBBA permanent bonus depreciation, and DES Master Contracts.',
    keywords: 'Display & Cell Pros LLC, corporate blueprint, SAM.gov UEI, Form 941 multipliers, OBBBA bonus depreciation, Washington DES master contracts'
  }
};

export default function SEO({ activeTab, customTitle, customDescription }: SEOProps) {
  useEffect(() => {
    const metaInfo = TAB_META_MAP[activeTab] || TAB_META_MAP.home;
    const title = customTitle || metaInfo.title;
    const description = customDescription || metaInfo.description;
    const keywords = metaInfo.keywords;

    // 1. Update Document Title
    document.title = title;

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Update Standard Meta Tags
    updateMetaTag('meta[name="description"]', 'name', 'description', description);
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    updateMetaTag('meta[name="author"]', 'name', 'author', 'D&CP LLC Electronics Laboratory');

    // 3. Update Open Graph Tags
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'D&CP LLC Repair Portal');

    // 4. Update Twitter Card Tags
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

  }, [activeTab, customTitle, customDescription]);

  return null; // Headless component
}
