import { defineCard } from "../define.js";

// EDHREC rank 16141. Ixalan.

export default defineCard({
  name: "Deadeye Plunderers",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  text: "This creature gets +1/+1 for each artifact you control.\n{2}{U}{B}: Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each artifact you control.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}{B}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{2}{U}{B}: Create a Treasure token.",
    },
  ],
});
