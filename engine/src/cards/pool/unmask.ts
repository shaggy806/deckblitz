import { defineCard } from "../define.js";

// Rulings:
//   If you target yourself with this spell, you must reveal your entire hand to
//     the other players just as any other player would.

export default defineCard({
  name: "Unmask",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["B"] }, text: "a black card" } },
  text: "You may exile a black card from your hand rather than pay this spell's mana cost.\nTarget player reveals their hand. You choose a nonland card from it. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
});
