import { defineCard } from "../define.js";

export default defineCard({
  name: "Admiral's Order",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Raid — If you attacked this turn, you may pay {U} rather than pay this spell's mana cost.\nCounter target spell.",
  // Raid: an alternative cost offered only if you attacked this turn.
  alternativeCost: { mana: "{U}", condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 } },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
