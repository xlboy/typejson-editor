export interface OriginFile extends MonacoOriginFile {
  readOnly: boolean;
}

export interface FileNode {
  type: 'file';
  origin: OriginFile;
  /** Uses origin.fullPath as id */
  id: string;
}

export interface DirectoryNode {
  type: 'directory';
  name: string;
  /** Uses dirPath as id */
  id: string;
  /** eg: `/src/modules/file-explorer/` */
  dirPath: string;
  children: FileTreeNode[];
}

export type FileTreeNode = FileNode | DirectoryNode;

export interface ContextMenuData {
  /**
   * - null: 表示当前点击的区域不在文件树节点上（例如：空白区域，归属 root）
   * - FileTreeNode: 表示当前点击的区域在文件树节点上
   */
  node: FileTreeNode | null;
}
