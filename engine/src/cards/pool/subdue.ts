import { defineCard } from "../define.js";

// EDHREC rank 31488.

export default defineCard({
  name: "Subdue",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt by target creature this turn. That creature gets +0/+X until end of turn, where X is its mana value.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      { kind: "modify-pt", target: 0, power: 0, toughness: { manaValueOf: 0 }, duration: "end-of-turn" },
    ],
  },
});
