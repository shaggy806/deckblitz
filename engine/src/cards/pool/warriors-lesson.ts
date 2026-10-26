import { defineCard } from "../define.js";

// EDHREC rank 15093.
const GRANTED = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Warriors' Lesson",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Until end of turn, up to two target creatures you control each gain "${GRANTED}"`,
  targets: [{ kind: "any-number", of: "creature-you-control", max: 2 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "grant-triggered",
      target: 0,
      duration: "end-of-turn",
      ability: {
        trigger: { on: "deals-combat-damage-to-player", who: "self" },
        targets: [],
        effect: { kind: "draw", amount: 1 },
        resolve: null,
        text: GRANTED,
      },
    },
  },
});
