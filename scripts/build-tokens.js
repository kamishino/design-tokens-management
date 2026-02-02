import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import { resolveLineage } from '../src/utils/lineage.ts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Register tokens-studio transforms
register(StyleDictionary);

const argv = yargs(hideBin(process.argv))
  .option('project', {
    type: 'string',
    description: 'The project to build (client/project)'
  })
  .parse();

const targetProject = argv.project;

const run = async () => {
  if (!targetProject) {
    console.error('❌ Error: Missing --project argument. Example: npm run build:tokens -- --project=brand-a/app-1');
    process.exit(1);
  }

  console.log(`🏗️  Building Design Tokens for: ${targetProject}...`);

  // 1. Resolve Lineage
  let hierarchy;
  try {
    hierarchy = resolveLineage(targetProject);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  const [clientId, projectId] = targetProject.split('/');

  // 2. Initialize Style Dictionary
  const sd = new StyleDictionary({
    source: hierarchy,
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        buildPath: `src/assets/tokens/${clientId}/${projectId}/`,
        files: [{
          destination: 'variables.css',
          format: 'css/variables'
        }]
      }
    }
  });

  // 3. Build
  await sd.buildAllPlatforms();
  console.log(`✅ Tokens built successfully at: src/assets/tokens/${clientId}/${projectId}/`);
};

run();