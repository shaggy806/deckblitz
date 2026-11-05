import { defineCard } from "../define.js";

const TAP_TEXT = "{T}: Target player exiles a card from their graveyard.";
const SAC_TEXT = "{1}, Sacrifice this artifact: Exile target card from a graveyard. Draw a card.";

export default defineCard({
  name: "Scrabbling Claws",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${TAP_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "graveyard",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
