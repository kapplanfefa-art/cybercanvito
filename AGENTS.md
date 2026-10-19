# Project rules
- Keep Fabric character formatting and range-aware toolbar synchronization in dedicated text-formatting modules so object defaults never override a selected range accidentally.
- Run the adjacent text-formatting regression tests when changing formatting scope or selection behavior.
- Keep the image/video context menu in a dedicated portal outside the clipped artboard; enable only explicitly requested actions so it remains visible near page edges without unrequested mutations.
- Keep session-scoped media snapshots in a dedicated clipboard module shared by menu and keyboard actions; create independent video players on paste because Fabric JSON cloning does not retain playable video.
- Preserve source selection properties and control visibility explicitly in clipboard snapshots because Fabric default serialization omits them; keep keyboard command detection there and bypass text editing.
- Determine media menu visibility from page contents in a dedicated policy module, not the hit target, so blank-area and object clicks share the same menu.
- Keep keyboard deletion eligibility in the media policy module; delete selected content through the editor action, never a page or content being edited.
- Keep media stacking commands in a dedicated layer module; preserve the artboard below content and notify Fabric history after each actual reorder.
- Keep the empty-paper right-click menu in its own portal component, chosen by the page-content policy, and leave every entry inert until an action is explicitly requested.