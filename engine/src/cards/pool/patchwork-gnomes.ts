import { defineCard } from "../define.js";

// EDHREC rank 15727.

export default defineCard({
  name: "Patchwork Gnomes",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 1,
  text: "Discard a card: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Discard a card: Regenerate this creature.",
    },
  ],
});
