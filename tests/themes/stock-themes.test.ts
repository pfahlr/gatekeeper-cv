import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readFile, access, constants } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildDocs } from '../../src/docs/build-docs.js';
import { resolveTheme } from '../../src/docs/resolve-theme.js';
import { themeConfigSchema } from '../../src/schemas/theme.schema.js';
import type { GeneratedContent } from '../../src/schemas/generated-content.schema.js';
import { existsSync } from 'node:fs';

/**
 * Comprehensive theme validation tests.
 *
 * These tests validate all stock themes and provide infrastructure for testing user themes.
 * Run with: npm test -- tests/themes/stock-themes.test.ts
 *
 * To test a custom user theme, create it in themes/user/your-theme-name/ and add its name
 * to the USER_THEMES array below, or use the environment variable TEST_USER_THEMES.
 */

// Stock themes to test
const STOCK_THEMES = ['clean_professional', 'basic'];

// User themes to test (can be overridden via TEST_USER_THEMES env var)
const USER_THEMES = process.env.TEST_USER_THEMES?.split(',') || [];

// All themes to test
const ALL_THEMES = [...STOCK_THEMES, ...USER_THEMES];

/**
 * Creates minimal valid generated content for testing
 */
function createTestContent(): GeneratedContent {
  return {
    resume: {
      summary: 'Experienced software engineer specializing in full-stack development.',
      skills: [
        { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Go'] },
        { category: 'Frontend', items: ['React', 'Vue.js', 'HTML', 'CSS'] },
        { category: 'Backend', items: ['Node.js', 'Express', 'FastAPI'] },
        { category: 'DevOps', items: ['Docker', 'Kubernetes', 'Git', 'CI/CD'] },
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
            'Improved application performance by 40% through optimization',
            'Mentored junior developers and conducted code reviews',
          ],
        },
        {
          company: 'Startup Co',
          title: 'Software Engineer',
          startDate: '2018-06-01T00:00:00Z',
          endDate: '2020-01-10T00:00:00Z',
          bullets: [
            'Built RESTful APIs using Node.js and Express',
            'Implemented automated testing pipeline',
          ],
        },
      ],
      volunteering: [
        {
          organization: 'Code for America',
          title: 'Volunteer Tech Lead',
          startDate: '2021-06-01T00:00:00Z',
          endDate: '2022-12-31T00:00:00Z',
          location: 'Remote',
          bullets: [
            'Led team of 5 volunteers developing web application',
            'Organized monthly hackathons for civic tech engagement',
          ],
        },
      ],
      education: [
        {
          institution: 'University',
          degree: 'Bachelor of Science in Computer Science',
          field: 'Computer Science',
          startDate: '2014-09-01T00:00:00Z',
          endDate: '2018-05-15T00:00:00Z',
          gpa: '3.8',
          bullets: ["Dean's List: Fall 2014 - Spring 2018", "CS Club President (2016-2017)"],
        },
      ],
      projects: [
        {
          name: 'Open Source Project',
          description: 'A developer tool for automation',
          technologies: ['TypeScript', 'Node.js', 'Docker'],
          url: 'https://github.com/example/project',
          startDate: '2021-01-01T00:00:00Z',
        },
      ],
    },
    coverLetter: {
      greeting: 'Dear Hiring Manager,',
      paragraphs: [
        'I am writing to express my strong interest in the Senior Software Engineer position.',
        'In my current role, I have successfully led the development of microservices architecture that serves over 1 million users.',
        'I am particularly drawn to this opportunity because of your company\'s focus on innovation and engineering excellence.',
      ],
      closing: 'Thank you for your consideration. I look forward to hearing from you.',
    },
    jobTitle: 'Senior Software Engineer',
    companyName: 'Tech Innovations Inc',
    generatedAt: '2024-01-15T10:30:00Z',
    notes: 'Emphasized cloud-native experience and team leadership',
  };
}

/**
 * Validates theme configuration structure
 */
