import { defineCard } from "../define.js";

const TREASURE_TEXT = "{U/R}{U/R}, Discard this card: Create a Treasure token.";

export default defineCard({
  name: "Creative Outburst",
  manaCost: "{3}{U}{U}{R}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: `Creative Outburst deals 5 damage to any target. Look at the top five cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.\n${TREASURE_TEXT}`,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
    ],
  },
  activated: [
    {
      cost: { mana: "{U/R}{U/R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
      zone: "hand",
    },
  ],
});
