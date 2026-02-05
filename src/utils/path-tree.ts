import type { Manifest } from "../schemas/manifest";

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
export const mapManifestToTree = (manifest: Manifest): FileNode[] => {
  const root: FileNode[] = [];

  Object.keys(manifest?.projects || {}).forEach((key) => {
    const project = manifest.projects[key];
    const parts = key.split('/');
    
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
