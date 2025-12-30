import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');

  // Delete all messages first (due to foreign key constraint)
  const deletedMessages = await prisma.message.deleteMany({});
  console.log(`Deleted ${deletedMessages.count} messages`);

  // Delete all conversations
  const deletedConversations = await prisma.conversation.deleteMany({});
  console.log(`Deleted ${deletedConversations.count} conversations`);

  console.log('Database cleared successfully!');
}

main()
  .catch((e) => {
    console.error('Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
