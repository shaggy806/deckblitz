import { defineCard } from "../define.js";

// EDHREC rank 26317. Fifth Dawn. The count is read as it resolves.

export default defineCard({
  name: "Armed Response",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Armed Response deals damage to target attacking creature equal to the number of Equipment you control.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
  effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Equipment", controlledBy: "you" } } },
});
