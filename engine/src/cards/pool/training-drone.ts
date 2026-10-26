import { defineCard } from "../define.js";

const TEXT = "This creature can't attack or block unless it's equipped.";

// Checked only as attackers or blockers are declared: one that stops being
// equipped later in combat stays in it (the ruling).
export default defineCard({
  name: "Training Drone",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Drone"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "source", filter: { equipped: true } } },
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});
