import { defineCard } from "../define.js";

// EDHREC rank 7810.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. If you do, draw a card and this creature can't be blocked this turn.";

export default defineCard({
  name: "Vampire Gourmand",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
