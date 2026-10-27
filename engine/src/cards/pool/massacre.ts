import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 11663.
//
// Mogg Salvage's `freeCastIf`: offered beside the normal cast while both
// halves hold. Plains and Swamp are land types, so any land with them counts.

export default defineCard({
  name: "Massacre",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "If an opponent controls a Plains and you control a Swamp, you may cast this spell without paying its mana cost.\nAll creatures get -2/-2 until end of turn.",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Plains" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      ],
    },
  },
  targets: [],
  effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
});
