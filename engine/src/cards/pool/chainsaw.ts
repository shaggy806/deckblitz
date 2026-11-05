import { defineCard } from "../define.js";

const ENTERS = "When this Equipment enters, it deals 3 damage to up to one target creature.";
const DIES = "Whenever one or more creatures die, put a rev counter on this Equipment.";
const PUMP = "Equipped creature gets +X/+0, where X is the number of rev counters on this Equipment.";

export default defineCard({
  name: "Chainsaw",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\n${DIES}\n${PUMP}\nEquip {3}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "rev", amount: 1 },
      resolve: null,
      text: DIES,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPtPerCount: { countersOnSource: "rev", pt: [1, 0] }, text: PUMP }],
});
