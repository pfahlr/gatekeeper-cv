import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildDocs } from '../../src/docs/build-docs.js';
import type { GeneratedContent } from '../../src/schemas/generated-content.schema.js';

describe('buildDocs', () => {
  let tempDir: string;
  let outputBaseDir: string;
  let jsonFile: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `build-docs-test-${Date.now()}`);
    outputBaseDir = join(tempDir, 'output');
    await mkdir(outputBaseDir, { recursive: true });
    jsonFile = join(tempDir, 'generated.json');
  });

  afterEach(async () => {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  function createMinimalGeneratedContent(): GeneratedContent {
    return {
      resume: {
        skills: ['JavaScript', 'TypeScript', 'Node.js'],
        experience: [
          {
            company: 'Tech Corp',
            title: 'Senior Developer',
            startDate: '2020-01-15T00:00:00Z',
            endDate: null,
            bullets: ['Led development of microservices architecture'],
          },
        ],
      },
      coverLetter: {
        paragraphs: ['I am excited to apply for this position.'],
      },
    };
  }

  async function writeGeneratedContent(content: GeneratedContent): Promise<void> {
    await writeFile(jsonFile, JSON.stringify(content, null, 2));
  }

  describe('basic functionality', () => {
    it('should build documents with valid input', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      expect(result.outputDirectory).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files).toContain('resume.full.html');
      expect(result.files).toContain('resume.short.html');
    });

    it('should build documents with theme variation', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'basic',
        outputDirectory: outputBaseDir,
        variationName: 'neon',
      });

      expect(result.outputDirectory).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should create output files that exist and contain HTML', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should create timestamped output directory', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      expect(result.outputDirectory).toMatch(/output\/\d+$/);
    });
  });

  describe('content rendering', () => {
    it('should render flat skills list', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('JavaScript');
      expect(html).toContain('TypeScript');
      expect(html).toContain('Node.js');
    });

    it('should render grouped skills correctly', async () => {
      const content: GeneratedContent = {
        ...createMinimalGeneratedContent(),
        resume: {
          ...createMinimalGeneratedContent().resume,
          skills: [
            { category: 'Languages', items: ['JavaScript', 'Python', 'Go'] },
            { category: 'Frameworks', items: ['React', 'Express', 'FastAPI'] },
          ],
          experience: createMinimalGeneratedContent().resume.experience,
        },
      };
      await writeGeneratedContent(content);

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('Languages');
      expect(html).toContain('JavaScript');
      expect(html).toContain('Frameworks');
    });

    it('should render volunteering section', async () => {
      const content: GeneratedContent = {
        ...createMinimalGeneratedContent(),
        resume: {
          ...createMinimalGeneratedContent().resume,
          skills: createMinimalGeneratedContent().resume.skills,
          experience: createMinimalGeneratedContent().resume.experience,
          volunteering: [
            {
              organization: 'Tech Nonprofit',
              title: 'Volunteer Developer',
              startDate: '2022-01-01T00:00:00Z',
              endDate: '2023-01-01T00:00:00Z',
              bullets: ['Built web application for community outreach'],
            },
          ],
        },
      };
      await writeGeneratedContent(content);

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('Tech Nonprofit');
      expect(html).toContain('Volunteer Developer');
    });

    it('should render education with bullets', async () => {
      const content: GeneratedContent = {
        ...createMinimalGeneratedContent(),
        resume: {
          ...createMinimalGeneratedContent().resume,
          skills: createMinimalGeneratedContent().resume.skills,
          experience: createMinimalGeneratedContent().resume.experience,
          education: [
            {
              institution: 'University',
              degree: 'BS Computer Science',
              field: 'Computer Science',
              startDate: '2014-09-01T00:00:00Z',
              endDate: '2018-05-15T00:00:00Z',
              gpa: '3.8',
              bullets: ["Dean's List", "CS Club President"],
            },
          ],
        },
      };
      await writeGeneratedContent(content);

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain("Dean's List");
      expect(html).toContain('BS Computer Science');
    });

    it('should render projects section', async () => {
      const content: GeneratedContent = {
        ...createMinimalGeneratedContent(),
        resume: {
          ...createMinimalGeneratedContent().resume,
          skills: createMinimalGeneratedContent().resume.skills,
          experience: createMinimalGeneratedContent().resume.experience,
          projects: [
            {
              name: 'Open Source Project',
              description: 'A tool for developers',
              technologies: ['TypeScript', 'Node.js'],
              url: 'https://github.com/example/project',
            },
          ],
        },
      };
      await writeGeneratedContent(content);

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('Open Source Project');
      expect(html).toContain('github.com');
    });

    it('should render cover letter', async () => {
      const content: GeneratedContent = {
        ...createMinimalGeneratedContent(),
        coverLetter: {
          greeting: 'Dear Hiring Manager,',
          paragraphs: [
            'I am excited to apply for the Senior Software Engineer position.',
            'My experience aligns well with your requirements.',
          ],
          closing: 'Thank you for your consideration.',
        },
      };
      await writeGeneratedContent(content);

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      const coverLetterPath = join(result.outputDirectory, 'cover_letter.standard.html');
      const html = await readFile(coverLetterPath, 'utf-8');
      expect(html).toContain('Dear Hiring Manager');
      expect(html).toContain('Senior Software Engineer');
    });
  });

  describe('error handling', () => {
    it('should throw for invalid theme name', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      await expect(
        buildDocs({
          generatedJsonFile: jsonFile,
          themeName: 'nonexistent-theme',
          outputDirectory: outputBaseDir,
        })
      ).rejects.toThrow();
    });

    it('should throw for missing JSON file', async () => {
      await expect(
        buildDocs({
          generatedJsonFile: join(tempDir, 'nonexistent.json'),
          themeName: 'clean_professional',
          outputDirectory: outputBaseDir,
        })
      ).rejects.toThrow();
    });

    it('should throw for invalid generated content schema', async () => {
      // Write invalid JSON (missing required fields)
      await writeFile(jsonFile, JSON.stringify({ resume: {}, coverLetter: {} }));

      await expect(
        buildDocs({
          generatedJsonFile: jsonFile,
          themeName: 'clean_professional',
          outputDirectory: outputBaseDir,
        })
      ).rejects.toThrow();
    });

    it('should throw for malformed JSON', async () => {
      await writeFile(jsonFile, '{invalid json}');

      await expect(
        buildDocs({
          generatedJsonFile: jsonFile,
          themeName: 'clean_professional',
          outputDirectory: outputBaseDir,
        })
      ).rejects.toThrow();
    });
  });

  describe('theme variations', () => {
    it('should apply default variation when no variation is specified', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'basic',
        outputDirectory: outputBaseDir,
      });

      expect(result.files).toContain('resume.full.html');

      // Check that default styles are referenced in output
      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('styles/resume.css');
    });

    it('should apply neon variation styles when specified', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'basic',
        outputDirectory: outputBaseDir,
        variationName: 'neon',
      });

      expect(result.files).toContain('resume.full.html');

      // Check that neon styles are referenced in output
      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('styles/neon.css');

      // Verify neon.css file was copied
      const neonCssPath = join(result.outputDirectory, 'styles/neon.css');
      const neonCss = await readFile(neonCssPath, 'utf-8');
      expect(neonCss).toContain('#f72585'); // Neon pink color
    });

    it('should throw error for invalid variation name', async () => {
      await writeGeneratedContent(createMinimalGeneratedContent());

      await expect(
        buildDocs({
          generatedJsonFile: jsonFile,
          themeName: 'basic',
          outputDirectory: outputBaseDir,
          variationName: 'nonexistent',
        })
      ).rejects.toThrow();
    });
  });

  describe('complete workflow', () => {
    it('should handle complete generated content with all fields', async () => {
      const content: GeneratedContent = {
        resume: {
          summary: 'Experienced software engineer with a passion for building scalable applications.',
          skills: [
            { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Go'] },
            { category: 'Frontend', items: ['React', 'Vue.js', 'Tailwind CSS'] },
            { category: 'Backend', items: ['Node.js', 'Express', 'FastAPI'] },
          ],
          experience: [
            {
              company: 'Tech Innovations Inc',
              title: 'Senior Software Engineer',
              startDate: '2020-01-15T00:00:00Z',
              endDate: null,
              location: 'San Francisco, CA',
              bullets: [
                'Led development of microservices architecture serving 1M+ users',
                'Improved application performance by 40%',
              ],
            },
          ],
          volunteering: [
            {
              organization: 'Code for America',
              title: 'Volunteer Tech Lead',
              startDate: '2021-06-01T00:00:00Z',
              endDate: '2022-12-31T00:00:00Z',
              bullets: ['Led team of 5 volunteers'],
            },
          ],
          education: [
            {
              institution: 'University',
              degree: 'BS Computer Science',
              startDate: '2014-09-01T00:00:00Z',
              endDate: '2018-05-15T00:00:00Z',
              gpa: '3.8',
              bullets: ["Dean's List"],
            },
          ],
          projects: [
            {
              name: 'Open Source Project',
              description: 'A tool for developers',
              technologies: ['TypeScript', 'Node.js'],
              url: 'https://github.com/example/project',
            },
          ],
        },
        coverLetter: {
          greeting: 'Dear Hiring Manager,',
          paragraphs: [
            'I am excited to apply for the Senior Software Engineer position.',
            'My experience aligns well with your requirements.',
          ],
          closing: 'Thank you for your consideration.',
        },
        jobTitle: 'Senior Software Engineer',
        companyName: 'Tech Innovations Inc',
        generatedAt: '2024-01-15T10:30:00Z',
        notes: 'Emphasized cloud-native experience',
      };

      await writeGeneratedContent(content);

      const result = await buildDocs({
        generatedJsonFile: jsonFile,
        themeName: 'clean_professional',
        outputDirectory: outputBaseDir,
      });

      expect(result.files.length).toBeGreaterThan(0);

      // Verify output files contain expected content
      const resumePath = join(result.outputDirectory, 'resume.full.html');
      const html = await readFile(resumePath, 'utf-8');
      expect(html).toContain('Tech Innovations Inc');
      expect(html).toContain('Code for America');
      expect(html).toContain("Dean's List");
      expect(html).toContain('Open Source Project');
    });
  });
});
