import { describe, it, expect } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildDocs } from '../../src/docs/build-docs.js';
import { resolve } from 'node:path';

describe('buildDocs', () => {
  it('should build documents with valid input', async () => {
    // Create a temporary generated JSON file
    const tempDir = join(tmpdir(), 'build-docs-test');
    await mkdir(tempDir, { recursive: true });

    const jsonFile = join(tempDir, 'generated.json');
    await writeFile(
      jsonFile,
      JSON.stringify({
        resume: '# Resume',
        coverLetter: {
          paragraphs: ['Dear Hiring Manager,'],
        },
        jobTitle: 'Software Engineer',
      })
    );

    const outputDir = join(tempDir, 'output');
    await mkdir(outputDir, { recursive: true });

    const result = await buildDocs({
      generatedJsonFile: jsonFile,
      themeName: 'clean_professional',
      outputDirectory: outputDir,
    });

    expect(result.outputDirectory).toBeDefined();
    expect(result.files).toBeDefined();
    expect(result.files.length).toBeGreaterThan(0);
  });

  it('should throw for invalid theme name', async () => {
    const tempDir = join(tmpdir(), 'build-docs-invalid');
    await mkdir(tempDir, { recursive: true });

    const jsonFile = join(tempDir, 'generated.json');
    await writeFile(
      jsonFile,
      JSON.stringify({
        resume: '# Resume',
        coverLetter: {
          paragraphs: [],
        },
      })
    );

    const outputDirParam = join(tempDir, 'output');
    await mkdir(outputDirParam, { recursive: true });

    await expect(
      buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'invalid-theme',
        outputDirectory: outputDirParam,
      })
    ).rejects.toThrow();
  });
});
