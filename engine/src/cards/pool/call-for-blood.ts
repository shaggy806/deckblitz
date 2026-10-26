import { defineCard } from "../define.js";

// EDHREC rank 29133.
//
// Rulings:
//   [2004-12-01] Uses last known information for the sacrificed creature's power.
//   [2004-12-01] You must sacrifice exactly one creature to cast this spell.

export default defineCard({
  name: "Call for Blood",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nTarget creature gets -X/-X until end of turn, where X is the sacrificed creature's power.",
  // Ichor Explosion's cost and amount, on one target.
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { product: [{ powerOf: "sacrificed" }, -1] },
    toughness: { product: [{ powerOf: "sacrificed" }, -1] },
    duration: "end-of-turn",
  },
});
