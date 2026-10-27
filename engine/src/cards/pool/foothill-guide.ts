import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 30709.

export default defineCard({
  name: "Foothill Guide",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{W}" },
  text: "Protection from Goblins\nMorph {W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Goblin" } },
      text: "Protection from Goblins",
    },
  ],
});
