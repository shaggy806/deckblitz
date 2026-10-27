import { defineCard } from "../define.js";

// EDHREC rank 8521. Mirrodin.
//
// Inspirit, Flagship Vessel's shape: a hexproof grant over "artifacts you
// control" (this creature isn't an artifact, so it isn't among them).

const TEXT = "Artifacts you control have hexproof. (They can't be the targets of spells or abilities your opponents control.)";

export default defineCard({
  name: "Leonin Abunas",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      grantKeywords: ["hexproof"],
      text: TEXT,
    },
  ],
});
