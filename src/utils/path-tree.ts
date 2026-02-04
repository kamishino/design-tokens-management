export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fullPath: string;
  children?: FileNode[];
}

/**
 * Maps flat manifest projects to a recursive tree structure
 */
export const mapManifestToTree = (manifest: any): FileNode[] => {
  const root: FileNode[] = [];

  Object.keys(manifest?.projects || {}).forEach((key) => {
    const project = manifest.projects[key];
    const parts = key.split('/'); // e.g. ["brand-a", "app-1"]
    
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const id = parts.slice(0, index + 1).join('/');
      
      let existingNode = currentLevel.find(node => node.name === part);

      if (!existingNode) {
        existingNode = {
          id,
          name: part,
          type: isLast ? 'file' : 'folder',
          fullPath: isLast ? project.path : '',
          children: isLast ? undefined : []
        };
        currentLevel.push(existingNode);
      }

      if (!isLast && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });

  return root;
};

/**
 * Generates a static tree for global primitives
 */
export const generateGlobalTree = (): FileNode[] => {
  return [
    {
      id: 'global/base',
      name: 'base',
      type: 'folder',
      fullPath: '',
      children: [
        { id: 'global/base/colors.json', name: 'colors.json', type: 'file', fullPath: '/tokens/global/base/colors.json' },
        { id: 'global/base/typography.json', name: 'typography.json', type: 'file', fullPath: '/tokens/global/base/typography.json' },
        { id: 'global/base/spacing.json', name: 'spacing.json', type: 'file', fullPath: '/tokens/global/base/spacing.json' },
      ]
    },
    {
      id: 'global/alias',
      name: 'alias',
      type: 'folder',
      fullPath: '',
      children: [
        { id: 'global/alias/colors.json', name: 'colors.json', type: 'file', fullPath: '/tokens/global/alias/colors.json' },
        { id: 'global/alias/typography.json', name: 'typography.json', type: 'file', fullPath: '/tokens/global/alias/typography.json' },
      ]
    }
  ];
};