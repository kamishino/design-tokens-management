import type { FileNode } from "./path-tree";

/**
 * Dynamically discovers all JSON files in the /tokens directory using Vite's globbing.
 * This ensures the UI always mirrors the actual file system.
 */
export const getDynamicTokenTree = (): FileNode[] => {
  // Vite-specific glob to find all JSON files in the tokens directory
  // We use eager: true to get the modules immediately, though we only need the keys
  const modules = import.meta.glob('/tokens/**/*.json');
  const paths = Object.keys(modules);

  const root: FileNode[] = [];

  paths.forEach((path) => {
    // path example: "/tokens/global/base/colors.json"
    // Remove leading slash and split
    const parts = path.replace(/^\//, '').split('/');
    
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
          fullPath: isLast ? `/${id}` : '',
          children: isLast ? undefined : []
        };
        currentLevel.push(existingNode);
      }

      if (!isLast && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });

  // Sort: Folders first, then alphabetically
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.children) sortNodes(node.children);
    });
  };

  sortNodes(root);

  // We want to return the children of the "tokens" root folder to match expectations
  const tokensRoot = root.find(n => n.name === 'tokens');
  return tokensRoot?.children || [];
};

/**
 * Returns a flat list of all JSON token files found in the tokens/ directory.
 */
export const getDynamicTokenFiles = (): { path: string; name: string }[] => {
  const modules = import.meta.glob('/tokens/**/*.json');
  return Object.keys(modules).map(path => ({
    path,
    name: path.split('/').pop() || ''
  }));
};
