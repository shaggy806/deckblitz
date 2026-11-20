import { defineCard } from "../define.js";

// Rulings:
//   If you pick an Aura that can't legally enchant this card, then the Aura stays in the graveyard.
//
// "Isn't enchanted" is the source's `enchanted: false`; "all Auras attached to
// Hakim" is an Aura attached to the ability's own source
// (`attachedTo: { isSource: true }`). An Aura put onto the battlefield
// attached to something it can't legally enchant stays where it is (rule
// 303.4g).

const RETURN = "{U}{U}: Return target Aura card from your graveyard to the battlefield attached to Hakim. Activate only during your upkeep and only if Hakim isn't enchanted.";
const DESTROY = "{U}{U}, {T}: Destroy all Auras attached to Hakim.";

export default defineCard({
  name: "Hakim, Loreweaver",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${RETURN}\n${DESTROY}`,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "turn-structure", steps: ["upkeep"] },
          { kind: "source", filter: { enchanted: false } },
        ],
      },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment", subtype: "Aura" } }],
      effect: { kind: "put-onto-battlefield", target: 0, attachedTo: "source" },
      resolve: null,
      text: RETURN,
    },
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: [],
      effect: { kind: "destroy-all", filter: { subtype: "Aura", attachedTo: { isSource: true } } },
      resolve: null,
      text: DESTROY,
    },
  ],
});
