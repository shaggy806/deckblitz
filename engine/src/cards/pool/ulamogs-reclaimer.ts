import { defineCard } from "../define.js";

// EDHREC rank 24817.

export default defineCard({
  name: "Ulamog's Reclaimer",
  manaCost: "{4}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 2,
  toughness: 5,
  text: "Devoid (This card has no color.)\nWhen this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, return target instant or sorcery card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
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
              then: { kind: "return-to-hand", target: 0, from: "graveyard" },
            },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, return target instant or sorcery card from your graveyard to your hand.",
    },
  ],
});
