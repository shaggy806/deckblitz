import { defineCard } from "../define.js";

// EDHREC rank 19453. The Brothers' War.

const PUMP_TEXT = "{2}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Fallaji Dragon Engine",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text:
    "Prototype {2}{R} — 1/3 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\n" +
    `Flying\n${PUMP_TEXT}`,
  prototype: { cost: "{2}{R}", power: 1, toughness: 3 },
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
