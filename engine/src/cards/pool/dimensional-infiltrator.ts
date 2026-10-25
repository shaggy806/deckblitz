import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] You choose whether to return Dimensional Infiltrator to its owner's hand as its
//     ability resolves. If the exiled card is a land card, you can't wait and return Dimensional
//     Infiltrator at a later time.

const TEXT =
  "{1}{C}: Target opponent exiles the top card of their library. If it's a land card, you may return this creature to its owner's hand. ({C} represents colorless mana.)";

export default defineCard({
  name: "Dimensional Infiltrator",
  manaCost: "{1}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Devoid (This card has no color.)\nFlash\nFlying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{C}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: 0, amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "land" }, atLeast: 1 },
            then: {
              kind: "may",
              prompt: "Return Dimensional Infiltrator to its owner's hand?",
              effect: { kind: "return-to-hand", target: "source" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
