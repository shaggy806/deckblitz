import { defineCard } from "../define.js";

// EDHREC rank 23226. Irresistible Prey's restriction, as an ability.
const TEXT = "{3}{G}: Target creature must be blocked this turn if able.";

export default defineCard({
  name: "Satyr Piper",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
