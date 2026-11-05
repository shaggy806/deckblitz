import { defineCard } from "../define.js";

// EDHREC rank 26092.

export default defineCard({
  name: "Murk Strider",
  manaCost: "{3}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 3,
  toughness: 2,
  text: "Devoid (This card has no color.)\nWhen this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, return target creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a card an opponent owns from exile into their graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "exile",
              filter: { ownedBy: "opponent" },
              min: 1,
              max: 1,
              destination: "graveyard",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "chosen" },
              then: { kind: "return-to-hand", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, return target creature to its owner's hand.",
    },
  ],
});
