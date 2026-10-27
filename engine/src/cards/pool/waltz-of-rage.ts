import { defineCard } from "../define.js";

// The target creature is the source of the damage, its power read as this
// resolves (the rulings); an illegal target stops the whole spell, delayed
// trigger included.

const TEXT =
  "Target creature you control deals damage equal to its power to each other creature. Until end of turn, whenever a creature you control dies, exile the top card of your library. You may play it until the end of your next turn.";

export default defineCard({
  name: "Waltz of Rage",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage-all",
        filter: { type: "creature" },
        amount: { powerOf: 0 },
        exceptSource: true,
        from: { target: 0 },
      },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "dies", who: "you-control", filter: { type: "creature" } } },
        effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
        text: "Whenever a creature you control dies this turn, exile the top card of your library. You may play it until the end of your next turn.",
      },
    ],
  },
});
