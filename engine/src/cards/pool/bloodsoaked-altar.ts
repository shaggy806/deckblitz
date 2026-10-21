import { defineCard } from "../define.js";

// EDHREC rank 19795.

const TEXT =
  "{T}, Pay 2 life, Discard a card, Sacrifice a creature: Create a 5/5 black Demon creature token with flying. Activate only as a sorcery.";

export default defineCard({
  name: "Bloodsoaked Altar",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        payLife: 2,
        discard: { count: 1 },
        sacrifice: { filter: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "5/5 Demon Token", count: 1 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
