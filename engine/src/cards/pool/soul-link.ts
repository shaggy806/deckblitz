import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 17578. Spirit Link's trigger beside its
// receiving-end twin: a creature that damages itself fires both (the ruling).

const DEALS_TEXT = "Whenever enchanted creature deals damage, you gain that much life.";
const DEALT_TEXT = "Whenever enchanted creature is dealt damage, you gain that much life.";

export default defineCard({
  name: "Soul Link",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${DEALS_TEXT}\n${DEALT_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: DEALS_TEXT,
    },
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: DEALT_TEXT,
    },
  ],
});
