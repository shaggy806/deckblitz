import { defineCard } from "../define.js";

// EDHREC rank 12446. Dissipate's effect, devoid.

export default defineCard({
  name: "Void Shatter",
  manaCost: "{1}{U}{U}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nCounter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0, into: "exile" },
});
