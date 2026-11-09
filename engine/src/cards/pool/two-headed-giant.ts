import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, flip two coins. If both coins come up heads, this creature gains double strike until end of turn. If both coins come up tails, this creature gains menace until end of turn.";

export default defineCard({
  name: "Two-Headed Giant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        count: 2,
        sides: true,
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "coins-heads", atLeast: 2 },
              then: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "coins-tails", atLeast: 2 },
              then: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
