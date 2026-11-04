import { defineCard } from "../define.js";

const STATIC_TEXT =
  'Enchanted creature has ward {2} and "{T}: Add five mana in any combination of colors. Spend this mana only to cast spells."';

export default defineCard({
  name: "Leyline Immersion",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: [{ kind: "permanent", filter: { type: "creature", supertype: "legendary" } }],
  text: `Enchant legendary creature\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{2}" } },
          resolve: null,
          text: "Ward {2}",
        },
      ],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: { oneOf: ["W", "U", "B", "R", "G"] },
            amount: 5,
            spendOnly: { spell: {}, text: "Spend this mana only to cast spells." },
          },
          resolve: null,
          text: "{T}: Add five mana in any combination of colors. Spend this mana only to cast spells.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
