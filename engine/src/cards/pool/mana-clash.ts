import { defineCard } from "../define.js";

// "This card's coin flip has no winner or loser" (the ruling). One pass, each
// player's coin and its damage, until a pass in which both came up heads.
export default defineCard({
  name: "Mana Clash",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You and target opponent each flip a coin. Mana Clash deals 1 damage to each player whose coin comes up tails. Repeat this process until both players' coins come up heads on the same flip.",
  targets: ["opponent"],
  effect: {
    kind: "repeat",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "flip-coin", sides: true },
        { kind: "as-player", who: { target: 0 }, effect: { kind: "flip-coin", sides: true } },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "coins-tails", who: "you", atLeast: 1 },
          then: { kind: "damage", amount: 1, who: "you" },
        },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "coins-tails", who: { target: 0 }, atLeast: 1 },
          then: { kind: "damage", amount: 1, target: 0 },
        },
      ],
    },
    again: { kind: "not", of: { kind: "this-way", what: "coins-heads", atLeast: 2 } },
  },
});
