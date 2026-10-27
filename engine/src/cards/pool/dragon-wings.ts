import { defineCard } from "../define.js";

const RETURN_TEXT =
  "When a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.";

export default defineCard({
  name: "Dragon Wings",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{1}{U}" },
  text: `Enchant creature\nEnchanted creature has flying.\nCycling {1}{U} ({1}{U}, Discard this card: Draw a card.)\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
  triggered: [
    {
      // From the graveyard, on any player's creature. "That creature" is the
      // entering one while it's still the same object (rule 400.7); if it
      // isn't, Dragon Wings stays in the graveyard (rule 303.4i).
      fromGraveyard: true,
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "creature", manaValue: { op: "gte", n: 6 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dragon Wings from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
