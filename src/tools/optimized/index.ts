// Optimized Float MCP Tools
// These 4 consolidated tools replace 246+ granular tools with decision-tree based operation routing

export { manageEntity } from './manage-entity.js';
export { manageProjectWorkflow } from './manage-project-workflow.js';
export { manageTimeTracking } from './manage-time-tracking.js';
export { generateReport } from './generate-report.js';

// Import the tools for the array export
import { manageEntity } from './manage-entity.js';
import { manageProjectWorkflow } from './manage-project-workflow.js';
import { manageTimeTracking } from './manage-time-tracking.js';
import { generateReport } from './generate-report.js';

// Export array for easy integration
export const optimizedTools = [
  manageEntity,
  manageProjectWorkflow,
  manageTimeTracking,
  generateReport,
];
