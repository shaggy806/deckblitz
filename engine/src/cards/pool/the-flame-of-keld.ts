import { defineCard } from "../define.js";

export default defineCard({
  name: "The Flame of Keld",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    "I — Discard your hand.\n" +
    "II — Draw two cards.\n" +
    "III — If a red source you control would deal damage to a permanent or player this turn, it deals that much damage plus 2 to that permanent or player instead.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "discard-hand", who: "you" },
      resolve: null,
      text: "I — Discard your hand.",
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "II — Draw two cards.",
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: { event: "would-deal-damage", instead: { modify: { plus: 2 } }, source: { colors: ["R"], controlledBy: "you" } },
      },
      resolve: null,
      text: "III — If a red source you control would deal damage to a permanent or player this turn, it deals that much damage plus 2 to that permanent or player instead.",
    },
  ],
});
