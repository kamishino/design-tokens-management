import { faker } from '@faker-js/faker';

export interface PricingTier {
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

export interface Testimonial {
  user: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StudioMockData {
  product: {
    name: string;
    description: string;
    price: string;
    oldPrice: string;
    category: string;
    image: string;
    rating: number;
    reviewsCount: number;
    tags: string[];
    variants: {
      colors: string[];
      sizes: string[];
    };
    specs: Array<{ label: string; value: string }>;
    reviews: Review[];
  };
  dashboard: {
    totalRevenue: string;
    activeUsers: number;
    conversionRate: string;
    salesCount: number;
    recentTransactions: Array<{
      id: string;
      user: string;
      amount: string;
      status: 'success' | 'pending' | 'failed';
      date: string;
    }>;
    statsHistory: number[];
    topProducts: Array<{ name: string; sales: number; growth: string }>;
  };
  brand: {
    name: string;
    tagline: string;
    heroTitle: string;
    heroDesc: string;
    logo: string;
  };
  pricing: PricingTier[];
  testimonials: Testimonial[];
}

export const generateStudioMockData = (): StudioMockData => {
  return {
    product: {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: `$${faker.commerce.price({ min: 100, max: 1000 })}`,
      oldPrice: `$${faker.commerce.price({ min: 1100, max: 2000 })}`,
      category: faker.commerce.department(),
      image: faker.image.url({ width: 800, height: 800 }),
      rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      reviewsCount: faker.number.int({ min: 10, max: 500 }),
      tags: [faker.commerce.productAdjective(), faker.commerce.productMaterial()],
      variants: {
        colors: [faker.color.rgb(), faker.color.rgb(), faker.color.rgb()],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      },
      specs: [
        { label: "Material", value: faker.commerce.productMaterial() },
        { label: "Weight", value: `${faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 })} kg` },
        { label: "Dimensions", value: `${faker.number.int({ min: 10, max: 50 })} x ${faker.number.int({ min: 10, max: 50 })} cm` },
        { label: "Origin", value: faker.location.country() }
      ],
      reviews: Array.from({ length: 3 }).map(() => ({
        user: faker.person.fullName(),
        rating: faker.number.int({ min: 4, max: 5 }),
        comment: faker.lorem.sentence(),
        date: faker.date.recent().toLocaleDateString()
      }))
    },
    dashboard: {
      totalRevenue: `$${faker.finance.amount({ min: 10000, max: 100000, symbol: '' })}`,
      activeUsers: faker.number.int({ min: 500, max: 5000 }),
      conversionRate: `${faker.number.float({ min: 1, max: 5, fractionDigits: 2 })}%`,
      salesCount: faker.number.int({ min: 100, max: 1000 }),
      recentTransactions: Array.from({ length: 8 }).map(() => ({
        id: faker.string.alphanumeric(8).toUpperCase(),
        user: faker.person.fullName(),
        amount: `$${faker.finance.amount()}`,
        status: faker.helpers.arrayElement(['success', 'pending', 'failed']),
        date: faker.date.recent().toLocaleDateString(),
      })),
      statsHistory: Array.from({ length: 12 }).map(() => faker.number.int({ min: 20, max: 100 })),
      topProducts: Array.from({ length: 4 }).map(() => ({
        name: faker.commerce.productName(),
        sales: faker.number.int({ min: 50, max: 500 }),
        growth: `+${faker.number.int({ min: 5, max: 30 })}%`
      }))
    },
    brand: {
      name: faker.company.name(),
      tagline: faker.company.catchPhrase(),
      heroTitle: faker.company.catchPhrase(),
      heroDesc: faker.lorem.paragraph(),
      logo: faker.image.url({ width: 40, height: 40 }),
    },
    pricing: [
      {
        name: "Starter",
        price: "$0",
        interval: "month",
        description: "Perfect for hobbyists and small projects.",
        features: ["3 Projects", "Basic Tokens", "Community Support"],
        isPopular: false
      },
      {
        name: "Professional",
        price: "$49",
        interval: "month",
        description: "Advanced features for scaling teams.",
        features: ["Unlimited Projects", "Full Lineage", "Priority Support", "Custom Exports"],
        isPopular: true
      },
      {
        name: "Enterprise",
        price: "$199",
        interval: "month",
        description: "Total control for large organizations.",
        features: ["SSO & Security", "Multi-tenant", "Dedicated Manager", "White-labeling"],
        isPopular: false
      }
    ],
    testimonials: Array.from({ length: 3 }).map(() => ({
      user: faker.person.fullName(),
      role: faker.person.jobTitle(),
      company: faker.company.name(),
      content: faker.lorem.sentence(),
      avatar: faker.image.avatar()
    }))
  };
};