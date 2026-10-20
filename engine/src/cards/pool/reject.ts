import { defineCard } from "../define.js";

// EDHREC rank 18412. No More Lies over creature and planeswalker spells.

export default defineCard({
  name: "Reject",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or planeswalker spell unless its controller pays {3}. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}." }], otherwise: { kind: "counter", target: 0, into: "exile" } },
});
