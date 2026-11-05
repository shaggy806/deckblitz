import { defineCard } from "../define.js";

// EDHREC rank 6817.

export default defineCard({
  name: "Rune of Sustenance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Rune"],
  text: "Enchant permanent\nWhen this Aura enters, draw a card.\nAs long as enchanted permanent is a creature, it has lifelink.\nAs long as enchanted permanent is an Equipment, it has \"Equipped creature has lifelink.\"",
  targets: ["permanent"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["lifelink"],
      text: "As long as enchanted permanent is a creature, it has lifelink.",
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
    },
    {
      affects: { scope: "attached" },
      grantsStatic: [
        {
          affects: { scope: "attached" },
          grantKeywords: ["lifelink"],
          text: "Equipped creature has lifelink.",
        },
      ],
      text: "As long as enchanted permanent is an Equipment, it has \"Equipped creature has lifelink.\"",
      condition: { kind: "source", filter: { attachedTo: { subtype: "Equipment" } } },
    },
  ],
});
