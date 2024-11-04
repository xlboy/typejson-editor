import { useComputedFileExplorerState, useFileExplorerStore } from './store';
import type { FileTreeNode } from './types';
import { LineMdChevronSmallDown, LineMdChevronSmallRight } from '@/components/icons';
import { apply } from '@twind/core';

interface FileTreeProps {
  node: FileTreeNode;
  level?: number;
}

function FileTree({ node, level = 0 }: FileTreeProps) {
  const { expandedDirNodes, toggleExpandedDirNode } = useFileExplorerStore();
  const indent = level * 16; // 每层缩进 16px

  const isDirectory = node.type === 'directory';
  const nodeItemName = isDirectory ? node.name : node.origin.name;
  const showChildren =
    isDirectory && node.children.length && expandedDirNodes.has(node.id);

  const handleNodeClick = () => {
    if (isDirectory) toggleExpandedDirNode(node.id);
    else {
      console.log('click file', node.origin.fullPath);
    }
  };

  return (
    <div className={apply.nodeGroup`flex flex-col`}>
      <div
        className={apply.nodeItem(
          'flex items-center gap-2 p-1 rounded cursor-pointer select-none text-[#929aae]',
          'hover:(text-[#e3e5ea] bg-[#1e2532])',
          `pl-[${indent + 5}px] pr-[5px]`,
        )}
        onClick={handleNodeClick}
      >
        <span className={apply.foldStatusIcon`mr-2 transition duration-75`}>
          {isDirectory ? (
            expandedDirNodes.has(node.id) ? (
              <LineMdChevronSmallDown />
            ) : (
              <LineMdChevronSmallRight />
            )
          ) : (
            <div className={apply`w-[16px]`} />
          )}
        </span>
        <span className={apply.fileIcon`mr-5`}>{isDirectory ? '📁' : '📄'}</span>
        <span>{nodeItemName}</span>
      </div>

      {showChildren && (
        <div>
          {node.children.map(child => (
            <FileTree key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileExplorer() {
  const { fileTree } = useComputedFileExplorerState();

  return (
    <div className={apply.fileExplorer`py-5 size-full`}>
      {fileTree.map(node => (
        <FileTree key={node.id} node={node} />
      ))}
    </div>
  );
}

export default FileExplorer;
