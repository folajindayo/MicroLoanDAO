export const getProjectId = () => {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';
  if (!projectId) {
    throw new Error('Project ID is not defined');
  }
  return projectId;
};

export const getContractAddress = () => {
    return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
}

