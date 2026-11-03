import { defineCard } from "../define.js";

const TEXT = "{1}{U}: Look at the top card of target player's library.";

export default defineCard({
  name: "Rootwater Mystic",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["player"],
      effect: { kind: "look-at-library-top", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
