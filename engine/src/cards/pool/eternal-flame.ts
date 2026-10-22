import { defineCard } from "../define.js";

const MOUNTAINS = { countOf: { subtype: "Mountain", controlledBy: "you" } } as const;

export default defineCard({
  name: "Eternal Flame",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Eternal Flame deals X damage to target opponent or planeswalker and half X damage, rounded up, to you, where X is the number of Mountains you control.",
  targets: ["opponent-or-planeswalker"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: MOUNTAINS, target: 0 },
      { kind: "damage", amount: { half: MOUNTAINS, round: "up" }, who: "you" },
    ],
  },
});
