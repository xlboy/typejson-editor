export interface TypeJsonFile {
  path: string;
  content: string;
}

export interface TypeJsonRunnerOptions {
  /**
   * @default `type-json-editor-nodebox-iframe`
   */
  nodeboxIframeId?: string;
  files?: Array<TypeJsonFile>;
}
