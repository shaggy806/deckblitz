import { defineCard } from "../define.js";

// {1} more mana on top of each loyalty cost (rule 602.2b) — the loyalty
// counters are paid as printed.

const TEXT = "Loyalty abilities of planeswalkers your opponents control cost {1} more to activate.";

export default defineCard({
  name: "Eidolon of Obstruction",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { type: "planeswalker", controlledBy: "opponent" },
        abilityKind: "loyalty",
        increaseGeneric: 1,
      },
      text: TEXT,
    },
  ],
});
