import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this Aura enters, untap enchanted creature. It gains hexproof until end of turn. If it's suspected, it's no longer suspected.";
const STATIC_TEXT = "Enchanted creature gets +2/+2 and can't become suspected.";

export default defineCard({
  name: "Airtight Alibi",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  targets: ["creature"],
  text: `Flash\nEnchant creature\n${ENTERS_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "attached" },
          { kind: "grant-keyword", target: "attached", keyword: "hexproof", duration: "end-of-turn" },
          { kind: "unsuspect", target: "attached" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      prohibits: [{ act: "become-suspected", object: { hostOfSource: true } }],
      text: STATIC_TEXT,
    },
  ],
});
