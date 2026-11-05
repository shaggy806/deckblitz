import { defineCard } from "../define.js";

// EDHREC rank 29300.

export default defineCard({
  name: "Glyph of Doom",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose target Wall creature. At this turn's next end of combat, destroy all creatures that were blocked by that creature this turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Wall" } }],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat-this-turn",
    effect: {
      kind: "destroy-all",
      filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: 0 } },
    },
    text: "Destroy all creatures that were blocked by that creature this turn.",
  },
});
