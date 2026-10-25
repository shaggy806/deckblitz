import { defineCard } from "../define.js";

// EDHREC rank 7991. Eldritch Moon.
//
// The cast trigger resolves before the creature spell does, so the creature
// sacrificed to emerge is gone before any of it (the rulings).

export default defineCard({
  name: "Elder Deep-Fiend",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Octopus"],
  power: 5,
  toughness: 6,
  keywords: ["flash"],
  alternativeCost: { mana: "{5}{U}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Flash\nEmerge {5}{U}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, tap up to four target permanents.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        { kind: "optional", of: "permanent" },
        { kind: "optional", of: { kind: "other", of: "permanent", than: { slot: 0 } } },
        { kind: "optional", of: { kind: "other", of: "permanent", than: { slots: [0, 1] } } },
        { kind: "optional", of: { kind: "other", of: "permanent", than: { slots: [0, 1, 2] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "tap", target: 2 },
          { kind: "tap", target: 3 },
        ],
      },
      resolve: null,
      text: "When you cast this spell, tap up to four target permanents.",
    },
  ],
});
