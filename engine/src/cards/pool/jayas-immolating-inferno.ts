import { defineCard } from "../define.js";

// A legendary sorcery (rule 205.4e): castable only while you control a
// legendary creature or planeswalker. Three distinct targets, up to.

export default defineCard({
  name: "Jaya's Immolating Inferno",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["sorcery"],
  text: "(You may cast a legendary sorcery only if you control a legendary creature or planeswalker.)\nJaya's Immolating Inferno deals X damage to each of up to three targets.",
  targets: [
    { kind: "optional", of: "any-target" },
    { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "damage", amount: "x", target: 1 },
      { kind: "damage", amount: "x", target: 2 },
    ],
  },
});
