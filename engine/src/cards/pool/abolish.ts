import { defineCard } from "../define.js";

// "You may discard a Plains card rather than pay this spell's mana cost": an
// alternative cost (rule 118.9) of `mana: "{0}"` and `discard`, the Plains
// card chosen as the cost is paid, once the spell is on the stack (601.2h).
// A Plains card is one with the subtype (a nonbasic Plains too).

export default defineCard({
  name: "Abolish",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You may discard a Plains card rather than pay this spell's mana cost.\nDestroy target artifact or enchantment.",
  alternativeCost: { mana: "{0}", discard: { filter: { subtype: "Plains" }, text: "a Plains card" } },
  targets: ["artifact-or-enchantment"],
  effect: { kind: "destroy", target: 0 },
});
