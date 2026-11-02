import { defineCard } from "../define.js";

export default defineCard({
  name: "Ertai's Scorn",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "turn-stat", stat: "spells-cast", who: "opponent", atLeast: 2 },
    reduceColored: "{U}",
  },
  text: "This spell costs {U} less to cast if an opponent cast two or more spells this turn.\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
