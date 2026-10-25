import { defineCard } from "../define.js";

// EDHREC rank 22277.

export default defineCard({
  name: "Marshmist Titan",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 5,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { devotionTo: ["B"] },
  },
  text: "This spell costs {X} less to cast, where X is your devotion to black. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)",
});
