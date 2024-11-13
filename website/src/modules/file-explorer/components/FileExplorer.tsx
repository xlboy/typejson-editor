import { getFileIcon, getFolderIcon } from '../helpers';
import { useComputedFileExplorerState, useFileExplorerStore } from '../store';
import type { FileTreeNode } from '../types';
import ContextMenu from './ContextMenu';
import { LineMdChevronSmallDown, LineMdChevronSmallRight } from '@/components/icons';
import { apply } from '@twind/core';

interface FileTreeProps {
  node: FileTreeNode;
  level?: number;
}

function FileTree({ node, level = 0 }: FileTreeProps) {
  const { expandedDirNodes, toggleExpandedDirNode, showContextMenu } =
    useFileExplorerStore();
  const indent = level * 16; // 每层缩进 16px

  const isDirectory = node.type === 'directory';
  const showChildren =
    isDirectory && node.children.length && expandedDirNodes.has(node.id);
  const nodeIconUrl = isDirectory
    ? getFolderIcon(node.name, expandedDirNodes.has(node.id))
    : getFileIcon(node.origin.name);

  const handleNodeClick = () => {
    if (isDirectory) toggleExpandedDirNode(node.id);
    else {
      console.log('click file', node.origin.fullPath);
    }
  };

  const handleNodeContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    showContextMenu(event, { node });
    event.stopPropagation();
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
        onContextMenu={handleNodeContextMenu}
      >
        <span className={apply.foldStatusIcon`mr-2 duration-0`}>
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
        <span className={apply.fileIcon`mr-5`}>
          <img src={nodeIconUrl} className={apply`w-[16px]`} />
        </span>
        <span>{isDirectory ? node.name : node.origin.name}</span>
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
  const { showContextMenu } = useFileExplorerStore();

  return (
    <div
      className={apply.fileExplorer`py-5 size-full`}
      onContextMenu={event => showContextMenu(event, { node: null })}
    >
      {fileTree.map(node => (
        <FileTree key={node.id} node={node} />
      ))}
      <ContextMenu />
    </div>
  );
}

export default FileExplorer;
