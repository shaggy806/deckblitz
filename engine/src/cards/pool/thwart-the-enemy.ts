import { defineCard } from "../define.js";

// EDHREC rank 14520.

export default defineCard({
  name: "Thwart the Enemy",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt this turn by creatures your opponents control.",
  targets: [],
  effect: { kind: "damage-rule", by: { filter: { type: "creature", controlledBy: "opponent" } } },
});
