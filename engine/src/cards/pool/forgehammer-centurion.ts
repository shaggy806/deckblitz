import { defineCard } from "../define.js";

// EDHREC rank 22370.
//
// Rulings:
//   [2023-02-04] You don't choose a target for Forgehammer Centurion's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you remove two oil counters this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.

// "You may remove two oil counters" is Nazar's shape: offered only while the
// Centurion is on the battlefield with two to remove; "when you do" is a
// reflexive trigger that targets as it goes on the stack.
const DIES_TEXT =
  "Whenever another creature or artifact you control is put into a graveyard from the battlefield, put an oil counter on this creature.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may remove two oil counters from it. When you do, target creature can't block this turn.";

export default defineCard({
  name: "Forgehammer Centurion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${DIES_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "artifact"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 2 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove two oil counters from Forgehammer Centurion?",
          effect: { kind: "remove-counter", target: "source", counter: "oil", amount: 2 },
          then: {
            kind: "reflexive-trigger",
            targets: ["creature"],
            effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
            text: "When you do, target creature can't block this turn.",
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
