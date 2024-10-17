import { Diagnostic, type TypeJsonEditorValidationAPI } from '../types';
import { type ModelManagerAPI } from './use-model-manager';
import type * as Monaco from 'monaco-editor';
import { useImperativeHandle } from 'react';

export function useExposeValidationAPI(
  validationRef: React.RefObject<TypeJsonEditorValidationAPI>,
  deps: {
    monaco: typeof Monaco;
    modelManager: ModelManagerAPI;
  },
) {
  const { modelManager, monaco } = deps;

  useImperativeHandle(validationRef, () => ({
    getErrors,
    hasErrors: async () => (await getErrors()).typeErrors.length > 0 || (await getErrors()).syntacticErrors.length > 0,
  }));

  async function getErrors() {
    const models = modelManager.getAll();
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await worker();

    const typeErrors: Diagnostic[] = [];
    const syntacticErrors: Diagnostic[] = [];

    for await (const model of Object.values(models)) {
      const filePath = model.uri.toString();

      if (filePath.includes('node_modules')) continue;

      const _typeErrors: Diagnostic[] = (await client.getSemanticDiagnostics(filePath)).map(v => {
        const { lineNumber, column } = model.getPositionAt(v.start!);
        return { lineNumber, column, ...v };
      });
      const _syntacticErrors: Diagnostic[] = (await client.getSyntacticDiagnostics(filePath)).map(v => {
        const { lineNumber, column } = model.getPositionAt(v.start!);
        return { lineNumber, column, ...v };
      });

      typeErrors.push(..._typeErrors);
      syntacticErrors.push(..._syntacticErrors);
    }

    return { typeErrors, syntacticErrors };
  }
}
