import { defineCard } from "../define.js";

// EDHREC rank 25109.
// `cast-this-turn` counts spells as they were cast, whatever became of them (Mogg Conscripts).

const TEXT = "This creature can't attack unless you've cast a creature spell this turn.";

export default defineCard({
  name: "Goblin Cohort",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "cast-this-turn", filter: { type: "creature" } } },
      text: TEXT,
    },
  ],
});
