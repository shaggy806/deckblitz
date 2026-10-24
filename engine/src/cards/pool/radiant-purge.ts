import { defineCard } from "../define.js";

// EDHREC rank 19823.

export default defineCard({
  name: "Radiant Purge",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target multicolored creature or multicolored enchantment.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "enchantment"], multicolored: true } }],
  effect: { kind: "exile", target: 0 },
});
