import { defineCard } from "../define.js";

// EDHREC rank 30195.

const TEXT = "When this creature enters, look at the top card of target player's library.";

export default defineCard({
  name: "Merfolk Observer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "look-at-library-top", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
