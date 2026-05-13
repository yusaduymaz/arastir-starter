import { execSync } from 'child_process';
import fs from 'fs';

function testAgent02() {
  console.log("Testing AGENT-02: search-agent.ts execution");
  const agentPath = 'src/agents/search-agent.ts';
  if (!fs.existsSync(agentPath)) {
    throw new Error(`Agent file not found: ${agentPath}`);
  }
  // Try to run it
  try {
    execSync(`npx ts-node ${agentPath} THYAO`, { stdio: 'pipe' });
  } catch (err: any) {
    throw new Error(`search-agent failed to execute: ${err.message}`);
  }
  
  // Verify it created a file in research/
  const files = fs.readdirSync('research').filter(f => f.includes('THYAO-kap.json'));
  if (files.length === 0) {
    throw new Error("Expected research output file containing THYAO-kap.json");
  }
  console.log("Test passed.");
}

try {
  testAgent02();
} catch (err: any) {
  console.error("Test failed:", err.message);
  process.exit(1);
}
