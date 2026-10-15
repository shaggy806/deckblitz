import { defineCard } from "../define.js";

// EDHREC rank 8277. Final Fantasy.
//
// Shielded by Faith's move, behind Seer's Sundial's "you may pay {1}": the
// Aura goes onto the creature that entered, only while it's still that
// object, and only if it could legally enchant it (rule 301.5c — `attach`).
const GRANT_TEXT = "Enchanted creature has flying and hexproof.";
const MOVE_TEXT = "Whenever a creature you control enters, you may pay {1}. If you do, attach this Aura to that creature.";

export default defineCard({
  name: "Brilliant Wings",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature you control\n${GRANT_TEXT}\n${MOVE_TEXT}`,
  targets: ["creature-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying", "hexproof"],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to attach Brilliant Wings to that creature?",
        cost: "{1}",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: MOVE_TEXT,
    },
  ],
});
