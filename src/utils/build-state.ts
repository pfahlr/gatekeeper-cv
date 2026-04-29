import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

export interface BuildState {
  lastJsonFile?: string;
  lastTheme?: string;
  lastProfile?: string;
  lastOutputDirectory?: string;
  lastVariation?: string;
}

const STATE_FILE_PATH = join(process.cwd(), '.gatekeeper-state.json');

export async function loadBuildState(): Promise<BuildState> {
  try {
    if (!existsSync(STATE_FILE_PATH)) {
      return {};
    }
    const content = await readFile(STATE_FILE_PATH, 'utf-8');
    return JSON.parse(content) as BuildState;
  } catch {
    return {};
  }
}

export async function saveBuildState(state: BuildState): Promise<void> {
  try {
    const content = JSON.stringify(state, null, 2);
    await writeFile(STATE_FILE_PATH, content, 'utf-8');
  } catch (error) {
    // Silently fail if we can't save state - don't block the build
    console.error('Warning: Could not save build state:', error);
  }
}

export async function updateBuildState(updates: Partial<BuildState>): Promise<void> {
  const currentState = await loadBuildState();
  const newState = { ...currentState, ...updates };
  await saveBuildState(newState);
}
