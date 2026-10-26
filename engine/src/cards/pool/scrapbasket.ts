import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 21393.
//
// Rulings:
//   It stays an artifact, just a colorful one. A later colour-changing effect overwrites it.

export default defineCard({
  name: "Scrapbasket",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 2,
  text: "{1}: This creature becomes all colors until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "become-color", target: "source", colors: ["W", "U", "B", "R", "G"], duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature becomes all colors until end of turn.",
    },
  ],
});
