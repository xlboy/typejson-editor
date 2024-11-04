export interface OriginFile {
  /** eg: `index.ts` */
  name: string;
  /** eg: `/src/modules/file-explorer/index.ts` */
  fullPath: string;
  /** eg: `/src/modules/file-explorer/` */
  dirPath: string;
  readOnly: boolean;
}

export interface FileTreeNode {
  origin: OriginFile;
  children?: FileTreeNode[];
}
