import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31008.

const TEXT = "Whenever this creature attacks alone, it gets +2/+0 until end of turn.";

export default defineCard({
  name: "Rogue Kavu",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
