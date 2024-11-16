import { useCallback, useEffect, useState } from 'react';
import { useScript } from 'usehooks-ts';

export function usePrettierFormatter() {
  const prettierLoadStatus = useScript(
    // 'https://cdn.jsdelivr.net/npm/prettier@3.3.3/standalone.min.js',
    'https://unpkg.com/prettier@3.3.3/standalone.js',
  );

  const json5PluginLoadStatus = useScript(
    'https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/babel.js',
  );

  // const [prettier, setPrettier] = useState(null);
  // const [json5Plugin, setJson5Plugin] = useState(null);

  // // 返回格式化函数
  // const format = useCallback(
  //   text => {
  //     if (prettier && json5Plugin) {
  //       try {
  //         return prettier.format(text, {
  //           parser: 'json5',
  //           plugins: [json5Plugin],
  //         });
  //       } catch (error) {
  //         console.error('Formatting error:', error);
  //         return text; // 返回原文本以防格式化失败
  //       }
  //     } else {
  //       console.warn('Prettier or plugin not loaded yet');
  //       return text; // 返回原文本以防 Prettier 尚未加载
  //     }
  //   },
  //   [prettier, json5Plugin],
  // );

  // return format;
}
