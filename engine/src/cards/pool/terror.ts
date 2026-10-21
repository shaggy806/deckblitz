import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 8671.
const TEXT = "Destroy target nonartifact, nonblack creature. It can't be regenerated.";

export default defineCard({
  name: "Terror",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
