const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@taskflow.com', password: adminPassword, role: 'ADMIN' },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@taskflow.com' },
    update: {},
    create: { name: 'Team Member', email: 'member@taskflow.com', password: memberPassword, role: 'MEMBER' },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.task.createMany({
    data: [
      { title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups', status: 'DONE', priority: 'HIGH', projectId: project.id, assigneeId: member.id, createdById: admin.id, dueDate: yesterday },
      { title: 'Implement authentication', description: 'Set up login and signup flows', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project.id, assigneeId: admin.id, createdById: admin.id, dueDate: tomorrow },
      { title: 'Build dashboard page', description: 'Create the main dashboard with stats and charts', status: 'TODO', priority: 'MEDIUM', projectId: project.id, assigneeId: member.id, createdById: admin.id, dueDate: nextWeek },
      { title: 'Set up CI/CD pipeline', description: 'Configure automated testing and deployment', status: 'TODO', priority: 'LOW', projectId: project.id, createdById: admin.id, dueDate: nextWeek },
      { title: 'Write API documentation', description: 'Document all REST endpoints', status: 'TODO', priority: 'MEDIUM', projectId: project.id, assigneeId: member.id, createdById: admin.id, dueDate: yesterday },
    ],
  });

  console.log('Seed completed: admin@taskflow.com / admin123, member@taskflow.com / member123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
