import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 15612.

export default defineCard({
  name: "Myr Mindservant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 1,
  text: "{2}, {T}: Shuffle your library.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "shuffle-library" },
      resolve: null,
      text: "{2}, {T}: Shuffle your library.",
    },
  ],
});
