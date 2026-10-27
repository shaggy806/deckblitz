import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29840. Angelic Favor's alternative
// cost, gated on controlling a Plains as it's cast; Healing Salve's shield.

export default defineCard({
  name: "Orim's Cure",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "If you control a Plains, you may tap an untapped creature you control rather than pay this spell's mana cost.\nPrevent the next 4 damage that would be dealt to any target this turn.",
  alternativeCost: {
    mana: "{0}",
    tapCreatures: { count: 1, filter: { type: "creature" } },
    condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
  },
  targets: ["any-target"],
  effect: { kind: "prevent-damage", target: 0, amount: 4 },
});
