import { defineCard } from "../define.js";

// "Target creature that's blocking equipped creature":
// `blockingRelation` of the Equipment's host. The Equipment deals the 1
// damage itself.
const ATTACK_TEXT = "Whenever equipped creature attacks, you get {E}{E} (two energy counters).";
const PAY_TEXT =
  "Pay {E}{E}: Choose target creature that's blocking equipped creature. Flip a coin. If you win the flip, exile the chosen creature. Otherwise, this Equipment deals 1 damage to it.";

export default defineCard({
  name: "Plasma Caster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${ATTACK_TEXT}\n${PAY_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", blockingRelation: { relation: "blocking", of: "host" } },
        },
      ],
      effect: {
        kind: "flip-coin",
        won: { kind: "exile", target: 0 },
        lost: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: PAY_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
