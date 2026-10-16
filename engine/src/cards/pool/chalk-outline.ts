import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 13298. One batched trigger per simultaneous move of creature
// cards out of your graveyard (the ruling) — Grim Reaper's Scythe's.
const TEXT =
  "Whenever one or more creature cards leave your graveyard, create a 2/2 white and blue Detective creature token, then investigate.";

export default defineCard({
  name: "Chalk Outline",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "create-token", token: "Detective Token", count: 1 }, investigate()],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
