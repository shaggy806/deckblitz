import { defineCard } from "../define.js";

// EDHREC rank 21107.
//
// Orim's Cure's alternative cost; the redirection is a `damage-rule` on the
// target sending every damage event to you instead (rule 614.9), by the same
// source.

export default defineCard({
  name: "Sivvi's Valor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "If you control a Plains, you may tap an untapped creature you control rather than pay this spell's mana cost.\nAll damage that would be dealt to target creature this turn is dealt to you instead.",
  alternativeCost: {
    mana: "{0}",
    tapCreatures: { count: 1, filter: { type: "creature" } },
    condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
  },
  targets: ["creature"],
  effect: { kind: "damage-rule", to: { target: 0 }, redirectTo: "you" },
});
