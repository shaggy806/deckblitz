import { defineCard } from "../define.js";

// EDHREC rank 21792.
//
// Its second ability works only while it's a spell on the stack
// (`zone: "stack"`, rule 113.6), and any player may activate it (602.2): the
// activator controls the ability and pays its cost, so "you may choose a new
// target" is theirs to choose (rule 115.7d — keeping the target is a choice).
// The charge counters are on the spell, read as it resolves; they cease to
// exist as it leaves the stack (rule 122.2). A Lightning Storm gone from the
// stack by then is a new object: the ability does nothing (rule 400.7).
const DAMAGE =
  "Lightning Storm deals X damage to any target, where X is 3 plus the number of charge counters on Lightning Storm.";
const RECHARGE =
  "Discard a land card: Put two charge counters on Lightning Storm. You may choose a new target for it. Any player may activate this ability but only if Lightning Storm is on the stack.";

export default defineCard({
  name: "Lightning Storm",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${DAMAGE}\n${RECHARGE}`,
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { sum: [3, { countersOn: "source", counter: "charge" }] },
  },
  activated: [
    {
      zone: "stack",
      anyPlayer: true,
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "charge", amount: 2 },
          { kind: "change-targets", target: "source", how: "choose-new" },
        ],
      },
      resolve: null,
      text: RECHARGE,
    },
  ],
});
