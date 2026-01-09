/**
 * Cost calculation utilities
 */

const COST_PER_WORKFLOW = 0.05;

/**
 * Calculate estimated cost per run based on number of workflows
 */
export function calculateCostPerRun(workflowCount: number): number {
  return workflowCount * COST_PER_WORKFLOW;
}

