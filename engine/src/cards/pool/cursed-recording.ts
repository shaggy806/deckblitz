import { defineCard } from "../define.js";

// EDHREC rank 10566.
//
// Rulings:
//   [2024-09-20] The copy made by Cursed Recording's last ability is created on the stack, so it's
//     not "cast."
//   [2024-09-20] If the spell that's copied is modal, the copy will have the same mode or modes.
//
// The seven-counter check is the trigger's own, as it resolves (Primal
// Amulet's shape); "those counters" are all its time counters. The tap
// ability is Striking Palette's delayed trigger, this turn only.
const CAST =
  "Whenever you cast an instant or sorcery spell, put a time counter on this artifact. Then if there are seven or more time counters on it, remove those counters and it deals 20 damage to you.";
const COPY =
  "{T}: When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Cursed Recording",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${CAST}\n${COPY}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "Copy that spell. You may choose new targets for the copy.",
      },
      resolve: null,
      text: COPY,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "time", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 7 } },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "remove-counter",
                  target: "source",
                  counter: "time",
                  amount: { countersOn: "source", counter: "time" },
                },
                { kind: "damage", amount: 20, who: "you" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: CAST,
    },
  ],
});
