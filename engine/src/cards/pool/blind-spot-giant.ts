import { defineCard } from "../define.js";

// Rulings:
//   [2013-06-07] Blind-Spot Giant checks if you control another Giant only as you declare it as an
//     attacking or blocking creature. Once you do, if you lose control of your other Giants,
//     Blind-Spot Giant won’t stop attacking or blocking.

const TEXT = "This creature can't attack or block unless you control another Giant.";

export default defineCard({
  name: "Blind-Spot Giant",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Giant" }, atLeast: 1 } },
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});
