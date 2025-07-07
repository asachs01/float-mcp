import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from './projects.js';
import { listTasks, getTask, createTask, updateTask, deleteTask } from './tasks.js';
import { listPeople, getPerson, createPerson, updatePerson, deletePerson } from './people.js';
import { listClients, getClient, createClient, updateClient, deleteClient } from './clients.js';
import {
  listAllocations,
  getAllocation,
  createAllocation,
  updateAllocation,
  deleteAllocation,
} from './allocations.js';

export const tools = [
  // Project tools
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,

  // Task tools
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,

  // People tools
  listPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,

  // Client tools
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,

  // Allocation tools
  listAllocations,
  getAllocation,
  createAllocation,
  updateAllocation,
  deleteAllocation,
];
