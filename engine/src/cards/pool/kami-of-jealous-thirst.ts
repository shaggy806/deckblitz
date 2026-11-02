import { defineCard } from "../define.js";

const DRAIN =
  "{4}{B}: Each opponent loses 2 life and you gain 2 life. This ability costs {4}{B} less to activate if you've drawn three or more cards this turn. Activate only once each turn.";

export default defineCard({
  name: "Kami of Jealous Thirst",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DRAIN}`,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      costReduction: {
        reduceGeneric: 4,
        reduceColored: "{B}",
        condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 3 },
      },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
});
