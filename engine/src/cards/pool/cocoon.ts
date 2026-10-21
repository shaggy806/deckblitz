import { defineCard } from "../define.js";

// EDHREC rank 30257.
//
// Rulings:
//   [2004-10-04] Cocoon can be used on a tapped creature.
//   [2004-10-04] The creature can still be untapped using spells and abilities.
//   [2005-08-01] If the Aura is moved to a different creature, the number of counters is
//     unchanged.
//
// The lock is Tractor Beam's `doesnt-untap` restriction on the enchanted
// creature, gated on the Aura's own pupa counters. "If you can't" is the
// Aura having no pupa counter to remove. The +1/+1 counter and flying go on
// before the sacrifice, so "enchanted creature" is still read off a live
// attachment; nothing observes the order inside the one resolution.

const ENTERS = "When this Aura enters, tap enchanted creature and put three pupa counters on this Aura.";
const LOCK = "Enchanted creature doesn't untap during your untap step if this Aura has a pupa counter on it.";
const UPKEEP =
  "At the beginning of your upkeep, remove a pupa counter from this Aura. If you can't, sacrifice it, put a +1/+1 counter on enchanted creature, and that creature gains flying.";

export default defineCard({
  name: "Cocoon",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ENTERS}\n${LOCK}\n${UPKEEP}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "add-counter", target: "source", counter: "pupa", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "pupa", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "pupa", amount: 1 },
        else: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: "attached", keyword: "flying", duration: "permanent" },
            { kind: "sacrifice-source" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "self-counters", counter: "pupa", compare: { op: "gte", n: 1 } },
      restrictions: ["doesnt-untap"],
      text: LOCK,
    },
  ],
});
