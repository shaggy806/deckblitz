import { defineCard } from "../define.js";

// EDHREC rank 29587.

export default defineCard({
  name: "Champion's Victory",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nReturn target attacking creature to its owner's hand.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "return-to-hand", target: 0 },
});
