import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

// EDHREC rank 9879. A Class (rule 716): each level bar is a sorcery-speed
// activated ability from the level below, and the abilities under it are
// gated on the level (`atLevel`).
//
// Level 1 is Highspire Bell-Ringer's "second spell" reduction: one spell cast
// before this one this turn, and each Monk Class adds its own {1} (the
// ruling). Level 3's card keeps its permission for as long as it stays exiled
// (`"while-exiled"`), whether or not Monk Class is still around — it's the
// card's own ability — cast only, never played as a land, and only once
// you've cast another spell this turn: the gate is checked on the card,
// before it's cast.
//
// Rulings:
//   [2021-07-23] If you have more than one Monk Class on the battlefield, their abilities are
//     cumulative. For example, if you control two Monk Classes, the second spell you cast each
//     turn costs {2} less to cast.
//   [2021-07-23] If Monk Class is the first spell you cast, the next spell is the second spell and
//     costs {1} less. If Monk Class is the second (or later) spell you cast, its bonus won't apply
//     until the next turn.

const SECOND_TEXT = "The second spell you cast each turn costs {1} less to cast.";
const BOUNCE_TEXT = "When this Class becomes level 2, return up to one target nonland permanent to its owner's hand.";
const UPKEEP_TEXT =
  'At the beginning of your upkeep, exile the top card of your library. For as long as it remains exiled, it has "You may cast this card from exile as long as you\'ve cast another spell this turn."';

export default defineCard({
  name: "Monk Class",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${SECOND_TEXT}\n{W}{U}: Level 2\n${BOUNCE_TEXT}\n{1}{W}{U}: Level 3\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 1, atMost: 1 },
      costModification: { applies: {}, caster: "you", reduceGeneric: 1 },
      text: SECOND_TEXT,
    },
  ],
  triggered: [
    atLevel(2, {
      trigger: { on: "class-level-gained", who: "self", level: 2 },
      targets: [{ kind: "optional", of: "nonland-permanent" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    }),
    atLevel(3, {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "while-exiled",
        castOnly: true,
        gate: { kind: "cast-this-turn", who: "you", atLeast: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    }),
  ],
  activated: [classLevel(2, "{W}{U}"), classLevel(3, "{1}{W}{U}")],
});
