import { defineCard } from "../define.js";

// Any card with the land type Forest (the ruling).
export default defineCard({
  name: "Snag",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You may discard a Forest card rather than pay this spell's mana cost.\nPrevent all combat damage that would be dealt by unblocked creatures this turn.",
  alternativeCost: { mana: "{0}", discard: { filter: { subtype: "Forest" }, text: "Discard a Forest card" } },
  targets: [],
  effect: { kind: "damage-rule", by: { filter: { type: "creature", unblocked: true } }, combat: true },
});
