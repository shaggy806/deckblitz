import { defineCard } from "../define.js";

// EDHREC rank 8566.
const TEXT = "{S}, {T}: Tap target artifact or creature.";

export default defineCard({
  name: "Icebind Pillar",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["artifact"],
  text: `${TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{S}", tap: true },
      targets: ["artifact-or-creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
