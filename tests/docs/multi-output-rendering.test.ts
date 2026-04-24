import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildDocs } from '../../src/docs/build-docs.js';
import type { BuildDocsParams } from '../../src/docs/build-docs.js';

describe('multi-output-rendering', () => {
  let tempDir: string;
  let jsonFile: string;
  let outputDir: string;
  let validJsonContent: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `test-multi-output-${Date.now()}`);
    outputDir = join(tempDir, 'output');
    const fixturesDir = join(tempDir, 'fixtures');

    await mkdir(fixturesDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    jsonFile = join(fixturesDir, 'content.json');

    validJsonContent = JSON.stringify({
      resume: '# Resume Content\n\n## Experience\nSoftware engineer with experience.',
      coverLetter: {
        greeting: 'Dear Hiring Manager,',
        paragraphs: [
          'I am writing to express my interest in this position.',
          'My experience makes me a strong candidate.',
        ],
        closing: 'Sincerely,',
      },
      jobTitle: 'Software Engineer',
      companyName: 'Test Company',
      generatedAt: '2024-01-15T10:30:00Z',
    });

    await writeFile(jsonFile, validJsonContent, 'utf-8');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('renders all resume outputs defined in theme', async () => {
    const params: BuildDocsParams = {
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
      profileName: 'default',
    };

    const result = await buildDocs(params);

    // Should have both resume.full.html and resume.short.html
    expect(result.files).toContain('resume.full.html');
    expect(result.files).toContain('resume.short.html');

    // Verify files exist
    expect(existsSync(join(result.outputDirectory, 'resume.full.html'))).toBe(true);
    expect(existsSync(join(result.outputDirectory, 'resume.short.html'))).toBe(true);
  });

  it('renders all cover letter outputs defined in theme', async () => {
    const params: BuildDocsParams = {
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
      profileName: 'default',
    };

    const result = await buildDocs(params);

    // Should have cover_letter.standard.html
    expect(result.files).toContain('cover_letter.standard.html');

    // Verify file exists
    expect(existsSync(join(result.outputDirectory, 'cover_letter.standard.html'))).toBe(true);
  });

  it('copies all referenced styles to build directory', async () => {
    const params: BuildDocsParams = {
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
      profileName: 'default',
    };

    const result = await buildDocs(params);

    // Both resume outputs reference resume.css, cover letter references cover_letter.css
    expect(existsSync(join(result.outputDirectory, 'styles', 'resume.css'))).toBe(true);
    expect(existsSync(join(result.outputDirectory, 'styles', 'cover_letter.css'))).toBe(true);
  });

  it('renders all outputs using the same context', async () => {
    const params: BuildDocsParams = {
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
      profileName: 'test-profile',
    };

    const result = await buildDocs(params);

    // Check that profile name is in all rendered outputs
    const fullResume = await readFile(join(result.outputDirectory, 'resume.full.html'), 'utf-8');
    const shortResume = await readFile(join(result.outputDirectory, 'resume.short.html'), 'utf-8');
    const coverLetter = await readFile(join(result.outputDirectory, 'cover_letter.standard.html'), 'utf-8');

    // All should have the job title from metadata
    expect(fullResume).toContain('Software Engineer');
    expect(shortResume).toContain('Software Engineer');
    expect(coverLetter).toContain('Software Engineer');
  });

  it('creates timestamped build directory', async () => {
    const params: BuildDocsParams = {
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
      profileName: 'default',
    };

    const result = await buildDocs(params);

    // Output should be in a timestamped subdirectory
    const timestamp = result.outputDirectory.split('/').pop();
    expect(timestamp).toMatch(/^\d+$/);
  });

  it('returns list of all generated files', async () => {
    const params: BuildDocsParams = {
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
      profileName: 'default',
    };

    const result = await buildDocs(params);

    // Should have 3 outputs: 2 resumes + 1 cover letter
    expect(result.files).toHaveLength(3);
  });
});
