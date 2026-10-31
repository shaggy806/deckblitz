import { defineCard } from "../define.js";

const TEXT =
  "The first creature spell you cast each turn costs {2} less to cast and can be cast as though it had flash.";

// The rulings: the whole turn counts, even before Radagast arrived — cast
// Radagast itself and no later creature spell that turn is the first. The
// first creature spell needn't be the first spell. The reduction is generic
// only, applies to alternative costs, comes after increases, and changes
// only the total cost paid, not the mana value.
export default defineCard({
  name: "Radagast of Rhosgobel",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 2,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, caster: "you", reduceGeneric: 2, firstEachTurn: true },
      castAsThoughFlash: { type: "creature" },
      castAsThoughFlashFirstEachTurn: true,
      text: TEXT,
    },
  ],
});
