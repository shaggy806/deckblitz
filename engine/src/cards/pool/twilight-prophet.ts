import { defineCard } from "../define.js";

// Rulings: the blessing is an intervening if (you must have it as the upkeep
// begins); a land, or a card with {X}, counts its mana value as printed
// (0 for {X}).
const UPKEEP =
  "At the beginning of your upkeep, if you have the city's blessing, reveal the top card of your library and put it into your hand. Each opponent loses X life and you gain X life, where X is that card's mana value.";

export default defineCard({
  name: "Twilight Prophet",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "ascend"],
  text: `Flying\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "citys-blessing" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        reveal: true,
        then: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", who: "each-opponent", amount: { manaValueOf: 0 } },
            { kind: "gain-life", amount: { manaValueOf: 0 } },
          ],
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
