import { defineCard } from "../define.js";

// Legends.
//
// A delayed "whenever" watch of the target (`watching: 0`) for this turn: a
// `dealt-damage` narrowed by its source (`bySource` — an attacking creature as
// it deals the damage), settled once per damage event for what those sources
// dealt it together (rule 603.2c).

const WATCH = "Whenever that creature is dealt damage by an attacking creature this turn, you gain that much life.";

export default defineCard({
  name: "Glyph of Life",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose target Wall creature. ${WATCH}`,
  targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Wall" } }],
  effect: {
    kind: "delayed-trigger",
    at: {
      whenever: { on: "dealt-damage", who: "self", bySource: { type: "creature", attacking: true } },
      watching: 0,
    },
    effect: { kind: "gain-life", amount: { triggerValue: true } },
    text: WATCH,
  },
});
