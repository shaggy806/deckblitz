import { defineCard } from "../define.js";

// EDHREC rank 1515. The granted trigger is the creature's: "an opponent" is
// an opponent of its controller, who draws (the rulings); any damage, not only
// combat damage.

const GRANT_TEXT =
  'Enchanted creature gets +1/+1 and has "Whenever this creature deals damage to an opponent, you may draw a card."';

export default defineCard({
  name: "Snake Umbra",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: `Enchant creature\n${GRANT_TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", to: "opponent" },
          targets: [],
          effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
          resolve: null,
          text: "Whenever this creature deals damage to an opponent, you may draw a card.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
