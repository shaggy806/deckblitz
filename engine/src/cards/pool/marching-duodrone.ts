import { defineCard } from "../define.js";

// EDHREC rank 6950.
//
// Every player creates one, the attacking player included (`create-token`'s
// `who: "each-player"` — Descent into Avernus).
const TEXT =
  "Whenever this creature attacks, each player creates a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Marching Duodrone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, who: "each-player" },
      resolve: null,
      text: "Whenever this creature attacks, each player creates a Treasure token.",
    },
  ],
});
