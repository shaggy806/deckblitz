import { defineCard } from "../define.js";

// On an Equipment, the Rune gives it the quoted static (`grantsStatic`), which
// works from the Equipment: "equipped creature" is what it's attached to.

const DRAW = "When this Aura enters, draw a card.";
const CREATURE = "As long as enchanted permanent is a creature, it gets +1/+1 and has trample.";
const EQUIPMENT = "As long as enchanted permanent is an Equipment, it has \"Equipped creature gets +1/+1 and has trample.\"";

export default defineCard({
  name: "Rune of Might",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura", "Rune"],
  text: `Enchant permanent\n${DRAW}\n${CREATURE}\n${EQUIPMENT}`,
  targets: ["permanent"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: CREATURE,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Equipment" } } },
      grantsStatic: [{ affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["trample"], text: "Equipped creature gets +1/+1 and has trample." }],
      text: EQUIPMENT,
    },
  ],
});
