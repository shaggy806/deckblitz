import { defineCard } from "../define.js";

// EDHREC rank 19832.

export default defineCard({
  name: "Deny Existence",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: ["creature-spell"],
  effect: { kind: "counter", target: 0, into: "exile" },
});
