import { defineCard } from "../define.js";

// EDHREC rank 14729. A processor: all of the two or none (Ulamog's Nullifier's
// `needsMin`), each card to its owner's graveyard.
const TEXT =
  'When you cast this spell, you may put two cards your opponents own from exile into their owners\' graveyards. If you do, create three 1/1 colorless Eldrazi Scion creature tokens. They have "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Blight Herder",
  manaCost: "{5}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put two cards your opponents own from exile into their graveyards?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "exile",
              filter: { ownedBy: "opponent" },
              min: 2,
              max: 2,
              needsMin: true,
              destination: "graveyard",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "chosen", atLeast: 2 },
              then: { kind: "create-token", token: "Eldrazi Scion Token", count: 3 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
