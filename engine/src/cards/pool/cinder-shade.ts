import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31304.

const PUMP = "{B}: This creature gets +1/+1 until end of turn.";
const SAC = "{R}, Sacrifice this creature: It deals damage equal to its power to target creature.";

export default defineCard({
  name: "Cinder Shade",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 1,
  toughness: 1,
  text: `${PUMP}\n${SAC}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: SAC,
    },
  ],
});
