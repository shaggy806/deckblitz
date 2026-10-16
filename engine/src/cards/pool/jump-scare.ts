import { defineCard } from "../define.js";

// EDHREC rank 14929.
//
// Every part lasts until end of turn: the pump, the flying, and the Horror
// enchantment creature types added to its own.
export default defineCard({
  name: "Jump Scare",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Until end of turn, target creature gets +2/+2, gains flying, and becomes a Horror enchantment creature in addition to its other types.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      {
        kind: "add-types",
        target: 0,
        addTypes: ["enchantment", "creature"],
        addSubtypes: ["Horror"],
        duration: "end-of-turn",
      },
    ],
  },
});
