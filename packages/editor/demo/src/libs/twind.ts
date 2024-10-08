import twindUserConfig from '../../twind.config';
import { install, injectGlobal } from '@twind/core';

install(twindUserConfig);


injectGlobal`
* {
  padding: 0;
  margin: 0;
}
    .monaco-editor .suggest-widget .monaco-list .monaco-list-row > .contents {
      display: block;
    }
    .monaco-editor
      .suggest-widget
      .monaco-list
      .monaco-list-row
      > .contents
      > .main
      > .left {
      flex: none !important;
    }
    .monaco-editor
      .suggest-widget
      .monaco-list
      .monaco-list-row
      > .contents
      > .main
      > .right {
      flex: auto !important;
      justify-content: flex-end !important;
      max-width: none !important;
    }
    .monaco-editor
      .suggest-widget
      .monaco-list
      .monaco-list-row
      > .contents
      > .main
      > .right
      > .details-label {
      margin-left: 2em !important;
      opacity: 1 !important;
    }
    .monaco-editor
      .suggest-widget:not(.docs-side)
      .monaco-list
      .monaco-list-row:hover
      > .contents
      > .main
      > .right.can-expand-details
      > .details-label {
      width: auto !important;
    }
    .monaco-editor .suggest-widget {
      border: 0 !important;
      border-radius: 8px;
      overflow: hidden;
      @apply shadow-lg ring-1 ring-neutral-10/10;
    }
    .monaco-list:not(.drop-target)
      .monaco-list-row:hover:not(.selected):not(.focused) {
      @apply bg-neutral-4/[0.05] !important;
    }
    .vs-dark
      .monaco-list:not(.drop-target)
      .monaco-list-row:hover:not(.selected):not(.focused) {
      @apply bg-neutral-4/[0.07] !important;
    }
    .monaco-editor .suggest-widget .monaco-list-rows {
      padding: 4px 0;
    }
    .monaco-editor .suggest-details {
      border-radius: 8px;
      border: 0 !important;
      @apply shadow-lg ring-1 ring-neutral-10/10;
    }
    .monaco-editor .suggest-widget .monaco-list .monaco-list-row .suggest-icon {
      margin-left: 2px !important;
      margin-right: 5px !important;
    }
    .monaco-editor .suggest-widget .monaco-list .monaco-list-row .icon.customcolor {
      margin-left: 3px !important;
      margin-right: 2px !important;
    }

    .monaco-hover {
      @apply shadow-lg ring-1 ring-brand-10/10;
    }
`