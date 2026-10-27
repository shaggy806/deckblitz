import { defineCard } from "../define.js";

export default defineCard({
  name: "Gigapede",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 6,
  toughness: 1,
  keywords: ["shroud"],
  text: "Shroud (This creature can't be the target of spells or abilities.)\nAt the beginning of your upkeep, if this card is in your graveyard, you may discard a card. If you do, return this card to your hand.",
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to return Gigapede to your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "return-to-hand", target: "source", from: "graveyard" },
            },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, if this card is in your graveyard, you may discard a card. If you do, return this card to your hand.",
    },
  ],
});
