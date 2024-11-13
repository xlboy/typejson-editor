import config from '../../twind.config';
import {
  apply as apply$,
  css as css$,
  cssom,
  cx as cx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  twind,
  tx as tx$,
  virtual,
} from '@twind/core';

// @ts-ignore
export const tw = /* #__PURE__ */ twind(
  config,
  typeof document === 'undefined' ? virtual() : cssom('style[data-library]'),
);
export const tx = /* #__PURE__ */ tx$.bind(tw);
export const cx = /* #__PURE__ */ cx$.bind(tw);
export const injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
export const keyframes = /* #__PURE__ */ keyframes$.bind(tw);
export const css = /* #__PURE__ */ css$.bind(tw);
export const apply = /* #__PURE__ */ apply$;
