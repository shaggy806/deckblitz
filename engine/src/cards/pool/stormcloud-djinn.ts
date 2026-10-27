import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 32247. Electric Eel's pump.

const PUMP_TEXT = "{R}{R}: This creature gets +2/+0 until end of turn and deals 1 damage to you.";

export default defineCard({
  name: "Stormcloud Djinn",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nThis creature can block only creatures with flying.\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
