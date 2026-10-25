import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 28969.

export default defineCard({
  name: "Eron the Relentless",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 5,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\n{R}{R}{R}: Regenerate Eron.",
  activated: [
    {
      cost: { mana: "{R}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{R}{R}{R}: Regenerate Eron.",
    },
  ],
});
