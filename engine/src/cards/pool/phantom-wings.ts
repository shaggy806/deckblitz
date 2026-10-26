import { defineCard } from "../define.js";

// EDHREC rank 26007. Sacrificed as the cost, the Aura reads the creature it last
// enchanted (`"attached"` — Wings of Hubris's shape).

const FLYING_TEXT = "Enchanted creature has flying.";
const SAC_TEXT = "Sacrifice this Aura: Return enchanted creature to its owner's hand.";

export default defineCard({
  name: "Phantom Wings",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${FLYING_TEXT}\n${SAC_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "attached" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
});
