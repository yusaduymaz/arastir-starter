import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Architectural Boundary: RapidAPI', () => {
  const forbiddenImportPatterns = [
    /from ['"]@\/lib\/rapidapi/,
    /from ['"]\.\.\/\.\.\/lib\/rapidapi/,
    /from ['"]\.\.\/lib\/rapidapi/,
    /import .* from ['"]@\/lib\/rapidapi/,
  ];

  const checkDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkDirectory(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        forbiddenImportPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            throw new Error(`Architectural violation in ${fullPath}: Direct import from src/lib/rapidapi is forbidden in Phase 15. UI and Agents should be decoupled.`);
          }
        });
      }
    });
  };

  it('should not be imported by agents', () => {
    const agentsDir = path.resolve(__dirname, '../../../../src/agents');
    if (fs.existsSync(agentsDir)) {
      checkDirectory(agentsDir);
    }
  });

  it('should not be imported by app (UI)', () => {
    const appDir = path.resolve(__dirname, '../../../../src/app');
    if (fs.existsSync(appDir)) {
      checkDirectory(appDir);
    }
  });
});
