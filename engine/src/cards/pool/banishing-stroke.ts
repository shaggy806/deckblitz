import { defineCard } from "../define.js";

// EDHREC rank 17339.

export default defineCard({
  name: "Banishing Stroke",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put target artifact, creature, or enchantment on the bottom of its owner's library.\nMiracle {W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  miracle: { cost: "{W}" },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
  effect: { kind: "put-on-bottom-of-library", target: 0 },
});
