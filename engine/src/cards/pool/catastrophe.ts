import { defineCard } from "../define.js";

// EDHREC rank 12580.
//
// Rulings:
//   [2004-10-04] You choose land or creatures when the spell resolves.
//
// So a resolution-time `modal` (not `castModal`, which is chosen on casting).

export default defineCard({
  name: "Catastrophe",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all lands or all creatures. Creatures destroyed this way can't be regenerated.",
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Destroy all lands.", effect: { kind: "destroy-all", filter: { type: "land" } } },
      {
        text: "Destroy all creatures. They can't be regenerated.",
        effect: { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
      },
    ],
  },
});
