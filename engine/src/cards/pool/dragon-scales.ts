import { defineCard } from "../define.js";

// EDHREC rank 23359.

export default defineCard({
  name: "Dragon Scales",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+2 and has vigilance.\nWhen a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantKeywords: ["vigilance"],
      text: "Enchanted creature gets +1/+2 and has vigilance.",
    },
  ],
  triggered: [
    {
      // From the graveyard, on any player's creature. "That creature" is the
      // entering one while it is still the same object (rule 400.7); if it
      // isn't, or this can't enchant it, this stays in the graveyard (rule
      // 303.4i).
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", manaValue: { op: "gte", n: 6 } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dragon Scales from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: "When a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.",
    },
  ],
});
