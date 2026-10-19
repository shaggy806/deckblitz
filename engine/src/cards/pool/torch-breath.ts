import { defineCard } from "../define.js";

export default defineCard({
  name: "Torch Breath",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text:
    "This spell costs {2} less to cast if it targets a blue permanent.\n" +
    "This spell can't be countered.\n" +
    "Torch Breath deals X damage to target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  targetCostReduction: { filter: { colors: ["U"] }, reduceGeneric: 2 },
  effect: { kind: "damage", amount: "x", target: 0 },
});
