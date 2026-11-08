import { defineCard } from "../define.js";

const TEXT =
  "You may cast spells from the top of your library by sacrificing a nonland permanent in addition to paying their other costs.";

export default defineCard({
  name: "Into the Pit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  looksAtOwnLibraryTop: true,
  text: `You may look at the top card of your library any time.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", sacrifice: { notTypes: ["land"] } },
      text: TEXT,
    },
  ],
});
