export interface BuildDocsOptions {
  profile?: string;
}

export async function runBuildDocsCommand(
  jsonFile: string,
  themeName: string,
  outputDirectory: string,
  options: BuildDocsOptions = {}
): Promise<void> {
  console.log(`Building docs from ${jsonFile} using theme ${themeName} into ${outputDirectory}`);
  if (options.profile) {
    console.log(`Using profile: ${options.profile}`);
  }
}
