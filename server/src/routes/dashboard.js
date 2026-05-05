const express = require('express');
const { authenticate, prisma } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, myTasks, recentTasks] =
      await Promise.all([
        prisma.task.count({ where: { projectId: { in: projectIds } } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
        prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
            status: { not: 'DONE' },
            dueDate: { lt: new Date() },
          },
          include: {
            assignee: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: 'asc' },
        }),
        prisma.task.count({ where: { assigneeId: userId, status: { not: 'DONE' } } }),
        prisma.task.findMany({
          where: { projectId: { in: projectIds } },
          include: {
            assignee: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ]);

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        overdue: overdueTasks.length,
        myOpenTasks: myTasks,
      },
      overdueTasks,
      recentTasks,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
