import { defineCard } from "../define.js";

// EDHREC rank 23434.

const STATIC_TEXT = "Enchanted creature gets +1/+0 and has deathtouch.";
const RETURN_TEXT =
  "When enchanted creature dies, return that card to the battlefield tapped under its owner's control.";

export default defineCard({
  name: "Ferocity of the Hunt",
  manaCost: "{1}{B/G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["deathtouch"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      // "That card": the creature card in the graveyard it went to, only
      // while it's still there (rule 400.7) — Fungal Fortitude's shape.
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
