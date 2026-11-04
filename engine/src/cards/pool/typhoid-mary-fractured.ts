import { defineCard } from "../define.js";

// The mode is picked as the ability goes on the stack (rules 603.3c, 700.2b); whether it's yours to
// pick is read then too (`chooseIf`).

const HEAD = "Whenever Typhoid Mary attacks, choose one at random. If you discarded a card this turn, you choose one instead.";
const MARY = "Mary — Create a Treasure token.";
const TYPHOID = "Typhoid Mary — Draw a card.";
const BLOODY = "Bloody Mary — Each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Typhoid Mary, Fractured",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Villain"],
  power: 3,
  toughness: 3,
  text: `${HEAD}\n• ${MARY}\n• ${TYPHOID}\n• ${BLOODY}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        random: true,
        chooseIf: { kind: "turn-history", what: "discarded" },
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: MARY, effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
          { text: TYPHOID, effect: { kind: "draw", amount: 1 } },
          {
            text: BLOODY,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, who: "each-opponent" },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: HEAD,
    },
  ],
});
