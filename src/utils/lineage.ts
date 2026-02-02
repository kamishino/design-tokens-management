/**
 * Resolves the physical path lineage for a given project target.
 * Format expected: "client-id/project-id"
 */
export const resolveLineage = (projectPath: string): string[] => {
  const [clientId, projectId] = projectPath.split('/');
  
  if (!clientId || !projectId) {
    throw new Error('Invalid project path format. Expected "client/project"');
  }

  return [
    'tokens/global/**/*.json',
    `tokens/clients/${clientId}/*.json`,
    `tokens/clients/${clientId}/projects/${projectId}/*.json`
  ];
};
