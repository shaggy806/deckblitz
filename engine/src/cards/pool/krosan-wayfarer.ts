import { defineCard } from "../define.js";

// EDHREC rank 10855.
// Putting the land onto the battlefield is optional (the ruling): `min: 0`.

export default defineCard({
  name: "Krosan Wayfarer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: You may put a land card from your hand onto the battlefield.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: "Sacrifice this creature: You may put a land card from your hand onto the battlefield.",
    },
  ],
});
