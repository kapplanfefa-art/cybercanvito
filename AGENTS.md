# Project rules
- Keep Fabric character formatting and range-aware toolbar synchronization in dedicated text-formatting modules so object defaults never override a selected range accidentally.
- Run the adjacent text-formatting regression tests when changing formatting scope or selection behavior.
- Keep the image/video context menu in a dedicated portal outside the clipped artboard; enable only explicitly requested actions so it remains visible near page edges without unrequested mutations.
- Keep session-scoped media snapshots in a dedicated clipboard module shared by menu and keyboard actions; create independent video players on paste because Fabric JSON cloning does not retain playable video.