import { defineCard } from "../define.js";

const PROHIBIT_TEXT = "Enchanted creature's activated abilities can't be activated.";
const ATTACH_TEXT = "{1}{W}: Attach this Aura to target creature.";

export default defineCard({
  name: "Detainment Spell",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PROHIBIT_TEXT}\n${ATTACH_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      prohibits: [{ act: "activate", who: "each-player", of: { hostOfSource: true } }],
      text: PROHIBIT_TEXT,
    },
  ],
});
