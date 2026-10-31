import { defineCard } from "../define.js";

// "You may discard an Island card and another card rather than pay this
// spell's mana cost": `discard` with `others: 1`, both chosen as the cost is
// paid (601.2h) — the Island card, then any other card from what's left.

export default defineCard({
  name: "Foil",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may discard an Island card and another card rather than pay this spell's mana cost.\nCounter target spell.",
  alternativeCost: { mana: "{0}", discard: { filter: { subtype: "Island" }, others: 1, text: "an Island card and another card" } },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
