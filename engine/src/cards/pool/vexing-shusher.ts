import { defineCard } from "../define.js";

const SHUSH_TEXT = "{R/G}: Target spell can't be countered.";

// A counterspell may still target the spell, and does whatever else it says
// (its ruling): only the countering fails.
export default defineCard({
  name: "Vexing Shusher",
  manaCost: "{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: `This spell can't be countered.\n${SHUSH_TEXT}`,
  cantBeCountered: true,
  activated: [
    {
      cost: { mana: "{R/G}", tap: false },
      targets: ["spell"],
      effect: { kind: "spell-cant-be-countered", target: 0 },
      resolve: null,
      text: SHUSH_TEXT,
    },
  ],
});
