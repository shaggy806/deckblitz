import { defineCard } from "../define.js";

// EDHREC rank 28472. Ixalan. Mouser Mark III's restriction, asked as
// attackers are declared: once attacking, it stays in combat without an
// artifact (the ruling).
const TEXT = "This creature can't attack unless you control an artifact.";

export default defineCard({
  name: "Desperate Castaways",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 } },
      text: TEXT,
    },
  ],
});
