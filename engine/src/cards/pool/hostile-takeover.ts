import { defineCard } from "../define.js";

// Base P/T is set in layer 7b, so counters and pumps still apply on top; the
// 3 damage comes after both changes, to every creature.
export default defineCard({
  name: "Hostile Takeover",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text:
    "Up to one target creature has base power and toughness 1/1 until end of turn. Up to one other target creature has base power and toughness 4/4 until end of turn. Then Hostile Takeover deals 3 damage to each creature.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 1,
        toughness: 1,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      {
        kind: "animate",
        target: 1,
        power: 4,
        toughness: 4,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      { kind: "damage-all", amount: 3, filter: { type: "creature" } },
    ],
  },
});
