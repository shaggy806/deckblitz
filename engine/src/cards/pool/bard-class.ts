import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

// EDHREC rank 7835. A Class (rule 716): each level bar is a sorcery-speed
// activated ability from the level below, and the abilities under it are
// gated on the level (`atLevel`).
//
// Level 1 is an `others-enter-battlefield` replacement (rule 614.12): each
// Bard Class adds its own counter (the ruling). Level 2 takes only coloured
// mana off — {R} and {G} pips, never generic (the ruling: {2}{G} costs {2}).
// Level 3's cards stay exiled for good once the turn ends (the ruling).
//
// Rulings:
//   [2021-07-23] If you control multiple Bard Classes, legendary creatures you control enter the
//     battlefield with that many additional +1/+1 counters.
//   [2021-07-23] Unlike most abilities that reduce the costs of spells, Bard Class's Level 2
//     ability cannot be applied to generic mana costs. For example, a spell that costs {2}{G} to
//     cast would instead cost {2} to cast.
//   [2021-07-23] If you do not play the cards exiled with Bard Classes Level 3 ability on the turn
//     they are exiled, they will remain exiled indefinitely and cannot be played on a later turn.

const ENTERS_TEXT = "Legendary creatures you control enter with an additional +1/+1 counter on them.";
const COST_TEXT =
  "Legendary spells you cast cost {R}{G} less to cast. This effect reduces only the amount of colored mana you pay.";
const CAST_TEXT =
  "Whenever you cast a legendary spell, exile the top two cards of your library. You may play them this turn.";

export default defineCard({
  name: "Bard Class",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${ENTERS_TEXT}\n{R}{G}: Level 2\n${COST_TEXT}\n{3}{R}{G}: Level 3\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", supertype: "legendary", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: ENTERS_TEXT,
    },
    atLevel(2, {
      affects: { scope: "self" },
      costModification: {
        applies: { supertype: "legendary" },
        caster: "you",
        reduceColored: "{R}{G}",
        coloredOnly: true,
      },
      text: COST_TEXT,
    }),
  ],
  triggered: [
    atLevel(3, {
      trigger: { on: "cast-spell", who: "you", filter: { supertype: "legendary" } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn" },
      resolve: null,
      text: CAST_TEXT,
    }),
  ],
  activated: [classLevel(2, "{R}{G}"), classLevel(3, "{3}{R}{G}")],
});
