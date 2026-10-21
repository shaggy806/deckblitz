import { defineCard } from "../define.js";

// Raid (its rulings): any attack you made this turn counts, whatever became
// of the attacker or what it attacked.
export default defineCard({
  name: "Siren Reaver",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Raid — This spell costs {1} less to cast if you attacked this turn.\nFlying",
  selfCostReduction: {
    condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    reduceGeneric: 1,
  },
});
