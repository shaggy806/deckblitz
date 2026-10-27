import { defineCard } from "../define.js";

export default defineCard({
  name: "Liquify",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell with mana value 3 or less. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 3 } } }],
  effect: { kind: "counter", target: 0, into: "exile" },
});
