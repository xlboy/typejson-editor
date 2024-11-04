import type { FileTreeNode, OriginFile } from './types';

export function buildFileTree(originFiles: OriginFile[]): FileTreeNode[] {
  // 按照路径字母顺序排序
  const sortedFiles = [...originFiles].sort((a, b) => {
    // 先按目录路径排序
    const dirCompare = a.dirPath.localeCompare(b.dirPath);
    if (dirCompare !== 0) return dirCompare;

    // 同一目录下，按文件名排序
    return a.name.localeCompare(b.name);
  });

  const root: FileTreeNode[] = [];

  for (const file of sortedFiles) {
    // 分割路径
    const paths = file.fullPath.split('/').filter(Boolean);
    let currentLevel = root;

    // 遍历路径的每一层
    for (let i = 0; i < paths.length; i++) {
      const isLastSegment = i === paths.length - 1;
      const segment = paths[i];

      // 查找当前层级是否已存在该节点
      let node = currentLevel.find(n =>
        isLastSegment
          ? n.type === 'file' && n.origin.name === segment
          : n.type === 'directory' && n.name === segment,
      );

      if (!node) {
        if (isLastSegment) {
          // 创建文件节点
          node = {
            type: 'file',
            origin: file,
            id: file.fullPath,
          };
        } else {
          // 创建目录节点
          node = {
            type: 'directory',
            name: segment,
            id: file.dirPath,
            dirPath: file.dirPath,
            children: [],
          };
        }
        // 按照目录优先、文件次之的顺序插入节点
        const insertIndex = currentLevel.findIndex(existing => {
          if (node!.type === 'directory' && existing.type === 'file') {
            return true; // 目录应该插入到第一个文件之前
          }
          if (node!.type === existing.type) {
            // 同类型按名称排序
            const nodeName = node!.type === 'directory' ? node!.name : node!.origin.name;
            const existingName =
              existing.type === 'directory' ? existing.name : existing.origin.name;
            return nodeName.localeCompare(existingName) < 0;
          }
          return false;
        });

        if (insertIndex === -1) {
          currentLevel.push(node);
        } else {
          currentLevel.splice(insertIndex, 0, node);
        }
      }

      if (!isLastSegment && node.type === 'directory') {
        currentLevel = node.children;
      }
    }
  }

  return root;
}
