import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

// EDHREC rank 9905.
//
// Rulings:
//   [2026-01-27] An ability that advances a Class to a higher level is a normal activated ability.
//     It uses the stack and can be responded to.
//   [2026-01-27] Class cards have multiple text box sections. Other than the top section, each
//     section contains a class level bar that includes a cost and a level number. Each represents
//     an activated ability with the listed cost that advances the Class to the level listed in
//     that bar.
//   [2026-01-27] Gaining a level won't remove abilities that a Class had at a previous level.
//   [2026-01-27] There's no restriction on how many Class permanents you can control, whether
//     they're the same or different classes. Each Class permanent tracks its own level separately.
//   [2026-01-27] Each Class starts at level 1 and has the abilities in the top section of its text
//     box. Once a Class advances to level 2 or level 3, it has all of the abilities listed in the
//     associated section of its text box as well.
//   [2026-01-27] You can't activate an ability that advances a Class to a particular level if that
//     Class is already that level or higher. For example, if a Class is already level 2, you can't
//     activate the ability that advances it to level 2 again.
//   [2026-01-27] Leader's Talent's level 3 ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered or otherwise leaves the stack.
//
// A Class (rule 716): `classLevel` bars, `atLevel` gates. Level 2's "if it
// had a counter on it" reads the creature as it last existed on the
// battlefield — the trigger's filter, matched against what left (any kind of
// counter, `counters` with no `kind`); a past fact, so it holds again as the
// ability resolves.
const ATTACK_TEXT = "Whenever you attack, put a +1/+1 counter on target attacking creature.";
const LEAVE_TEXT = "Whenever a creature you control leaves the battlefield, if it had a counter on it, you gain 2 life.";
const CAST_TEXT = "Whenever you cast a spell, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Leader's Talent",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${ATTACK_TEXT}\n{2}{W}: Level 2\n${LEAVE_TEXT}\n{3}{W}: Level 3\n${CAST_TEXT}`,
  activated: [classLevel(2, "{2}{W}"), classLevel(3, "{3}{W}")],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    atLevel(2, {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: LEAVE_TEXT,
    }),
    atLevel(3, {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: CAST_TEXT,
    }),
  ],
});
