import { defineCard } from "../define.js";

// EDHREC rank 9204. Magic 2011. Any spell; one with no targets is unchanged,
// and a modal spell keeps its modes (the rulings) — Insidious Will's shape.
export default defineCard({
  name: "Redirect",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may choose new targets for target spell.",
  targets: ["spell"],
  effect: { kind: "change-targets", target: 0, how: "choose-new" },
});
