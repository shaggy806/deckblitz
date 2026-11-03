import { defineCard } from "../define.js";

// Rule 305.7: the land loses its other land types and its rules-text
// abilities and has "{T}: Add {B}" for as long as this lasts.
const TEXT = "{T}: Target land becomes a Swamp until its controller's next untap step.";

export default defineCard({
  name: "Orcish Farmer",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Swamp"], duration: "until-its-controllers-next-untap-step" },
      resolve: null,
      text: TEXT,
    },
  ],
});
