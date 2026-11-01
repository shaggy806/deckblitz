import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

export default defineCard({
  name: "Noggin Whack",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["kindred", "sorcery"],
  subtypes: ["Rogue"],
  text: "Prowl {1}{B} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Rogue.)\nTarget player reveals three cards from their hand. You choose two of them. That player discards those cards.",
  alternativeCost: prowl("{1}{B}"),
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, reveals: 3, picks: 2 },
});
