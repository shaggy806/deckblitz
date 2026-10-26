import { defineCard } from "../define.js";

// EDHREC rank 20620.
//
// Rulings:
//   [2013-01-24] Devour Flesh targets only a player. It doesn’t target any creatures. The target
//     player chooses which creature to sacrifice when the spell resolves. That player can
//     sacrifice only a creature they control.
//   [2013-01-24] The amount of life gained is equal to the creature’s toughness as it last existed
//     on the battlefield.

export default defineCard({
  name: "Devour Flesh",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target player sacrifices a creature of their choice, then gains life equal to that creature's toughness.",
  // The life goes to the target player (`toControllerOfTarget` of a player
  // slot is that player), the sacrificed creature's toughness as it last
  // existed; none sacrificed, no life.
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "gain-life", amount: { thisWay: "sacrificed", sumOf: "toughness" }, toControllerOfTarget: 0 },
    ],
  },
});
