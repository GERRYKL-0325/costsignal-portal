export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    maxSeries: 10,
    maxDownloadsPerMonth: 5,
    historyYears: 3,        // can only go back 3 years in builder
    savedConfigs: 3,
    apiAccess: false,
    features: [
      '10 series per export',
      '5 downloads/month',
      '3-year history',
      'Builder access',
      'TAM Engine',
    ],
  },
  pro: {
    label: 'Pro',
    price: 29,
    maxSeries: 999,
    maxDownloadsPerMonth: 999,
    historyYears: 11,       // full 2015→present
    savedConfigs: 999,
    apiAccess: false,
    features: [
      'Unlimited series',
      'Unlimited downloads',
      'Full 2015→present history',
      'Saved templates',
      'Priority support',
    ],
  },
  api: {
    label: 'API',
    price: 49,
    maxSeries: 999,
    maxDownloadsPerMonth: 999,
    historyYears: 11,
    savedConfigs: 999,
    apiAccess: true,
    features: [
      'Everything in Pro',
      'REST API access',
      'API key management',
      'Usage analytics',
      '500 API calls/day',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanBadgeColor(plan: PlanId): string {
  switch (plan) {
    case 'free': return '#444';
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
