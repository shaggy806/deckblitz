import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Force of Will's alternative cost in red,
// Reverberate's copy.

export default defineCard({
  name: "Force of Rowan",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  alternativeCost: { mana: "{0}", payLife: 1, exileFromHand: { filter: { colors: ["R"] }, text: "a red card" } },
  text: "You may pay 1 life and exile a red card from your hand rather than pay this spell's mana cost.\nCopy target instant or sorcery spell. You may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: { kind: "copy-spell", target: 0, newTargets: true },
});
