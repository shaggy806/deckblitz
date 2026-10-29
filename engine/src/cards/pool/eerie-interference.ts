import { defineCard } from "../define.js";

// EDHREC rank 9426.

export default defineCard({
  name: "Eerie Interference",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to you and creatures you control this turn by creatures.",
  targets: [],
  effect: {
    kind: "damage-rule",
    to: { players: "you", permanents: { type: "creature", controlledBy: "you" } },
    by: { filter: { type: "creature" } },
  },
});
