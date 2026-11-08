import { defineCard } from "../define.js";

export default defineCard({
  name: "Soulblast",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice all creatures you control.\nSoulblast deals damage to any target equal to the total power of the sacrificed creatures.",
  additionalCost: {
    also: { text: "Sacrifice all creatures you control", do: { kind: "sacrifice-all", who: "you", filter: { type: "creature" } } },
  },
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { aggregate: "sum", of: "power", filter: {}, in: { paid: "sacrificed" } } },
});
