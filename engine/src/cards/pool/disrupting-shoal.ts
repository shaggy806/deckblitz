import { defineCard } from "../define.js";

// EDHREC rank 9495.
//
// It can target any spell and does nothing unless that spell's mana value is X
// (the ruling); the exiled card's mana value is X when it's cast for the
// alternative cost.

export default defineCard({
  name: "Disrupting Shoal",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may exile a blue card with mana value X from your hand rather than pay this spell's mana cost.\nCounter target spell if its mana value is X.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["U"] }, text: "a blue card", manaValueX: true } },
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaValue: { op: "eq", n: "x" } } },
    then: { kind: "counter", target: 0 },
  },
});
