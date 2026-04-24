import { describe, it, expect } from 'vitest';
import { runBuildDocsCommand } from '../../src/commands/build-docs.js';

describe('build-docs command', () => {
  it('should handle basic invocation with all arguments', async () => {
    await runBuildDocsCommand('./sample.json', 'clean_professional', './output');
    // Placeholder test - function executes without error
    expect(true).toBe(true);
  });

  it('should accept profile option', async () => {
    await runBuildDocsCommand('./sample.json', 'clean_professional', './output', {
      profile: 'default'
    });
    expect(true).toBe(true);
  });
});
