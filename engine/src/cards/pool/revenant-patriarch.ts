import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, if {W} was spent to cast it, target player skips their next combat phase.";
const CANT_BLOCK = "This creature can't block.";

export default defineCard({
  name: "Revenant Patriarch",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  text: `${ENTERS}\n${CANT_BLOCK}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: CANT_BLOCK }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpent: [{ type: "W", amount: { op: "gte", n: 1 } }] } },
      targets: ["player"],
      effect: { kind: "skip-step", step: "combat", who: 0 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
