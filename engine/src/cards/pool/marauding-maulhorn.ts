import { defineCard } from "../define.js";

const TEXT =
  "This creature attacks each combat if able unless you control a creature named Advocate of the Beast.";

// Checked as attackers are declared (the ruling): a live static condition.
export default defineCard({
  name: "Marauding Maulhorn",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", name: "Advocate of the Beast" }, atLeast: 1 },
      },
      restrictions: ["must-attack"],
      text: TEXT,
    },
  ],
});
