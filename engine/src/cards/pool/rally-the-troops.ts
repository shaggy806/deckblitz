import { defineCard } from "../define.js";

// EDHREC rank 26798.

export default defineCard({
  name: "Rally the Troops",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nUntap all creatures you control.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
});
