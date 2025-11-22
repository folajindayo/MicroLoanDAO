import { projectId } from '@/config';

export function validateProjectId() {
  if (!projectId) {
    throw new Error('Project ID is not defined');
  }
  if (projectId === 'b56e18d47c72ab683b10814fe9495694') {
      console.warn('Using default example Project ID. Please update in .env');
  }
}

