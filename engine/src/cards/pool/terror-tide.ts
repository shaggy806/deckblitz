import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 7031.
//
// Rulings:
//   [2023-11-10] The value of X is checked only once, as Terror Tide resolves.
//   [2023-11-10] Cards with the ability word "fathomless descent" have abilities that care how
//     many permanent cards are in your graveyard.
//   [2023-11-10] Some descend triggered abilities include intervening "if" clauses (i.e. "if you
//     have [four or eight] permanent cards in your graveyard" in the middle of the ability). Each
//     of these abilities checks your graveyard at the moment it would trigger to see if it does.
//     If you don't have the required number of permanent cards in your graveyard at that time, the
//     ability doesn't trigger at all. If it does trigger, it will check again as it tries to
//     resolve. If you don't have the required number of permanent cards in your graveyard at that
//     time, the ability won't resolve and none of its effects will happen.

// "Permanent cards in your graveyard" (fathomless descent): artifact, battle,
// creature, enchantment, land and planeswalker cards you own there —
// Squirming Emergence's count. Read once, as the spell resolves (the first
// ruling).
const MINUS_X: EffectAmount = {
  product: [
    {
      countInGraveyard: {
        typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
        ownedBy: "you",
      },
    },
    -1,
  ],
};

export default defineCard({
  name: "Terror Tide",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Fathomless descent — All creatures get -X/-X until end of turn, where X is the number of permanent cards in your graveyard.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: MINUS_X,
    toughness: MINUS_X,
    duration: "end-of-turn",
  },
});
