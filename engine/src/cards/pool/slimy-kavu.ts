import { defineCard } from "../define.js";

// Rule 305.7: the land loses its other land types and its rules-text
// abilities and has "{T}: Add {B}" until end of turn.
export default defineCard({
  name: "Slimy Kavu",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: "{T}: Target land becomes a Swamp until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Swamp"], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target land becomes a Swamp until end of turn.",
    },
  ],
});
