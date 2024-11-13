/**
 * From: https://github.com/KawaiiZapic/GithubIconify/blob/master/plugins/GenerateJSON.ts
 */
import fs from 'fs';
import { generateManifest } from 'material-icon-theme';
import path from 'path';
import { bundledLanguagesInfo } from 'shiki';
import type { Plugin } from 'vite';

export default (): Plugin => {
  let copyPublic = true;
  let iconsPath: string = path.resolve('./node_modules/material-icon-theme/icons');
  return {
    name: 'generate-json',
    configResolved(config) {
      copyPublic = !!config.publicDir;
    },
    closeBundle: {
      handler() {
        try {
          copyPublic &&
            fs.cpSync(iconsPath, './public/material-icons', { recursive: true });
        } catch (error) {
          console.error(error);
          throw Error('An error while generating the manifest occurred!');
        }
      },
      order: 'post',
    },
    resolveId(id) {
      if (id === 'virtual:icons') {
        return '\0virtual:icons';
      }
    },
    async load(id) {
      if (id === '\0virtual:icons') {
        const manifest = generateManifest();
        delete manifest.iconDefinitions;
        delete manifest.light;
        delete manifest.hidesExplorerArrows;
        delete manifest.highContrast;
        delete manifest.folderExpanded;
        delete manifest.folderNamesExpanded;
        const exts = Object.fromEntries(
          bundledLanguagesInfo.flatMap(i => i.aliases?.map(a => [a, i.id]) || []),
        );
        for (const id in exts) {
          if (fs.existsSync(path.join(iconsPath, exts[id] + '.svg'))) {
            manifest.languageIds![id] = exts[id];
          }
        }
        return 'export default ' + JSON.stringify(manifest, null, 2);
      }
    },
  };
};
