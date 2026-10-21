import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 16909.
//
// Deny the Divine's counter-into-exile, then scry 1 — which still happens
// when the target can't be countered (its ruling).

export default defineCard({
  name: "No Escape",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or planeswalker spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.\nScry 1.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0, into: "exile" },
      { kind: "scry", amount: 1 },
    ],
  },
});
