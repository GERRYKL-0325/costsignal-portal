export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    maxSeries: 30,
    maxDownloadsPerMonth: 5,
    historyYears: 3,
    savedConfigs: 1,
    apiAccess: false,
    tagline: 'Explore the catalog. Build your first model.',
    features: [
      'Access to 30 series across all categories',
      '3 years of monthly history',
      '5 Excel & CSV exports/month',
      'Builder & TAM Engine',
      'BLS, FRED & EIA data sources',
    ],
    limits: [
      'No saved presets',
      'No API access',
    ],
  },
  pro: {
    label: 'Pro',
    price: 29,
    maxSeries: 999,
    maxDownloadsPerMonth: 999,
    historyYears: 11,
    savedConfigs: 50,
    apiAccess: false,
    tagline: 'Full catalog. Full history. No limits on exports.',
    features: [
      'All 150+ series across every category',
      'Full history back to Jan 2015',
      'Unlimited Excel & CSV exports',
      'Up to 50 saved presets',
      'Priority email support',
      'Early access to new categories',
    ],
    limits: [],
  },
  api: {
    label: 'API',
    price: 49,
    maxSeries: 999,
    maxDownloadsPerMonth: 999,
    historyYears: 11,
    savedConfigs: 999,
    apiAccess: true,
    tagline: 'Pipe live data directly into your models and tools.',
    features: [
      'Everything in Pro',
      'REST API — 1,000 calls/day',
      'JSON endpoints for every series',
      'API key management & usage analytics',
      'Plug into Excel Power Query, Python, or any BI tool',
      'Unlimited saved presets',
    ],
    limits: [],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanBadgeColor(plan: PlanId): string {
  switch (plan) {
    case 'free': return '#333';
    case 'pro': return '#60a5fa';
    case 'api': return '#4ade80';
  }
}

export function getPlanBadgeTextColor(plan: PlanId): string {
  switch (plan) {
    case 'free': return '#aaa';
    case 'pro': return '#000';
    case 'api': return '#000';
  }
}
