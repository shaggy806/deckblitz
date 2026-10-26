import { defineCard } from "../define.js";

export default defineCard({
  name: "Faerie Trickery",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["kindred", "instant"],
  subtypes: ["Faerie"],
  text: "Counter target non-Faerie spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: [{ kind: "spell", filter: { notSubtypes: ["Faerie"] } }],
  effect: { kind: "counter", target: 0, into: "exile" },
});
