import { defineCard } from "../define.js";

// EDHREC rank 18214. The life is the roll's result, modifiers included.
const ABILITY_TEXT = "{T}, Sacrifice this creature: Roll a six-sided die. You gain life equal to the result.";

export default defineCard({
  name: "Vegetation Abomination",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Plant", "Mutant", "Food"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "roll-dice", sides: 6, then: { kind: "gain-life", amount: { roll: "total" } } },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
