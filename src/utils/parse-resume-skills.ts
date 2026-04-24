/**
 * Parse skill categories from resume markdown
 *
 * Looks for sections like:
 * ## Skills
 * **Category Name**
 * - skill1, skill2, skill3
 */

export interface SkillCategory {
  name: string;
  skills: string[];
}

export function parseResumeSkillCategories(markdown: string): SkillCategory[] {
  const categories: SkillCategory[] = [];

  // Find the Skills section
  const skillsSectionMatch = markdown.match(/##\s*Skills\s*\n([\s\S]+?)(?=\n##\s|\n*$)/i);
  if (!skillsSectionMatch) {
    return [];
  }

  const skillsContent = skillsSectionMatch[1];

  // Split by lines and look for category headers (bold text)
  const lines = skillsContent.split('\n');
  let currentCategory: SkillCategory | null = null;

  for (const line of lines) {
    // Match bold category names, with or without colon (e.g., "**Category Name**:" or just "**Category Name**")
    const categoryMatch = line.match(/^\*\*([^*]+)\*\*/);
    if (categoryMatch) {
      if (currentCategory && currentCategory.skills.length > 0) {
        categories.push(currentCategory);
      }
      currentCategory = {
        name: categoryMatch[1].trim(),
        skills: [],
      };
      // Extract skills from this line (after the bold text and optional colon)
      const afterBold = line.substring(line.lastIndexOf('**') + 2).trim();
      const afterColon = afterBold.replace(/^:\s*/, '');
      const skills = extractSkillsFromLine(afterColon);
      currentCategory.skills.push(...skills);
    } else if (currentCategory) {
      // Continue extracting skills from subsequent lines
      const skills = extractSkillsFromLine(line);
      currentCategory.skills.push(...skills);
    }
  }

  // Don't forget the last category
  if (currentCategory && currentCategory.skills.length > 0) {
    categories.push(currentCategory);
  }

  return categories;
}

function extractSkillsFromLine(line: string): string[] {
  // Remove bullet points, dashes, etc.
  let cleaned = line.replace(/^[\s\*\-▪●•]+/, '').trim();

  // Split by common delimiters
  if (!cleaned) return [];

  return cleaned
    .split(/[,;\.•]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.endsWith(':'));
}
