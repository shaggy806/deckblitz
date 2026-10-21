import { defineCard } from "../define.js";

// EDHREC rank 18116. A world enchantment (704.5k); Living Lands'
// shape over every land.

const TEXT = "All lands are 1/1 creatures that are still lands.";

export default defineCard({
  name: "Living Plane",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      addTypes: ["creature"],
      setBasePt: { power: 1, toughness: 1 },
      text: TEXT,
    },
  ],
});
