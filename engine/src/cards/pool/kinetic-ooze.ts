import { defineCard } from "../define.js";

// EDHREC rank 7077.
//
// Its enters trigger reads the X it was cast with (rule 107.3m) — in the
// first target's mana value bound and both "if X is" clauses; entered any
// other way, X is 0. The "any number of other target creatures" are chosen
// as it triggers whatever X is (none is fine), and doubled only at 10 or more.
const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const TRIGGER_TEXT =
  "When this creature enters, destroy up to one target artifact or enchantment with mana value X or less. " +
  "If X is 5 or more, you draw a card. If X is 10 or more, double the number of +1/+1 counters on any number " +
  "of other target creatures.";

export default defineCard({
  name: "Kinetic Ooze",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "permanent",
            filter: { typesAnyOf: ["artifact", "enchantment"], manaValue: { op: "lte", n: "x" } },
          },
        },
        { kind: "any-number", of: { kind: "other", of: "creature" } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "x", compare: { op: "gte", n: 5 } },
            then: { kind: "draw", amount: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "x", compare: { op: "gte", n: 10 } },
            then: {
              kind: "for-each-target",
              from: 1,
              effect: { kind: "double-counters", target: 1, counter: "+1/+1" },
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
