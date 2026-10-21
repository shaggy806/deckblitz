import { defineCard } from "../define.js";

// EDHREC rank 19331.
//
// Rulings:
//   X is the life you gained this turn, not the change in your life total.
//   With its target illegal, the spell doesn't resolve and you gain no life.

const TEXT =
  "You gain 1 life. Target creature gets -X/-X until end of turn, where X is the amount of life you gained this turn.";
const GAINED = { turnStat: "life-gained", who: "you" } as const;

export default defineCard({
  name: "Nightmare's Thirst",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 1 },
      {
        kind: "modify-pt",
        target: 0,
        power: { product: [GAINED, -1] },
        toughness: { product: [GAINED, -1] },
        duration: "end-of-turn",
      },
    ],
  },
});
