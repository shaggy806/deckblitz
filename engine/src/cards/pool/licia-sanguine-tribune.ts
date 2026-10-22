import { defineCard } from "../define.js";

// EDHREC rank 14882.
//
// Rulings:
//   [2017-08-25] Licia's first ability checks how much life you've gained during the turn, not
//     what your life total is compared to what it was when the turn began.
//   [2017-08-25] Licia's first ability reduces only generic mana in its cost. It can't reduce the
//     cost below {R}{W}{B}.
//   [2017-08-25] If Licia's last ability doesn't resolve once activated, it can't be activated
//     again in the same turn.

const COUNTERS_TEXT =
  "Pay 5 life: Put three +1/+1 counters on Licia. Activate only during your turn and only once each turn.";

export default defineCard({
  name: "Licia, Sanguine Tribune",
  manaCost: "{5}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike", "lifelink"],
  text: `This spell costs {1} less to cast for each 1 life you gained this turn.\nFirst strike, lifelink\n${COUNTERS_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "life-gained", who: "you" },
  },
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 5 },
      condition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
