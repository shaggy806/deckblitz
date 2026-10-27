import { defineCard } from "../define.js";

// Urza's Destiny (UDS). EDHREC rank 9832.

const TEXT = "{B}: Put target creature card from your graveyard on top of your library.";

export default defineCard({
  name: "Haunted Crossroads",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
