import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 16268.

const RETURN_TEXT =
  "When a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.";

export default defineCard({
  name: "Dragon Shadow",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+0 and has fear. (It can't be blocked except by artifact creatures and/or black creatures.)\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["fear"],
      text: "Enchanted creature gets +1/+0 and has fear.",
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
        prompt: "Return Dragon Shadow from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
