import { defineCard } from "../define.js";

export default defineCard({
  name: "Grow Extra Arms",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets a Spider.\nTarget creature gets +4/+4 until end of turn.",
  targets: ["creature"],
  targetCostReduction: { filter: { subtype: "Spider" }, reduceGeneric: 1 },
  effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
});
