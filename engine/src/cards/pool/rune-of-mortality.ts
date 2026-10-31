import { defineCard } from "../define.js";

// On an Equipment, the Rune gives it the quoted static (`grantsStatic`), which
// works from the Equipment: "equipped creature" is what it's attached to.

const DRAW = "When this Aura enters, draw a card.";
const CREATURE = "As long as enchanted permanent is a creature, it has deathtouch.";
const EQUIPMENT = "As long as enchanted permanent is an Equipment, it has \"Equipped creature has deathtouch.\"";

export default defineCard({
  name: "Rune of Mortality",
  manaCost: "{1}{B}",
  colors: ["B"],
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
      grantKeywords: ["deathtouch"],
      text: CREATURE,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Equipment" } } },
      grantsStatic: [{ affects: { scope: "attached" }, grantKeywords: ["deathtouch"], text: "Equipped creature has deathtouch." }],
      text: EQUIPMENT,
    },
  ],
});
