const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const expenseCategories = [
  { name: 'Food & Dining', icon: 'utensils', color: '#E07A5F', type: 'expense' },
  { name: 'Transport & Fuel', icon: 'car', color: '#457B9D', type: 'expense' },
  { name: 'Rent & Housing', icon: 'home', color: '#81B29A', type: 'expense' },
  { name: 'Utilities', icon: 'zap', color: '#F2CC8F', type: 'expense' },
  { name: 'Healthcare & Medical', icon: 'heart', color: '#E76F51', type: 'expense' },
  { name: 'Entertainment & Leisure', icon: 'film', color: '#6D6875', type: 'expense' },
  { name: 'Shopping & Clothing', icon: 'shopping-bag', color: '#B5838D', type: 'expense' },
  { name: 'Education & Learning', icon: 'book', color: '#4A90E2', type: 'expense' },
  { name: 'Savings & Investments', icon: 'piggy-bank', color: '#2D6A4F', type: 'expense' },
  { name: 'Personal Care', icon: 'smile', color: '#DDA0DD', type: 'expense' },
  { name: 'Gifts & Donations', icon: 'gift', color: '#FF8C94', type: 'expense' },
  { name: 'Subscriptions', icon: 'repeat', color: '#8B9DC3', type: 'expense' },
  { name: 'Miscellaneous', icon: 'more-horizontal', color: '#A8A8A8', type: 'expense' },
];

const incomeCategories = [
  { name: 'Salary', icon: 'briefcase', color: '#81B29A', type: 'income' },
  { name: 'Freelance / Contract', icon: 'code', color: '#457B9D', type: 'income' },
  { name: 'Side Hustle', icon: 'trending-up', color: '#E07A5F', type: 'income' },
  { name: 'Business Income', icon: 'bar-chart', color: '#F2CC8F', type: 'income' },
  { name: 'Investment Returns', icon: 'dollar-sign', color: '#2D6A4F', type: 'income' },
  { name: 'Rental Income', icon: 'key', color: '#6D6875', type: 'income' },
  { name: 'Other Income', icon: 'plus-circle', color: '#A8A8A8', type: 'income' },
];

async function main() {
  console.log('Seeding default categories...');

  for (const cat of [...expenseCategories, ...incomeCategories]) {
    // upsert doesn't work with null in composite unique keys, so check first
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });

    if (!existing) {
      await prisma.category.create({
        data: { ...cat, isDefault: true, userId: null },
      });
    }
  }

  console.log(`Seeded ${expenseCategories.length} expense categories and ${incomeCategories.length} income categories.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
