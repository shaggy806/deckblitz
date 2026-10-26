import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 9310. Stony Silence's static on an artifact:
// only battlefield artifacts' activated abilities, mana abilities included
// (the rulings); triggered and static abilities are untouched.

const TEXT = "Activated abilities of artifacts can't be activated.";

export default defineCard({
  name: "Null Rod",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { type: "artifact" } },
      text: TEXT,
    },
  ],
});
