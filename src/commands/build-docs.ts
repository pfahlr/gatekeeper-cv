import { buildDocs } from '../docs/build-docs.js';

export interface BuildDocsOptions {
  profile?: string;
  variation?: string;
}

export async function runBuildDocsCommand(
  jsonFile: string,
  themeName: string,
  outputDirectory: string,
  options: BuildDocsOptions = {}
): Promise<void> {
  const result = await buildDocs({
    generatedJsonFile: jsonFile,
    themeName,
    outputDirectory,
    profileName: options.profile,
    variationName: options.variation,
  });

  // Extract just the directory name from the full path
  const dirName = result.outputDirectory.split('/').pop() || result.outputDirectory;

  console.log(`Documents written to ${outputDirectory.replace(/\/[^/]+$/, '/' + dirName)}`);
  console.log('Generated files:');
  result.files.forEach((file) => {
    console.log(`- ${file}`);
  });
}
