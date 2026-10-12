import { defineCard } from "../define.js";

// EDHREC rank 12483. The creatures are fixed as it resolves (rule 611.2c):
// one that enters later this turn gets none of it.
const MINE = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Root Manipulation",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: 'Until end of turn, creatures you control get +2/+2 and gain menace and "Whenever this creature attacks, you gain 1 life." (A creature with menace can\'t be blocked except by two or more creatures.)',
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: MINE, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: MINE, keyword: "menace", duration: "end-of-turn" },
      {
        kind: "grant-triggered-all",
        filter: MINE,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 1 },
          resolve: null,
          text: "Whenever this creature attacks, you gain 1 life.",
        },
      },
    ],
  },
});
