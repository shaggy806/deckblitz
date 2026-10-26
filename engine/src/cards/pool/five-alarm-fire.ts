import { defineCard } from "../define.js";

// EDHREC rank 19545. `deals-damage` with no recipient named fires once per
// simultaneous damage event per creature, however many things it hit — a
// trampler and its blocker are one trigger, double strike two (the ruling).
//
// Rulings:
//   [2013-01-24] Five-Alarm Fire’s first ability triggers once for each time a creature you
//     control deals combat damage, even if it deals combat damage to more than one creature,
//     planeswalker, or player. For example, an attacking creature with trample that deals combat
//     damage to a blocking creature and the defending player will cause Five-Alarm Fire’s ability
//     to trigger once. A creature with double strike, however, may cause Five-Alarm Fire’s ability
//     to trigger twice during a single combat.

const TRIGGER_TEXT = "Whenever a creature you control deals combat damage, put a blaze counter on this enchantment.";
const ACTIVATED_TEXT = "Remove five blaze counters from this enchantment: It deals 5 damage to any target.";

export default defineCard({
  name: "Five-Alarm Fire",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "blaze", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "blaze", count: 5 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
