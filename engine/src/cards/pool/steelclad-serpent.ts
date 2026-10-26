import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] If you control two Steelclad Serpents, they'll enable each other to attack.

const TEXT = "This creature can't attack unless you control another artifact.";

export default defineCard({
  name: "Steelclad Serpent",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 5,
  text: TEXT,
  static: [
    {
      // A static's `controls` scan skips its own source, so this is "another".
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 } },
      text: TEXT,
    },
  ],
});
