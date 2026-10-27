import { defineCard } from "../define.js";

// EDHREC rank 29245. Ravnica: City of Guilds.

const TEXT = "{U}: This creature's owner shuffles it into their library.";

export default defineCard({
  name: "Cerulean Sphinx",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
