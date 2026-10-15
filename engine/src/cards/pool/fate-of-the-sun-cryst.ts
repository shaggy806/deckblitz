import { defineCard } from "../define.js";

// EDHREC rank 14487. Hawkeye's Shot's reduction: the target slot is any
// nonland permanent, and the reduction holds when it's a tapped creature.

export default defineCard({
  name: "Fate of the Sun-Cryst",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a tapped creature.\nDestroy target nonland permanent.",
  targets: ["nonland-permanent"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 2 },
  effect: { kind: "destroy", target: 0 },
});
