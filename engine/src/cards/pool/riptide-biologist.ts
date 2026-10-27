import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 31730.

export default defineCard({
  name: "Riptide Biologist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: "Protection from Beasts\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Beast" } },
      text: "Protection from Beasts",
    },
  ],
});
