import { defineCard } from "../define.js";

// Each creature sacrificed triggers it, Kels itself included (its rulings);
// {U/B} is paid once per trigger.

const SAC_TEXT = "Whenever you sacrifice a creature, you may pay {U/B}. If you do, draw a card.";
const SHIELD_TEXT = "{1}, Sacrifice a creature: Kels gains indestructible until end of turn.";

export default defineCard({
  name: "Kels, Fight Fixer",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Azra", "Warlock"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${SAC_TEXT} ({U/B} can be paid with either {U} or {B}.)\n${SHIELD_TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {U/B} to draw a card?", cost: "{U/B}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
});
