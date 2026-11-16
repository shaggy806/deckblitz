import { defineCard } from "../define.js";

// EDHREC rank 12132. A text-changing effect over a creature type (rule
// 612.2): both creature types are chosen as it resolves, the new one never
// Wall, and every instance in the spell's or permanent's type line and text
// changes — filters, "non-" words, the tokens it makes and their names
// (612.2a). Removed 2026-09-28 when only the type line changed; back whole.

export default defineCard({
  name: "Artificial Evolution",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Change the text of target spell or permanent by replacing all instances of one creature type with another. The new creature type can't be Wall. (This effect lasts indefinitely.)",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "change-text", target: 0, words: "creature-type", notTo: ["Wall"], duration: "permanent" },
});
