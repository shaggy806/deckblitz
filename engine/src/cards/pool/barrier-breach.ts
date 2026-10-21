import { defineCard } from "../define.js";

export default defineCard({
  name: "Barrier Breach",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Exile up to three target enchantments.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "any-number", of: "enchantment", min: 0, max: 3 }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
});
