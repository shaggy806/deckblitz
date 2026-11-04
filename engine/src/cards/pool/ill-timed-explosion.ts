import { defineCard } from "../define.js";

// - The discard is the spell's, so only its resolution can say what X is: read
//   as the reflexive ability triggers (`value`), and known as players respond.
const TEXT =
  "Draw two cards. Then you may discard two cards. When you do, Ill-Timed Explosion deals X damage to each creature, " +
  "where X is the greatest mana value among cards discarded this way.";

export default defineCard({
  name: "Ill-Timed Explosion",
  manaCost: "{2}{U}{R}",
  colors: ["R", "U"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "each-player-may",
        who: "you",
        options: [{ discard: 2, text: "Discard two cards" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [],
          value: { thisWay: "discarded", greatestOf: "mana-value" },
          effect: { kind: "damage-all", filter: { type: "creature" }, amount: { triggerValue: true } },
          text: "When you do, Ill-Timed Explosion deals X damage to each creature, where X is the greatest mana value among cards discarded this way.",
        },
      },
    ],
  },
});
