import { defineCard } from "../define.js";

// EDHREC rank 26776.
//
// Rulings:
//   Once Mouser Mark III is attacking, it will remain attacking even if you no longer control any
//     other artifacts.
//
// Gadrak, the Crown-Scourge's restriction, asked as attackers are declared. A
// static's `controls` scan skips its own source, so "another artifact" is
// `atLeast: 1` (Chief Warg's Company's note).

const ATTACK_TEXT = "This creature can't attack unless you control another artifact.";

export default defineCard({
  name: "Mouser Mark III",
  manaCost: "{1}{U/R}",
  colors: ["U", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 3,
  text: ATTACK_TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 } },
      text: ATTACK_TEXT,
    },
  ],
});
