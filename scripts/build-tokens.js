import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import { resolveLineage } from '../src/utils/lineage.ts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';

// Register tokens-studio transforms
register(StyleDictionary);

const argv = yargs(hideBin(process.argv))
  .option('project', {
    type: 'string',
    description: 'The project to build (client/project)'
  })
  .parse();

const targetProject = argv.project;
const MANIFEST_PATH = 'public/tokens/manifest.json';

const updateManifest = (clientId, projectId, buildPath) => {
  let manifest = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    projects: {}
  };

  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Could not parse existing manifest, creating new one.');
    }
  }

  const projectKey = `${clientId}/${projectId}`;
  manifest.projects[projectKey] = {
    name: projectKey,
    client: clientId,
    project: projectId,
    path: `/tokens/${clientId}/${projectId}/variables.css`,
    files: ['variables.css'],
    lastBuild: new Date().toISOString()
  };

  manifest.lastUpdated = new Date().toISOString();

  // Ensure dir exists
  const dir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`📑 Manifest updated at: ${MANIFEST_PATH}`);
};

const run = async () => {
  if (!targetProject) {
    console.error('❌ Error: Missing --project argument. Example: npm run build:tokens -- --project=brand-a/app-1');
    process.exit(1);
  }

  console.log(`🏗️  Building Design Tokens for: ${targetProject}...`);

  let hierarchy;
  try {
    hierarchy = resolveLineage(targetProject);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  const [clientId, projectId] = targetProject.split('/');
  const buildPath = `public/tokens/${clientId}/${projectId}/`;

  const sd = new StyleDictionary({
    source: hierarchy,
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        buildPath: buildPath,
        files: [{
          destination: 'variables.css',
          format: 'css/variables'
        }]
      }
    }
  });

  await sd.buildAllPlatforms();
  
  updateManifest(clientId, projectId, buildPath);
  
  console.log(`✅ Tokens built successfully at: ${buildPath}`);
};

run();
