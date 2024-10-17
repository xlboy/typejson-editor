import presetTailwind from '@phoenix-twind/preset-tailwind';
import { Preset, defineConfig } from '@twind/core';

const presetRemToPx = ({ baseValue = 16 } = {}) => {
  return {
    finalize(rule) {
      return {
        ...rule,
        d: rule.d?.replace(/"[^"]+"|'[^']+'|url\([^)]+\)|(-?\d*\.?\d+)rem/g, (match, p1) => {
          if (p1 === undefined) return match;
          return `${p1 * baseValue}${p1 == 0 ? '' : 'px'}`;
        }),
      };
    },
  } satisfies Preset;
};

export default defineConfig({
  presets: [presetTailwind({ disablePreflight: true }), presetRemToPx({ baseValue: 4 })],
});
