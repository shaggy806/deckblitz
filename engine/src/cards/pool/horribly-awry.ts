import { defineCard } from "../define.js";

export default defineCard({
  name: "Horribly Awry",
  manaCost: "{1}{U}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nCounter target creature spell with mana value 4 or less. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: [{ kind: "spell", filter: { type: "creature", manaValue: { op: "lte", n: 4 } } }],
  effect: { kind: "counter", target: 0, into: "exile" },
});
