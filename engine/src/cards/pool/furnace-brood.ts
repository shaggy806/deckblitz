import { defineCard } from "../define.js";

// EDHREC rank 32258.

export default defineCard({
  name: "Furnace Brood",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: "{R}: Target creature can't be regenerated this turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "cant-regenerate", target: 0 },
      resolve: null,
      text: "{R}: Target creature can't be regenerated this turn.",
    },
  ],
});
