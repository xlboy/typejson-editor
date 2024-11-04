export interface OriginFile {
  /** eg: `index.ts` */
  name: string;
  /** eg: `/src/modules/file-explorer/index.ts` */
  fullPath: string;
  /** eg: `/src/modules/file-explorer/` */
  dirPath: string;
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
