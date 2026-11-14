import { defineCard } from "../define.js";

// EDHREC rank 9722.
//
// Rulings:
//   Trample and trample over planeswalkers can both apply during the same combat: blocked by a
//     3/3 while attacking a planeswalker with two loyalty, 3 to the blocker, 2 to the
//     planeswalker and 2 to its controller.
//   Excess damage to a planeswalker is damage greater than its loyalty, whatever its toughness
//     if it's also a creature; deathtouch doesn't make 1 damage lethal to it.
//   Trample over planeswalkers takes into account the other damage being assigned to that
//     planeswalker at the same time (with a 2/2 Bear Cub, 5 to a seven-loyalty planeswalker and
//     2 to its controller).
//
// "For each other spell cast this turn": the spells cast this turn by everyone
// as its cost is determined (rule 601.2f), before it is itself cast (601.2i),
// three generic each. Trample over planeswalkers is the keyword (702.19c; its
// removed-planeswalker rule, 702.19e, too) — the assignment's offer carries
// the planeswalker, its controller and the loyalty left to fill.
const COST_TEXT = "This spell costs {3} less to cast for each other spell cast this turn.";
const HEXPROOF_TEXT = "Thrasta has hexproof as long as it entered this turn.";

export default defineCard({
  name: "Thrasta, Tempest's Roar",
  manaCost: "{10}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "haste", "trample-over-planeswalkers"],
  text:
    `${COST_TEXT}\nTrample, haste\n` +
    "Trample over planeswalkers (This creature can deal excess combat damage to the controller of the planeswalker it's attacking.)\n" +
    HEXPROOF_TEXT,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { product: [{ turnStat: "spells-cast", who: "each-player" }, 3] },
  },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