async function validateThemeConfig(themeName: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const theme = await resolveTheme(themeName);
    const config = theme.config;

    // Validate using schema
    const result = themeConfigSchema.safeParse(config);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        errors.push(`Schema error at ${err.path.join('.')}: ${err.message}`);
      });
      return { valid: false, errors };
    }

    // Check that theme name matches config
    if (config.name !== themeName) {
      errors.push(`Theme name mismatch: config has "${config.name}" but directory is "${themeName}"`);
    }

    // Check for at least one resume or cover letter output
    if (config.resumes.length === 0 && config.coverLetters.length === 0) {
      errors.push('Theme must have at least one resume or cover letter output');
    }

    // Check that all template files exist
    const themePath = theme.themePath;

    for (const resume of config.resumes) {
      const templatePath = join(themePath, 'templates', resume.template);
      if (!existsSync(templatePath)) {
        errors.push(`Resume template not found: ${resume.template}`);
      }
    }

    for (const coverLetter of config.coverLetters) {
      const templatePath = join(themePath, 'templates', coverLetter.template);
      if (!existsSync(templatePath)) {
        errors.push(`Cover letter template not found: ${coverLetter.template}`);
      }
    }

    // Check that all style files exist
    const allStyles = new Set<string>();
    config.resumes.forEach((r) => r.styles?.forEach((s) => allStyles.add(s)));
    config.coverLetters.forEach((c) => c.styles?.forEach((s) => allStyles.add(s)));

    for (const style of allStyles) {
      const stylePath = join(themePath, style);
      if (!existsSync(stylePath)) {
        errors.push(`Style file not found: ${style}`);
      }
    }

    // Validate variations if present
    if (config.variations) {
      // Check for default variation
      if (!config.variations.default) {
        errors.push('Theme variations must include a "default" variation');
      }

      // Check that all variation style files exist
      for (const [variationName, variation] of Object.entries(config.variations)) {
        for (const style of variation.styles || []) {
          const stylePath = join(themePath, style);
          if (!existsSync(stylePath)) {
            errors.push(`Variation "${variationName}" style file not found: ${style}`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Failed to resolve theme: ${error instanceof Error ? error.message : String(error)}`);
    return { valid: false, errors };
  }
}

/**
 * Validates rendered output for required content
 */
async function validateRenderedOutput(
  themeName: string,
  outputPath: string,
  content: GeneratedContent
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const html = await readFile(outputPath, 'utf-8');

    // Check for valid HTML structure
    if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
      errors.push('Output does not contain valid HTML structure (missing <!DOCTYPE html> or <html>)');
    }

    if (!html.includes('</html>')) {
      errors.push('Output is missing closing </html> tag');
    }

    // Check for <head> section
    if (!html.includes('<head')) {
      warnings.push('Output is missing <head> section');
    }

    // Check for <body> section
    if (!html.includes('<body')) {
      warnings.push('Output is missing <body> section');
    }

    // Check for CSS stylesheet link
    if (!html.includes('stylesheet') && !html.includes('<style')) {
      warnings.push('Output does not include any CSS (no <link rel="stylesheet"> or <style> tag)');
    }

    // Validate resume content
    if (outputPath.includes('resume')) {
      // Check for skills rendering (both flat and grouped)
      const hasSkillsSection = html.includes('Skills') || html.toLowerCase().includes('skills');
      if (!hasSkillsSection) {
        errors.push('Resume output does not contain a Skills section');
      }

      // Check that at least some skills are rendered
      const hasAnySkill = content.resume.skills.some((skillOrGroup) => {
        if (typeof skillOrGroup === 'string') {
          return html.includes(skillOrGroup);
        } else {
          return skillOrGroup.items.some((item) => html.includes(item));
        }
      });

      if (!hasAnySkill) {
        errors.push('Resume output does not contain any skill content from the input');
      }

      // Check for experience section
      if (content.resume.experience.length > 0) {
        const hasExperienceSection =
          html.includes('Experience') ||
          html.includes('Employment') ||
          html.toLowerCase().includes('experience');
        if (!hasExperienceSection) {
          warnings.push('Resume output may be missing an Experience section');
        }

        // Check that at least one company name is rendered
        const hasAnyCompany = content.resume.experience.some((exp) =>
          html.includes(exp.company)
        );
        if (!hasAnyCompany) {
          warnings.push('Resume output may not be rendering experience companies correctly');
        }
      }

      // Check for volunteering section if present
      if (content.resume.volunteering && content.resume.volunteering.length > 0) {
        const hasAnyVolunteer = content.resume.volunteering.some((vol) =>
          html.includes(vol.organization)
        );
        if (!hasAnyVolunteer) {
          warnings.push('Resume output may not be rendering volunteering section correctly');
        }
      }

      // Check for education section if present
      if (content.resume.education && content.resume.education.length > 0) {
        const hasAnyEducation = content.resume.education.some((edu) =>
          html.includes(edu.institution)
        );
        if (!hasAnyEducation) {
          warnings.push('Resume output may not be rendering education section correctly');
        }
      }

      // Check for projects section if present
      if (content.resume.projects && content.resume.projects.length > 0) {
        const hasAnyProject = content.resume.projects.some((proj) =>
          html.includes(proj.name)
        );
        if (!hasAnyProject) {
          warnings.push('Resume output may not be rendering projects section correctly');
        }
      }
    }

    // Validate cover letter content
    if (outputPath.includes('cover')) {
      if (content.coverLetter.paragraphs.length > 0) {
        const hasFirstParagraph = html.includes(content.coverLetter.paragraphs[0]);
        if (!hasFirstParagraph) {
          warnings.push('Cover letter output may not be rendering paragraphs correctly');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to read output file: ${error instanceof Error ? error.message : String(error)}`);
    return { valid: false, errors, warnings };
  }
}

describe('Theme Validation Suite', () => {
  describe('Stock Themes', () => {
    describe.each(STOCK_THEMES)('%s', (themeName) => {
      describe('Theme Configuration', () => {
        it('should have valid theme configuration', async () => {
          const result = await validateThemeConfig(themeName);
          if (!result.valid) {
            console.error(`\n❌ Theme "${themeName}" configuration errors:`);
            result.errors.forEach((err) => console.error(`   - ${err}`));
          }
          expect(result.valid).toBe(true);
        });

        it('should have theme.json file', async () => {
          const theme = await resolveTheme(themeName);
          const themeJsonPath = join(theme.themePath, 'theme.json');
          await expect(access(themeJsonPath, constants.F_OK)).resolves.toBeUndefined();
        });

        it('should have templates directory', async () => {
          const theme = await resolveTheme(themeName);
          const templatesDir = join(theme.themePath, 'templates');
          await expect(access(templatesDir, constants.F_OK)).resolves.toBeUndefined();
        });
      });

      describe('Template Rendering', () => {
        let tempDir: string;
        let jsonFile: string;
        let buildResult: Awaited<ReturnType<typeof buildDocs>>;

        beforeEach(async () => {
          tempDir = join(tmpdir(), `theme-test-${themeName}-${Date.now()}`);
          await mkdir(tempDir, { recursive: true });
          jsonFile = join(tempDir, 'generated.json');
          await writeFile(jsonFile, JSON.stringify(createTestContent(), null, 2));
        });

        afterEach(async () => {
          try {
            await rm(tempDir, { recursive: true, force: true });
          } catch {
            // Ignore cleanup errors
          }
        });

        it('should render all resume outputs without errors', async () => {
          buildResult = await buildDocs({
            generatedJsonFile: jsonFile,
            themeName,
            outputDirectory: join(tempDir, 'output'),
          });

          expect(buildResult.files.length).toBeGreaterThan(0);

          // Validate each resume output
          const resumeOutputs = buildResult.files.filter((f) => f.includes('resume'));
          for (const outputFile of resumeOutputs) {
            const outputPath = join(buildResult.outputDirectory, outputFile);
            const validation = await validateRenderedOutput(
              themeName,
              outputPath,
              createTestContent()
            );

            if (!validation.valid || validation.warnings.length > 0) {
              console.error(`\n📄 Theme "${themeName}" - ${outputFile}:`);
              if (validation.errors.length > 0) {
                console.error(`   ❌ Errors:`);
                validation.errors.forEach((err) => console.error(`      - ${err}`));
              }
              if (validation.warnings.length > 0) {
                console.error(`   ⚠️  Warnings:`);
                validation.warnings.forEach((warn) => console.error(`      - ${warn}`));
              }
            }

            expect(validation.valid).toBe(true);
          }
        });

        it('should render all cover letter outputs without errors', async () => {
          buildResult = await buildDocs({
            generatedJsonFile: jsonFile,
            themeName,
            outputDirectory: join(tempDir, 'output'),
          });

          // Validate each cover letter output
          const coverLetterOutputs = buildResult.files.filter((f) => f.includes('cover'));
          for (const outputFile of coverLetterOutputs) {
            const outputPath = join(buildResult.outputDirectory, outputFile);
            const validation = await validateRenderedOutput(
              themeName,
              outputPath,
              createTestContent()
            );

            if (!validation.valid || validation.warnings.length > 0) {
              console.error(`\n📄 Theme "${themeName}" - ${outputFile}:`);
              if (validation.errors.length > 0) {
                console.error(`   ❌ Errors:`);
                validation.errors.forEach((err) => console.error(`      - ${err}`));
              }
              if (validation.warnings.length > 0) {
                console.error(`   ⚠️  Warnings:`);
                validation.warnings.forEach((warn) => console.error(`      - ${warn}`));
              }
            }

            expect(validation.valid).toBe(true);
          }
        });

        it('should copy style files to output directory', async () => {
          buildResult = await buildDocs({
            generatedJsonFile: jsonFile,
            themeName,
            outputDirectory: join(tempDir, 'output'),
          });

          const theme = await resolveTheme(themeName);
          const allStyles = new Set<string>();
          theme.config.resumes.forEach((r) => r.styles?.forEach((s) => allStyles.add(s)));
          theme.config.coverLetters.forEach((c) => c.styles?.forEach((s) => allStyles.add(s)));

          for (const style of allStyles) {
            const stylePath = join(buildResult.outputDirectory, style);
            const exists = await access(stylePath, constants.F_OK)
              .then(() => true)
              .catch(() => false);

            if (!exists) {
              console.error(`\n📄 Theme "${themeName}" - Style file not copied: ${style}`);
            }

            expect(exists).toBe(true);
          }
        });

        describe('Theme Variations', () => {
          beforeEach(async () => {
            tempDir = join(tmpdir(), `theme-variation-test-${themeName}-${Date.now()}`);
            await mkdir(tempDir, { recursive: true });
            jsonFile = join(tempDir, 'generated.json');
            await writeFile(jsonFile, JSON.stringify(createTestContent(), null, 2));
          });

          it('should render with default variation when no variation is specified', async () => {
            const theme = await resolveTheme(themeName);

            // Only test variations if the theme has them
            if (!theme.config.variations) {
              return;
            }

            buildResult = await buildDocs({
              generatedJsonFile: jsonFile,
              themeName,
              outputDirectory: join(tempDir, 'output'),
            });

            expect(buildResult.files.length).toBeGreaterThan(0);

            // Verify default variation styles are applied
            const defaultStyles = theme.config.variations.default.styles;
            if (defaultStyles && defaultStyles.length > 0) {
              const resumePath = join(buildResult.outputDirectory, buildResult.files[0]);
              const html = await readFile(resumePath, 'utf-8');
              expect(html).toContain(defaultStyles[0]);
            }
          });

          it('should render with specified variation', async () => {
            const theme = await resolveTheme(themeName);

            // Only test variations if the theme has them
            if (!theme.config.variations || Object.keys(theme.config.variations).length <= 1) {
              return;
            }

            // Get a non-default variation
            const variationName = Object.keys(theme.config.variations).find((v) => v !== 'default');
            if (!variationName) {
              return;
            }

            buildResult = await buildDocs({
              generatedJsonFile: jsonFile,
              themeName,
              outputDirectory: join(tempDir, 'output'),
              variationName,
            });

            expect(buildResult.files.length).toBeGreaterThan(0);

            // Verify variation styles are applied
            const variation = theme.config.variations[variationName];
            if (variation.styles && variation.styles.length > 0) {
              const resumePath = join(buildResult.outputDirectory, buildResult.files[0]);
              const html = await readFile(resumePath, 'utf-8');
              expect(html).toContain(variation.styles[0]);
            }
          });
        });
      });
    });
  });

  describe('User Themes', () => {
    if (USER_THEMES.length === 0) {
      it.skip('No user themes to test (set TEST_USER_THEMES environment variable)', () => {});
      return;
    }

    describe.each(USER_THEMES)('%s', (themeName) => {
      describe('Theme Configuration', () => {
        it('should have valid theme configuration', async () => {
          const result = await validateThemeConfig(themeName);
          if (!result.valid) {
            console.error(`\n❌ User theme "${themeName}" configuration errors:`);
            result.errors.forEach((err) => console.error(`   - ${err}`));
            console.error(`\n💡 Tips for fixing user theme "${themeName}":`);
            console.error(`   1. Ensure theme.json exists in themes/user/${themeName}/`);
            console.error(`   2. Verify theme.json follows the theme schema`);
            console.error(`   3. Check that all template files exist in templates/ directory`);
            console.error(`   4. Verify all style files referenced in config exist`);
          }
          expect(result.valid).toBe(true);
        });

        it('should have theme.json file', async () => {
          const theme = await resolveTheme(themeName);
          const themeJsonPath = join(theme.themePath, 'theme.json');
          await expect(access(themeJsonPath, constants.F_OK)).resolves.toBeUndefined();
        });

        it('should have templates directory', async () => {
          const theme = await resolveTheme(themeName);
          const templatesDir = join(theme.themePath, 'templates');
          await expect(access(templatesDir, constants.F_OK)).resolves.toBeUndefined();
        });
      });

      describe('Template Rendering', () => {
        let tempDir: string;
        let jsonFile: string;
        let buildResult: Awaited<ReturnType<typeof buildDocs>>;

        beforeEach(async () => {
          tempDir = join(tmpdir(), `user-theme-test-${themeName}-${Date.now()}`);
          await mkdir(tempDir, { recursive: true });
          jsonFile = join(tempDir, 'generated.json');
          await writeFile(jsonFile, JSON.stringify(createTestContent(), null, 2));
        });

        afterEach(async () => {
          try {
            await rm(tempDir, { recursive: true, force: true });
          } catch {
            // Ignore cleanup errors
          }
        });

        it('should render all outputs without errors', async () => {
          buildResult = await buildDocs({
            generatedJsonFile: jsonFile,
            themeName,
            outputDirectory: join(tempDir, 'output'),
          });

          expect(buildResult.files.length).toBeGreaterThan(0);

          // Validate each output
          for (const outputFile of buildResult.files) {
            const outputPath = join(buildResult.outputDirectory, outputFile);
            const validation = await validateRenderedOutput(
              themeName,
              outputPath,
              createTestContent()
            );

            if (!validation.valid || validation.warnings.length > 0) {
              console.error(`\n📄 User theme "${themeName}" - ${outputFile}:`);
              if (validation.errors.length > 0) {
                console.error(`   ❌ Errors:`);
                validation.errors.forEach((err) => console.error(`      - ${err}`));
              }
              if (validation.warnings.length > 0) {
                console.error(`   ⚠️  Warnings:`);
                validation.warnings.forEach((warn) => console.error(`      - ${warn}`));
              }
              console.error(`\n💡 Debug tips for ${outputFile}:`);
              console.error(`   1. Check template syntax in themes/user/${themeName}/templates/`);
              console.error(`   2. Verify Liquid.js filters and tags are valid`);
              console.error(`   3. Ensure all required context variables are used`);
              console.error(`   4. Review the generated HTML at: ${outputPath}`);
            }

            expect(validation.valid).toBe(true);
          }
        });
      });
    });
  });
});
