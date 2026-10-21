import { defineCard } from "../define.js";

export default defineCard({
  name: "Deny the Divine",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or enchantment spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "enchantment"] } }],
  effect: { kind: "counter", target: 0, into: "exile" },
});
