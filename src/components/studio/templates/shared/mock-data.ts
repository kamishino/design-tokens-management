import { faker } from '@faker-js/faker';

export interface StudioMockData {
  product: {
    name: string;
    description: string;
    price: string;
    oldPrice: string;
    category: string;
    image: string;
    rating: number;
    reviews: number;
    tags: string[];
    variants: {
      colors: string[];
      sizes: string[];
    };
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
  };
  brand: {
    tagline: string;
    heroTitle: string;
    heroDesc: string;
  };
}

export const generateStudioMockData = (): StudioMockData => {
  return {
    product: {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: `$${faker.commerce.price({ min: 100, max: 1000 })}`,
      oldPrice: `$${faker.commerce.price({ min: 1100, max: 2000 })}`,
      category: faker.commerce.department(),
      image: faker.image.urlLoremFlickr({ category: 'product', width: 800, height: 800 }),
      rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      reviews: faker.number.int({ min: 10, max: 500 }),
      tags: [faker.commerce.productAdjective(), faker.commerce.productMaterial()],
      variants: {
        colors: [faker.color.rgb(), faker.color.rgb(), faker.color.rgb()],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      }
    },
    dashboard: {
      totalRevenue: `$${faker.finance.amount({ min: 10000, max: 100000, symbol: '' })}`,
      activeUsers: faker.number.int({ min: 500, max: 5000 }),
      conversionRate: `${faker.number.float({ min: 1, max: 5, fractionDigits: 2 })}%`,
      salesCount: faker.number.int({ min: 100, max: 1000 }),
      recentTransactions: Array.from({ length: 5 }).map(() => ({
        id: faker.string.alphanumeric(8).toUpperCase(),
        user: faker.person.fullName(),
        amount: `$${faker.finance.amount()}`,
        status: faker.helpers.arrayElement(['success', 'pending', 'failed']),
        date: faker.date.recent().toLocaleDateString(),
      }))
    },
    brand: {
      tagline: faker.company.catchPhrase(),
      heroTitle: faker.company.catchPhrase(),
      heroDesc: faker.lorem.paragraph(),
    }
  };
};
