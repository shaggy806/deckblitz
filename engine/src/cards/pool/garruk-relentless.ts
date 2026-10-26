import { defineCard } from "../define.js";

// EDHREC rank 13361. Front face of Garruk Relentless // Garruk, the Veil-Cursed.
//
// Rulings:
//   [2011-09-22] You can't activate a loyalty ability of Garruk Relentless and later that turn
//     after he transforms activate a loyalty ability of Garruk, the Veil-Cursed.
//   [2011-09-22] Garruk Relentless's first ability is a state-triggered ability. It triggers once
//     Garruk has two or fewer loyalty counters on him and it can't retrigger while that ability is
//     on the stack.
//   [2011-09-22] You don't add or remove loyalty counters from Garruk Relentless when he
//     transforms into Garruk, the Veil-Cursed. In most cases, he'll have one or two loyalty
//     counters on him.
//
// The transform is a state trigger (rule 603.8 — Afiya Grove's shape over
// loyalty counters). The first 0 is Predatory Urge's "deals damage, then that
// creature deals damage equal to its power to it": a one-sided fight from the
// target back onto Garruk.

const TRANSFORM = "When Garruk has two or fewer loyalty counters on him, transform him.";
const FIGHT = "0: Garruk deals 3 damage to target creature. That creature deals damage equal to its power to him.";
const WOLF = "0: Create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Garruk Relentless",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 3,
  text: `${TRANSFORM}\n${FIGHT}\n${WOLF}`,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "loyalty", compare: { op: "lte", n: 2 } } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM,
    },
  ],
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "fight", a: 0, b: "source", oneSided: true },
        ],
      },
      resolve: null,
      text: FIGHT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: WOLF,
    },
  ],
  faces: ["Garruk Relentless", "Garruk, the Veil-Cursed"],
  transform: true,
});
