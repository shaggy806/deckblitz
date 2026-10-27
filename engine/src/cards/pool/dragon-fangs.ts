import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 18108.

const RETURN_TEXT =
  "When a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.";

export default defineCard({
  name: "Dragon Fangs",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1 and has trample.\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +1/+1 and has trample.",
    },
  ],
  triggered: [
    {
      // From the graveyard, on any player's creature (Smoke Shroud's shape). If "that creature"
      // is gone or can't be enchanted, the Aura stays in the graveyard (rule 303.4i).
      fromGraveyard: true,
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "creature", manaValue: { op: "gte", n: 6 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dragon Fangs from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
