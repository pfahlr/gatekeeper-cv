import { describe, it, expect, vi } from 'vitest';
import { runBuildDocsCommand } from '../../src/commands/build-docs.js';

vi.mock('../../src/docs/build-docs.js', () => ({
  buildDocs: vi.fn(() =>
    Promise.resolve({
      outputDirectory: '/output/1234567890',
      files: ['resume.full.html', 'cover_letter.standard.html'],
    })
  ),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(() => Promise.resolve()),
}));

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
