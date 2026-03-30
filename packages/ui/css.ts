import { activeDbIndicatorCss } from "./components/active-db-indicator/active-db-indicator.css.ts";
import { badgeCss } from "./components/badge/badge.css.ts";
import { confirmDialogCss } from "./components/confirm-dialog/confirm-dialog.css.ts";
import { buttonGroupCss } from "./components/button-group/button-group.css.ts";
import { dropdownCss } from "./components/dropdown/dropdown.css.ts";
import { emptyStateCss } from "./components/empty-state/empty-state.css.ts";
import { kbdCss } from "./components/kbd/kbd.css.ts";
import { sqlHighlightCss } from "./components/sql-highlight/sql-highlight.css.ts";
import { tableTabsCss } from "./components/table-tabs/table-tabs.css.ts";
import { uploadZoneCss } from "./components/upload-zone/upload-zone.css.ts";
import { paginationCss } from "./components/pagination/pagination.css.ts";
import { tableCss } from "./components/table/table.css.ts";
import { toastCss } from "./components/toast/toast.css.ts";

export {
  activeDbIndicatorCss,
  emptyStateCss,
  paginationCss,
  sqlHighlightCss,
  toastCss,
};

export const css = [
  activeDbIndicatorCss,
  emptyStateCss,
  paginationCss,
  sqlHighlightCss,
  toastCss,
].join("\n");
